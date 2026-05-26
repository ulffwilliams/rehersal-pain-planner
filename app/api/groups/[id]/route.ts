import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const sql = getDb();
    const groups = await sql`SELECT id, name FROM groups WHERE id = ${id}`;
    if (!groups[0]) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    const members = await sql`
      SELECT
        m.id,
        m.nickname,
        (COUNT(r.id) = 7) AS has_voted
      FROM members m
      LEFT JOIN responses r ON r.member_id = m.id
      WHERE m.group_id = ${id}
      GROUP BY m.id, m.nickname
      ORDER BY m.nickname
    `;

    return NextResponse.json({
      id: groups[0].id,
      name: groups[0].name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      members: members.map((m: any) => ({
        id: m.id as string,
        nickname: m.nickname as string,
        hasVoted: Boolean(m.has_voted),
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allVoted: members.every((m: any) => Boolean(m.has_voted)),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
