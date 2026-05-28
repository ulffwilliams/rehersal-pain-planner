'use client';

import { useState } from 'react';
import { PainFace } from './PainFace';
import { DayStats } from './DayStats';
import { DAY_NAMES, getDayLabel } from '@/lib/insights';
import type { StatsData } from '@/lib/types';

interface StatsViewProps {
  groupName: string;
  stats: StatsData;
}

export function StatsView({ groupName, stats }: StatsViewProps) {
  const [selectedIdx, setSelectedIdx] = useState(stats.bestDay);

  const best = stats.days[stats.bestDay];
  const worst = stats.days[stats.worstDay];
  const cd = stats.customDates;

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 max-w-2xl mx-auto pb-12">
      <h1 className="text-3xl font-black mb-1">{groupName}</h1>
      <h2 className="text-xl font-bold mb-6 border-b-2 border-black pb-4">Dagstatistik</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border-2 border-black bg-green-400 shadow-[4px_4px_0_black] p-4">
          <p className="text-xs font-black uppercase mb-1">Bästa dagen</p>
          <p className="font-black text-lg">{getDayLabel(best.dayOfWeek, cd)}</p>
          <div className="flex items-center gap-2 mt-2">
            <PainFace value={Math.max(1, Math.min(6, Math.round(best.avg)))} size="md" />
            <span className="font-black text-xl">{best.avg.toFixed(1)}</span>
          </div>
        </div>
        <div className="border-2 border-black bg-red-300 shadow-[4px_4px_0_black] p-4">
          <p className="text-xs font-black uppercase mb-1">Sämsta dagen</p>
          <p className="font-black text-lg">{getDayLabel(worst.dayOfWeek, cd)}</p>
          <div className="flex items-center gap-2 mt-2">
            <PainFace value={Math.max(1, Math.min(6, Math.round(worst.avg)))} size="md" />
            <span className="font-black text-xl">{worst.avg.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-black mb-3">Veckoöversikt</h3>
      <div className={`grid gap-1 mb-6 ${stats.days.length <= 7 ? 'grid-cols-7' : 'grid-cols-4'}`}>
        {stats.days.map((d, idx) => {
          const avg = Math.max(1, Math.min(6, Math.round(d.avg)));
          const label = getDayLabel(d.dayOfWeek, cd);
          const shortLabel = cd ? label.slice(0, 6) : DAY_NAMES[d.dayOfWeek].slice(0, 3);
          return (
            <button
              key={d.dayOfWeek}
              onClick={() => setSelectedIdx(idx)}
              className={`border-2 border-black p-1.5 flex flex-col items-center gap-1 transition-all ${
                idx === selectedIdx
                  ? 'bg-yellow-300 shadow-none translate-x-[2px] translate-y-[2px]'
                  : 'bg-white shadow-[2px_2px_0_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
              }`}
            >
              <span className="text-[9px] font-black leading-none">
                {shortLabel}
              </span>
              <PainFace value={avg} size="sm" />
              <span className="text-[9px] font-bold">{d.avg.toFixed(1)}</span>
            </button>
          );
        })}
      </div>

      {stats.days[selectedIdx] && (
        <>
          <h3 className="text-lg font-black mb-3">
            {getDayLabel(stats.days[selectedIdx].dayOfWeek, cd)} — detaljer
          </h3>
          <DayStats day={stats.days[selectedIdx]} dayName={getDayLabel(stats.days[selectedIdx].dayOfWeek, cd)} />
        </>
      )}

      <div className="mt-8 flex justify-center">
        <a
          href="/"
          className="border-2 border-black bg-white shadow-[3px_3px_0_black] px-4 py-2 font-bold text-sm hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          + Skapa ny röstning
        </a>
      </div>
    </div>
  );
}
