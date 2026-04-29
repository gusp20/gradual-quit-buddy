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

/** Health milestones based on time since last cigarette. */
export const HEALTH_MILESTONES: { afterMs: number; title: string; body: string }[] = [
  { afterMs: 20 * 60 * 1000, title: "20 minutes", body: "Heart rate and blood pressure drop." },
  { afterMs: 12 * 60 * 60 * 1000, title: "12 hours", body: "Carbon monoxide in blood returns to normal." },
  { afterMs: 24 * 60 * 60 * 1000, title: "1 day", body: "Risk of heart attack starts to decrease." },
  { afterMs: 2 * 24 * 60 * 60 * 1000, title: "2 days", body: "Sense of taste and smell improve." },
  { afterMs: 3 * 24 * 60 * 60 * 1000, title: "3 days", body: "Bronchial tubes relax — easier breathing." },
  { afterMs: 14 * 24 * 60 * 60 * 1000, title: "2 weeks", body: "Circulation and lung function improve." },
  { afterMs: 30 * 24 * 60 * 60 * 1000, title: "1 month", body: "Coughing and shortness of breath decrease." },
  { afterMs: 90 * 24 * 60 * 60 * 1000, title: "3 months", body: "Lung function increases up to 30%." },
  { afterMs: 365 * 24 * 60 * 60 * 1000, title: "1 year", body: "Risk of coronary heart disease cut in half." },
];

export function getCadenceLabel(c: CadenceWeeks) {
  return c === 1 ? "Every week" : `Every ${c} weeks`;
}

export function getPaceDescription(p: ReductionPace) {
  return `${PACE_PERCENT[p]}% fewer per cycle`;
}
