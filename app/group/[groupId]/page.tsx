import { notFound, redirect } from 'next/navigation';
import { VotingFlow } from '@/components/VotingFlow';
import { getGroupWithMembers } from '@/lib/queries';

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = await getGroupWithMembers(groupId);
  if (!group) return notFound();
  if (group.allVoted) redirect(`/group/${groupId}/stats`);

  return (
    <VotingFlow
      groupId={groupId}
      groupName={group.name}
      members={group.members}
      mode={group.mode}
      customDates={group.customDates}
    />
  );
}
