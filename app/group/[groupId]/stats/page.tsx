import { notFound } from 'next/navigation';
import { WaitingScreen } from '@/components/WaitingScreen';
import { StatsView } from '@/components/StatsView';
import { getGroupWithMembers, getGroupStats } from '@/lib/queries';

export default async function StatsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;

  const [group, stats] = await Promise.all([
    getGroupWithMembers(groupId),
    getGroupStats(groupId),
  ]);

  if (!group) return notFound();

  if (!stats) {
    return (
      <WaitingScreen
        groupId={groupId}
        groupName={group.name}
        initialMembers={group.members}
      />
    );
  }

  return <StatsView groupName={group.name} stats={stats} />;
}
