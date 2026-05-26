import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { memberId, groupId, responses } = await req.json();

    if (!memberId || !groupId || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: 'memberId, groupId, responses required' }, { status: 400 });
    }

    const sql = getDb();
    await Promise.all(
      responses.map(({ dayOfWeek, painScore }: { dayOfWeek: number; painScore: number }) =>
        sql`
          INSERT INTO responses (member_id, group_id, day_of_week, pain_score)
          VALUES (${memberId}, ${groupId}, ${dayOfWeek}, ${painScore})
          ON CONFLICT (member_id, day_of_week) DO UPDATE
            SET pain_score = ${painScore}, submitted_at = NOW()
        `
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
