import { notFound } from 'next/navigation';
import { VotingFlow } from '@/components/VotingFlow';
import { getGroupWithMembers } from '@/lib/queries';

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = await getGroupWithMembers(groupId);
  if (!group) return notFound();

  return (
    <VotingFlow
      groupId={groupId}
      groupName={group.name}
      members={group.members}
    />
  );
}
