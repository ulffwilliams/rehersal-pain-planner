'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PainFace } from './PainFace';
import { VotingCard } from './VotingCard';
import { ProgressBar } from './ProgressBar';

const DAY_NAMES = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

interface Member {
  id: string;
  nickname: string;
  hasVoted: boolean;
}

interface VotingFlowProps {
  groupId: string;
  groupName: string;
  members: Member[];
}

export function VotingFlow({ groupId, groupName, members }: VotingFlowProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Member | null>(null);
  const [day, setDay] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (member: Member) => {
    setSelected(member);
    setDay(0);
    setScores({});
  };

  const handleScore = (score: number) => setScores(prev => ({ ...prev, [day]: score }));

  const handleNext = () => setDay(d => d + 1);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selected.id,
          groupId,
          responses: Object.entries(scores).map(([d, s]) => ({
            dayOfWeek: Number(d),
            painScore: s,
          })),
        }),
      });
      router.push(`/group/${groupId}/stats`);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (!selected) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-4 max-w-lg mx-auto">
        <h1 className="text-3xl font-black mb-2">{groupName}</h1>
        <p className="text-lg font-bold mb-6 border-b-2 border-black pb-4">Vem är du?</p>

        <div className="flex flex-col gap-3">
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => handleSelect(m)}
              className="border-2 border-black bg-white shadow-[4px_4px_0_black] p-4 text-left font-bold text-lg hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-between"
            >
              <span>{m.nickname}</span>
              {m.hasVoted ? (
                <span className="text-sm bg-green-400 border-2 border-black px-2 py-1">✅ Röstat klart</span>
              ) : (
                <span className="text-sm bg-yellow-300 border-2 border-black px-2 py-1">⏳ Ej röstat</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3, 4, 5, 6].map(v => <PainFace key={v} value={v} size="sm" />)}
        </div>
      </div>
    );
  }

  const currentScore = scores[day] ?? null;
  const isLast = day === 6;

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 max-w-lg mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-black">{selected.nickname}</h1>
        <button onClick={() => setSelected(null)} className="text-sm underline font-bold">
          ← Byt person
        </button>
      </div>

      <div className="mb-6">
        <ProgressBar current={day + 1} total={7} />
      </div>

      <VotingCard
        key={day}
        dayName={DAY_NAMES[day]}
        selectedScore={currentScore}
        onSelect={handleScore}
      />

      <div className="mt-4">
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={!currentScore || submitting}
            className="w-full border-2 border-black bg-yellow-300 shadow-[4px_4px_0_black] p-4 font-black text-lg hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Skickar...' : 'Skicka mina svar 🎸'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!currentScore}
            className="w-full border-2 border-black bg-yellow-300 shadow-[4px_4px_0_black] p-4 font-black text-lg hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Nästa dag →
          </button>
        )}
      </div>
    </div>
  );
}
