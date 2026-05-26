'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PainFace, PAIN_EMOJIS, PAIN_COLORS } from './PainFace';
import type { DaySummary } from '@/lib/types';

const MOOD: Record<string, string> = {
  perfect: '🎉 Hela bandet är med!',
  great: '👍 Det funkar för de flesta',
  okay: '🤷 Delat — kräver kompromiss',
  tough: '😬 Svårt för flera i bandet',
  blocked: '🚫 Dålig repdag',
  bad: '🚫 Dålig repdag',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTick = (props: any) => {
  const { x, y, payload } = props;
  if (!payload) return null;
  return (
    <text x={x} y={y + 14} textAnchor="middle" fontSize="16">
      {PAIN_EMOJIS[payload.value - 1]}
    </text>
  );
};

interface DayStatsProps {
  day: DaySummary;
  dayName: string;
}

export function DayStats({ day, dayName }: DayStatsProps) {
  const avgRounded = Math.max(1, Math.min(6, Math.round(day.avg)));

  const chartData = [1, 2, 3, 4, 5, 6].map(score => ({
    score,
    count: day.scores.filter(s => s === score).length,
    color: PAIN_COLORS[score - 1],
  }));

  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0_black] p-4">
      <h3 className="text-xl font-black mb-4">{dayName}</h3>

      <div className="flex items-center gap-4 mb-4">
        <PainFace value={avgRounded} size="lg" />
        <div>
          <p className="text-3xl font-black">{day.avg.toFixed(1)}</p>
          <p className="text-sm font-bold text-gray-600">{MOOD[day.classification]}</p>
        </div>
      </div>

      <div className="mb-4" style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 28, left: 0 }}>
            <XAxis dataKey="score" tick={<CustomTick />} interval={0} />
            <YAxis allowDecimals={false} width={24} tick={{ fontSize: 11 }} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${v} röst${v !== 1 ? 'er' : ''}`, 'Antal']}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(l: any) => `Poäng ${l}`}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="black" strokeWidth={1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-1.5">
        {day.memberScores.map(ms => (
          <div key={ms.memberId} className="flex items-center justify-between border border-black p-2">
            <span className="font-bold text-sm">{ms.nickname}</span>
            <PainFace value={ms.score} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
