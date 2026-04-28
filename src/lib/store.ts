import { useEffect, useState, useCallback } from "react";
import { AppState, DailyLog, UserPlan } from "./types";
import { todayKey } from "./calc";

const STORAGE_KEY = "ease.app.v1";

const defaultState: AppState = {
  plan: null,
  logs: {},
  onboarded: false,
};

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function save(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

let memoryState: AppState = load();
const listeners = new Set<() => void>();

function setState(updater: (s: AppState) => AppState) {
  memoryState = updater(memoryState);
  save(memoryState);
  listeners.forEach((l) => l());
}

export function useAppState() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  const state = memoryState;

  const completeOnboarding = useCallback((plan: UserPlan) => {
    setState((s) => ({ ...s, plan, onboarded: true }));
  }, []);

  const updatePlan = useCallback((patch: Partial<UserPlan>) => {
    setState((s) => (s.plan ? { ...s, plan: { ...s.plan, ...patch } } : s));
  }, []);

  const logSmoke = useCallback(() => {
    const key = todayKey();
    setState((s) => {
      const prev: DailyLog = s.logs[key] ?? { date: key, count: 0, timestamps: [] };
      const next: DailyLog = { ...prev, count: prev.count + 1, timestamps: [...prev.timestamps, Date.now()] };
      return { ...s, logs: { ...s.logs, [key]: next } };
    });
  }, []);

  const undoSmoke = useCallback(() => {
    const key = todayKey();
    setState((s) => {
      const prev = s.logs[key];
      if (!prev || prev.count === 0) return s;
      const next: DailyLog = { ...prev, count: prev.count - 1, timestamps: prev.timestamps.slice(0, -1) };
      return { ...s, logs: { ...s.logs, [key]: next } };
    });
  }, []);

  const reset = useCallback(() => {
    setState(() => defaultState);
  }, []);

  return { state, completeOnboarding, updatePlan, logSmoke, undoSmoke, reset };
}
