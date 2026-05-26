'use client';

const FACES = [
  { emoji: '😄', bg: '#22c55e', label: 'Det fungerar perfekt' },
  { emoji: '🙂', bg: '#86efac', label: 'Det fungerar bra' },
  { emoji: '😐', bg: '#fbbf24', label: 'Det går' },
  { emoji: '😕', bg: '#fb923c', label: 'Det är lite jobbigt' },
  { emoji: '😢', bg: '#ef4444', label: 'Det är ganska jobbigt' },
  { emoji: '😭', bg: '#991b1b', label: 'Jag kan absolut inte' },
];

const SIZES: Record<string, { px: number; fontSize: string }> = {
  sm: { px: 36, fontSize: '1.1rem' },
  md: { px: 52, fontSize: '1.6rem' },
  lg: { px: 68, fontSize: '2rem' },
  xl: { px: 88, fontSize: '2.6rem' },
};

interface PainFaceProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  selected?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
}

export function PainFace({ value, size = 'md', selected = false, onClick, showLabel = false }: PainFaceProps) {
  const face = FACES[Math.max(0, Math.min(5, value - 1))];
  const dim = SIZES[size];

  return (
    <div
      className={`flex flex-col items-center gap-1 ${onClick ? 'cursor-pointer select-none' : ''}`}
      onClick={onClick}
    >
      <div
        style={{
          width: dim.px,
          height: dim.px,
          backgroundColor: face.bg,
          fontSize: dim.fontSize,
          border: selected ? '3px solid black' : '2px solid black',
          boxShadow: selected ? '3px 3px 0 black' : '2px 2px 0 black',
          transform: selected ? 'scale(1.12)' : 'scale(1)',
          transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        }}
        className={`rounded-full flex items-center justify-center ${
          onClick ? 'hover:scale-110' : ''
        }`}
      >
        {face.emoji}
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-center max-w-[80px] leading-tight">{face.label}</span>
      )}
    </div>
  );
}

export const PAIN_LABELS = FACES.map(f => f.label);
export const PAIN_EMOJIS = FACES.map(f => f.emoji);
export const PAIN_COLORS = FACES.map(f => f.bg);
