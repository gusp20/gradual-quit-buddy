export type ReductionPace = "slow" | "normal" | "fast";
export type CadenceWeeks = 1 | 2 | 3 | 4;

export interface UserPlan {
  startDate: string; // ISO date
  startCount: number; // cigarettes/day at start
  pace: ReductionPace; // % reduction per cycle
  cadenceWeeks: CadenceWeeks;
  pricePerPack: number;
  cigarettesPerPack: number;
  currency: string;
  name?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  count: number;
  timestamps: number[]; // epoch ms of each smoke
}

export interface AppState {
  plan: UserPlan | null;
  logs: Record<string, DailyLog>;
  onboarded: boolean;
}

export const PACE_PERCENT: Record<ReductionPace, number> = {
  slow: 5,
  normal: 10,
  fast: 20,
};

export const PACE_LABEL: Record<ReductionPace, string> = {
  slow: "Slow",
  normal: "Normal",
  fast: "Fast",
};
