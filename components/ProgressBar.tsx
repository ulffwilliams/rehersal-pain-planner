interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-black">Dag {current} av {total}</span>
        <span className="text-sm font-black">{pct}%</span>
      </div>
      <div className="w-full h-4 border-2 border-black bg-white">
        <div
          className="h-full bg-yellow-300 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
