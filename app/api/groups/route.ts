import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, members, mode, customDates } = await req.json();

    if (!name?.trim() || !Array.isArray(members) || members.length < 1) {
      return NextResponse.json({ error: 'name and members required' }, { status: 400 });
    }

    const resolvedMode = mode === 'dates' ? 'dates' : 'weekly';
    if (resolvedMode === 'dates' && (!Array.isArray(customDates) || customDates.length < 1)) {
      return NextResponse.json({ error: 'customDates required for dates mode' }, { status: 400 });
    }

    const sql = getDb();
    const rows = resolvedMode === 'dates'
      ? await sql`INSERT INTO groups (name, mode, custom_dates) VALUES (${name.trim()}, 'dates', ${customDates}) RETURNING id, name, mode, custom_dates`
      : await sql`INSERT INTO groups (name, mode) VALUES (${name.trim()}, 'weekly') RETURNING id, name, mode, custom_dates`;
    const group = rows[0];

    const memberRows = await Promise.all(
      members.map((nickname: string) =>
        sql`INSERT INTO members (group_id, nickname) VALUES (${group.id}, ${nickname.trim()}) RETURNING id, nickname`
      )
    );

    return NextResponse.json({ id: group.id, name: group.name, mode: group.mode, customDates: group.custom_dates, members: memberRows.flat() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
