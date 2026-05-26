export interface Group {
  id: string;
  name: string;
  mode: 'weekly' | 'dates';
  customDates?: string[];
  created_at: string;
}

export interface Member {
  id: string;
  group_id: string;
  nickname: string;
}

export interface MemberWithStatus {
  id: string;
  nickname: string;
  hasVoted: boolean;
}

export interface DaySummary {
  dayOfWeek: number;
  avg: number;
  max: number;
  min: number;
  scores: number[];
  memberScores: { memberId: string; nickname: string; score: number }[];
  classification: string;
}

export interface StatsData {
  days: DaySummary[];
  bestDay: number;
  worstDay: number;
  insights: InsightItem[];
  customDates?: string[];
}

export interface InsightItem {
  dayOfWeek: number;
  classification: string;
  label: string;
}
