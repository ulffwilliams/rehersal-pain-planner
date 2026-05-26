import type { DaySummary, InsightItem } from './types';

export const DAY_NAMES = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

export function classifyDay(summary: { avg: number; max: number }): string {
  if (summary.max === 6) return 'blocked';
  if (summary.avg <= 2.0) return 'perfect';
  if (summary.avg <= 2.8) return 'great';
  if (summary.avg <= 3.5) return 'okay';
  if (summary.avg <= 4.5) return 'tough';
  return 'bad';
}

function classificationToInsight(classification: string, dayName: string): { label: string;} {
  switch (classification) {
    case 'blocked': return { label: `${dayName} fungerar inte — någon kan absolut inte` };
    case 'perfect': return { label: `${dayName} passar alla perfekt`};
    case 'great': return { label: `${dayName} funkar bra för alla`};
    case 'okay': return { label: `${dayName} är lite delat`};
    case 'tough': return { label: `${dayName} är svårt för många — undvik om möjligt`};
    default: return { label: `${dayName} är en dålig dag`};
  }
}

export function formatCustomDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

export function getDayLabel(dayOfWeek: number, customDates?: string[]): string {
  if (customDates?.[dayOfWeek]) return formatCustomDate(customDates[dayOfWeek]);
  return DAY_NAMES[dayOfWeek] ?? `Dag ${dayOfWeek + 1}`;
}

export function generateInsights(days: DaySummary[], customDates?: string[]): InsightItem[] {
  return days.map(day => {
    const dayName = getDayLabel(day.dayOfWeek, customDates);
    const { label } = classificationToInsight(day.classification, dayName);
    return { dayOfWeek: day.dayOfWeek, classification: day.classification, label };
  });
}

export function findBestDay(days: DaySummary[]): number {
  let bestIdx = 0;
  for (let i = 1; i < days.length; i++) {
    if (days[i].avg < days[bestIdx].avg) bestIdx = i;
  }
  return bestIdx;
}

export function findWorstDay(days: DaySummary[]): number {
  let worstIdx = 0;
  for (let i = 1; i < days.length; i++) {
    if (
      days[i].max > days[worstIdx].max ||
      (days[i].max === days[worstIdx].max && days[i].avg > days[worstIdx].avg)
    ) {
      worstIdx = i;
    }
  }
  return worstIdx;
}
