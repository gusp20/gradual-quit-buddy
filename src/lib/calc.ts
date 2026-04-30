import { differenceInCalendarDays, format, parseISO, startOfDay, subDays } from "date-fns";
import { CadenceWeeks, DailyLog, PACE_PERCENT, ReductionPace, UserPlan } from "./types";

export const todayKey = (d: Date = new Date()) => format(startOfDay(d), "yyyy-MM-dd");

/** Returns the daily allowance for a given date based on the plan. */
export function dailyLimit(plan: UserPlan, date: Date = new Date()): number {
  const start = parseISO(plan.startDate);
  const days = Math.max(0, differenceInCalendarDays(startOfDay(date), startOfDay(start)));
  const cycle = Math.floor(days / (plan.cadenceWeeks * 7));
  const factor = Math.pow(1 - PACE_PERCENT[plan.pace] / 100, cycle);
  return Math.max(0, Math.round(plan.startCount * factor));
}

export function nextLimit(plan: UserPlan, date: Date = new Date()): { limit: number; daysUntil: number } {
  const start = parseISO(plan.startDate);
  const days = Math.max(0, differenceInCalendarDays(startOfDay(date), startOfDay(start)));
  const cycleLen = plan.cadenceWeeks * 7;
  const currentCycle = Math.floor(days / cycleLen);
  const daysIntoCycle = days - currentCycle * cycleLen;
  const daysUntil = cycleLen - daysIntoCycle;
  const factor = Math.pow(1 - PACE_PERCENT[plan.pace] / 100, currentCycle + 1);
  return { limit: Math.max(0, Math.round(plan.startCount * factor)), daysUntil };
}

export function moneySaved(plan: UserPlan, logs: Record<string, DailyLog>): number {
  const start = parseISO(plan.startDate);
  const today = startOfDay(new Date());
  const days = differenceInCalendarDays(today, startOfDay(start)) + 1;
  if (days <= 0) return 0;
  const pricePerCig = plan.pricePerPack / plan.cigarettesPerPack;
  let saved = 0;
  for (let i = 0; i < days; i++) {
    const d = subDays(today, days - 1 - i);
    const key = todayKey(d);
    const log = logs[key];
    // Only credit days the user actually logged — otherwise we'd reward inactivity.
    if (!log) continue;
    saved += (plan.startCount - log.count) * pricePerCig;
  }
  return Math.max(0, saved);
}

export function cigarettesAvoided(plan: UserPlan, logs: Record<string, DailyLog>): number {
  const start = parseISO(plan.startDate);
  const today = startOfDay(new Date());
  const days = differenceInCalendarDays(today, startOfDay(start)) + 1;
  if (days <= 0) return 0;
  let avoided = 0;
  for (let i = 0; i < days; i++) {
    const d = subDays(today, days - 1 - i);
    const log = logs[todayKey(d)];
    if (!log) continue;
    avoided += Math.max(0, plan.startCount - log.count);
  }
  return avoided;
}

export function streakUnderLimit(plan: UserPlan, logs: Record<string, DailyLog>): number {
  let streak = 0;
  const today = startOfDay(new Date());
  for (let i = 0; i < 365; i++) {
    const d = subDays(today, i);
    const key = todayKey(d);
    const limit = dailyLimit(plan, d);
    const log = logs[key];
    // Streak requires an actual log for that day. Today is allowed to be empty
    // (we won't penalize you for not having smoked yet) but it doesn't add to the streak either.
    if (!log) {
      if (i === 0) continue;
      break;
    }
    if (log.count <= limit) streak++;
    else break;
  }
  return streak;
}

export function lastSmokeGapMs(logs: Record<string, DailyLog>): number {
  let latest = 0;
  Object.values(logs).forEach((l) => {
    l.timestamps.forEach((t) => { if (t > latest) latest = t; });
  });
  if (!latest) return 0;
  return Date.now() - latest;
}

/** Reduction milestones based on cutting back from the starting count. */
export type ReductionMilestone = {
  id: string;
  title: string;
  body: string;
  /** Predicate: did the user reach this milestone? */
  achieved: (ctx: { reductionPct: number; smokeFreeDays: number; daysSinceStart: number }) => boolean;
};

export const REDUCTION_MILESTONES: ReductionMilestone[] = [
  { id: "cut-25", title: "25% reduction", body: "You're smoking a quarter less than when you started.", achieved: (c) => c.reductionPct >= 25 },
  { id: "cut-50", title: "Halfway there", body: "You've cut your daily intake in half.", achieved: (c) => c.reductionPct >= 50 },
  { id: "cut-75", title: "75% reduction", body: "Down to a quarter of where you began.", achieved: (c) => c.reductionPct >= 75 },
  { id: "first-week", title: "First week logged", body: "Seven days of tracking — the habit is forming.", achieved: (c) => c.daysSinceStart >= 7 },
  { id: "first-month", title: "One month in", body: "A full month of conscious effort.", achieved: (c) => c.daysSinceStart >= 30 },
  { id: "free-1", title: "First smoke-free day", body: "A whole day without a single cigarette.", achieved: (c) => c.smokeFreeDays >= 1 },
  { id: "free-7", title: "7 smoke-free days", body: "A full smoke-free week.", achieved: (c) => c.smokeFreeDays >= 7 },
  { id: "free-30", title: "30 smoke-free days", body: "A smoke-free month — huge milestone.", achieved: (c) => c.smokeFreeDays >= 30 },
  { id: "free-90", title: "90 smoke-free days", body: "Three months smoke-free. You did it.", achieved: (c) => c.smokeFreeDays >= 90 },
];

/** Counts logged days where count === 0. */
export function smokeFreeDaysCount(logs: Record<string, DailyLog>): number {
  return Object.values(logs).filter((l) => l.count === 0).length;
}

/** Current reduction percentage based on today's limit vs the starting count. */
export function currentReductionPercent(plan: UserPlan, date: Date = new Date()): number {
  if (plan.startCount <= 0) return 0;
  const limit = dailyLimit(plan, date);
  return Math.max(0, Math.min(100, Math.round(((plan.startCount - limit) / plan.startCount) * 100)));
}

export function getCadenceLabel(c: CadenceWeeks) {
  return c === 1 ? "Every week" : `Every ${c} weeks`;
}

export function getPaceDescription(p: ReductionPace) {
  return `${PACE_PERCENT[p]}% fewer per cycle`;
}
