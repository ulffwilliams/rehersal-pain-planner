'use client';

import { PainFace, PAIN_LABELS } from './PainFace';

interface VotingCardProps {
  dayName: string;
  selectedScore: number | null;
  onSelect: (score: number) => void;
}

export function VotingCard({ dayName, selectedScore, onSelect }: VotingCardProps) {
  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0_black] p-6 voting-card-enter">
      <h2 className="text-xl font-black mb-6 text-center">
        Hur passar {dayName} för dig?
      </h2>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 justify-items-center mb-6">
        {[1, 2, 3, 4, 5, 6].map(score => (
          <div key={score} className="flex flex-col items-center gap-1">
            <PainFace value={score} size="lg" selected={selectedScore === score} onClick={() => onSelect(score)} />
            <span className="text-xs font-bold">{score}</span>
          </div>
        ))}
      </div>

      {selectedScore && (
        <div className="border-2 border-black bg-yellow-100 p-3 flex items-center gap-3">
          <PainFace value={selectedScore} size="md" selected />
          <p className="font-bold text-sm">{PAIN_LABELS[selectedScore - 1]}</p>
        </div>
      )}
    </div>
  );
}
