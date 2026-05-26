import { getDb } from './db';
import { classifyDay, generateInsights, findBestDay, findWorstDay } from './insights';
import type { MemberWithStatus, StatsData, DaySummary } from './types';

export async function getGroupWithMembers(groupId: string) {
  const sql = getDb();
  const rows = await sql`SELECT id, name, mode, custom_dates FROM groups WHERE id = ${groupId}`;
  const group = rows[0];
  if (!group) return null;

  const customDates: string[] | null = group.custom_dates as string[] | null;
  const expectedCount = group.mode === 'dates' && customDates ? customDates.length : 7;

  const members = await sql`
    SELECT
      m.id,
      m.nickname,
      (COUNT(r.id) = ${expectedCount}) AS has_voted
    FROM members m
    LEFT JOIN responses r ON r.member_id = m.id
    WHERE m.group_id = ${groupId}
    GROUP BY m.id, m.nickname
    ORDER BY m.nickname
  `;

  return {
    id: group.id as string,
    name: group.name as string,
    mode: (group.mode ?? 'weekly') as 'weekly' | 'dates',
    customDates: customDates ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    members: members.map((m: any) => ({
      id: m.id as string,
      nickname: m.nickname as string,
      hasVoted: Boolean(m.has_voted),
    })) as MemberWithStatus[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allVoted: members.every((m: any) => Boolean(m.has_voted)),
  };
}

export async function getGroupStats(groupId: string): Promise<StatsData | null> {
  const sql = getDb();

  const groupRows = await sql`SELECT mode, custom_dates FROM groups WHERE id = ${groupId}`;
  const group = groupRows[0];
  if (!group) return null;

  const customDates: string[] | null = group.custom_dates as string[] | null;
  const expectedCount = group.mode === 'dates' && customDates ? customDates.length : 7;

  const notVoted = await sql`
    SELECT m.id FROM members m
    LEFT JOIN responses r ON r.member_id = m.id AND r.group_id = ${groupId}
    WHERE m.group_id = ${groupId}
    GROUP BY m.id
    HAVING COUNT(r.id) < ${expectedCount}
  `;

  if (notVoted.length > 0) return null;

  const dayRows = await sql`
    SELECT
      r.day_of_week,
      AVG(r.pain_score)::numeric(4,2) AS avg_score,
      MAX(r.pain_score) AS max_score,
      MIN(r.pain_score) AS min_score,
      ARRAY_AGG(r.pain_score ORDER BY r.pain_score) AS scores
    FROM responses r
    WHERE r.group_id = ${groupId}
    GROUP BY r.day_of_week
    ORDER BY r.day_of_week
  `;

  const memberRows = await sql`
    SELECT r.day_of_week, r.pain_score, m.id AS member_id, m.nickname
    FROM responses r
    JOIN members m ON m.id = r.member_id
    WHERE r.group_id = ${groupId}
    ORDER BY r.day_of_week, r.pain_score
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const days: DaySummary[] = dayRows.map((row: any) => {
    const avg = parseFloat(row.avg_score);
    const max = Number(row.max_score);
    return {
      dayOfWeek: row.day_of_week as number,
      avg,
      max,
      min: Number(row.min_score),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scores: (row.scores as any[]).map(Number),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      memberScores: memberRows
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((mr: any) => mr.day_of_week === row.day_of_week)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((mr: any) => ({
          memberId: mr.member_id as string,
          nickname: mr.nickname as string,
          score: Number(mr.pain_score),
        })),
      classification: classifyDay({ avg, max }),
    };
  });

  return {
    days,
    bestDay: findBestDay(days),
    worstDay: findWorstDay(days),
    insights: generateInsights(days, customDates ?? undefined),
    customDates: customDates ?? undefined,
  };
}
