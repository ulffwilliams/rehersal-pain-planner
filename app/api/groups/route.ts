import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, members } = await req.json();

    if (!name?.trim() || !Array.isArray(members) || members.length < 1) {
      return NextResponse.json({ error: 'name and members required' }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql`INSERT INTO groups (name) VALUES (${name.trim()}) RETURNING id, name`;
    const group = rows[0];

    const memberRows = await Promise.all(
      members.map((nickname: string) =>
        sql`INSERT INTO members (group_id, nickname) VALUES (${group.id}, ${nickname.trim()}) RETURNING id, nickname`
      )
    );

    return NextResponse.json({ id: group.id, name: group.name, members: memberRows.flat() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
