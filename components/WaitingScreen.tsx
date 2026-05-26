'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PainFace } from './PainFace';

interface Member {
  id: string;
  nickname: string;
  hasVoted: boolean;
}

interface WaitingScreenProps {
  groupId: string;
  groupName: string;
  initialMembers: Member[];
}

export function WaitingScreen({ groupId, groupName, initialMembers }: WaitingScreenProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      setMembers(data.members);
      setLastRefresh(new Date());
      if (data.allVoted) router.refresh();
    } finally {
      setRefreshing(false);
    }
  }, [groupId, router]);

  useEffect(() => {
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const voted = members.filter(m => m.hasVoted).length;

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 max-w-lg mx-auto">
      <h1 className="text-3xl font-black mb-6">{groupName}</h1>

      <div className="border-2 border-black bg-white shadow-[4px_4px_0_black] p-6 mb-6">
        <h2 className="text-xl font-black mb-1">Väntar på bandet... 🥁</h2>
        <p className="font-bold mb-4 text-gray-600">
          {voted} av {members.length} har röstat
        </p>

        <div className="flex flex-col gap-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between border-2 border-black p-3 bg-white">
              <span className="font-bold">{m.nickname}</span>
              {m.hasVoted ? (
                <span className="bg-green-400 border-2 border-black px-2 py-1 text-sm font-bold">✅ Klar</span>
              ) : (
                <span className="bg-red-200 border-2 border-black px-2 py-1 text-sm font-bold">❌ Saknas</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 items-center mb-2">
        <div className="flex gap-1">
          {[1, 3, 5].map(v => <PainFace key={v} value={v} size="sm" />)}
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex-1 border-2 border-black bg-yellow-300 shadow-[4px_4px_0_black] p-3 font-black hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-60"
        >
          {refreshing ? 'Uppdaterar...' : 'Uppdatera'}
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Senast: {lastRefresh.toLocaleTimeString('sv-SE')} · Uppdateras var 30:e sekund
      </p>
    </div>
  );
}
