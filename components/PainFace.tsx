'use client';

import Image from 'next/image';

const FACES = [
  { label: 'Det fungerar perfekt', color: '#22c55e' },
  { label: 'Det fungerar bra', color: '#86efac' },
  { label: 'Det går', color: '#fbbf24' },
  { label: 'Det är lite jobbigt', color: '#fb923c' },
  { label: 'Det är ganska jobbigt', color: '#ef4444' },
  { label: 'Jag kan absolut inte', color: '#991b1b' },
];

const SIZES: Record<string, number> = {
  sm: 36,
  md: 52,
  lg: 68,
  xl: 88,
};

interface PainFaceProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  selected?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
}

export function PainFace({ value, size = 'md', selected = false, onClick, showLabel = false }: PainFaceProps) {
  const idx = Math.max(0, Math.min(5, value - 1));
  const face = FACES[idx];
  const px = SIZES[size];

  return (
    <div
      className={`flex flex-col items-center gap-1 ${onClick ? 'cursor-pointer select-none' : ''}`}
      onClick={onClick}
    >
      <div
        style={{
          width: px,
          height: px,
          border: selected ? '3px solid black' : '2px solid black',
          boxShadow: selected ? '3px 3px 0 black' : '2px 2px 0 black',
          transform: selected ? 'scale(1.12)' : 'scale(1)',
          transition: 'transform 0.12s ease, box-shadow 0.12s ease',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: face.color,
        }}
        className={onClick ? 'hover:scale-110' : ''}
      >
        <Image
          src={`/${value}.png`}
          alt={face.label}
          width={px}
          height={px}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-center max-w-[80px] leading-tight">{face.label}</span>
      )}
    </div>
  );
}

export const PAIN_LABELS = FACES.map(f => f.label);
export const PAIN_EMOJIS = ['😄', '🙂', '😐', '😕', '😢', '😭'];
export const PAIN_COLORS = FACES.map(f => f.color);
