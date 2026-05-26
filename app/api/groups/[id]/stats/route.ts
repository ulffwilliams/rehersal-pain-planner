import { NextRequest, NextResponse } from 'next/server';
import { getGroupStats } from '@/lib/queries';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stats = await getGroupStats(id);

    if (!stats) {
      return NextResponse.json({ allVoted: false }, { status: 202 });
    }

    return NextResponse.json({ ...stats, allVoted: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
