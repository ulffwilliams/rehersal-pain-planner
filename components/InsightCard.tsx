import { PainFace } from './PainFace';
import type { InsightItem, DaySummary } from '@/lib/types';

interface InsightCardProps {
  insight: InsightItem;
  day?: DaySummary;
  highlighted?: boolean;
}

export function InsightCard({ insight, day, highlighted }: InsightCardProps) {
  const avgRounded = day ? Math.max(1, Math.min(6, Math.round(day.avg))) : null;

  return (
    <div
      className={`border-2 border-black shadow-[4px_4px_0_black] p-4 flex items-center gap-3 ${
        highlighted ? 'bg-yellow-300' : 'bg-white'
      }`}
    >
      <span className="text-2xl shrink-0">{insight.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">{insight.label}</p>
        {day && <p className="text-xs text-gray-600 mt-0.5">Snitt: {day.avg.toFixed(1)}</p>}
      </div>
      {avgRounded && <PainFace value={avgRounded} size="sm" />}
    </div>
  );
}
