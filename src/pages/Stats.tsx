import { useMemo } from "react";
import { useAppState } from "@/lib/store";
import {
  cigarettesAvoided,
  dailyLimit,
  HEALTH_MILESTONES,
  lastSmokeGapMs,
  moneySaved,
  streakUnderLimit,
  todayKey,
} from "@/lib/calc";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, subDays } from "date-fns";
import { Award, DollarSign, Flame, HeartPulse, Cigarette, Trophy, Calendar, Target, Sparkles, Wind, Moon, Sunrise, PiggyBank, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { dailyLimit as _dl } from "@/lib/calc";

export default function Stats() {
  const { state } = useAppState();
  const plan = state.plan!;

  const saved = moneySaved(plan, state.logs);
  const avoided = cigarettesAvoided(plan, state.logs);
  const streak = streakUnderLimit(plan, state.logs);
  const gapMs = lastSmokeGapMs(state.logs);

  const chartData = useMemo(() => {
    const days = 14;
    const today = new Date();
    return Array.from({ length: days }).map((_, i) => {
      const d = subDays(today, days - 1 - i);
      const key = todayKey(d);
      return {
        day: format(d, "EEE d"),
        smoked: state.logs[key]?.count ?? 0,
        limit: dailyLimit(plan, d),
      };
    });
  }, [plan, state.logs]);

  const milestones = HEALTH_MILESTONES.map((m) => ({ ...m, achieved: gapMs >= m.afterMs }));
  const nextMilestone = milestones.find((m) => !m.achieved);
  const achievedCount = milestones.filter((m) => m.achieved).length;

  const achievements = [
    { id: "first-day", label: "First day logged", got: Object.keys(state.logs).length > 0, icon: Cigarette },
    { id: "streak-3", label: "3-day streak", got: streak >= 3, icon: Flame },
    { id: "streak-7", label: "Week under limit", got: streak >= 7, icon: Trophy },
    { id: "save-50", label: `Save ${plan.currency}50`, got: saved >= 50, icon: DollarSign },
    { id: "avoid-100", label: "100 cigarettes avoided", got: avoided >= 100, icon: Award },
    { id: "health-3", label: "3 health milestones", got: achievedCount >= 3, icon: HeartPulse },
  ];

  return (
    <div className="px-5 pt-8 pb-4 space-y-6">
      <header className="animate-fade-up">
        <p className="text-sm text-muted-foreground">Your progress</p>
        <h1 className="text-3xl font-semibold">Statistics</h1>
      </header>

      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <BigStat
          label="Money saved"
          value={`${plan.currency}${saved.toFixed(2)}`}
          accent="primary"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <BigStat
          label="Cigarettes avoided"
          value={avoided.toLocaleString()}
          accent="warm"
          icon={<Cigarette className="h-4 w-4" />}
        />
        <BigStat
          label="Streak under limit"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          accent="primary"
          icon={<Flame className="h-4 w-4" />}
        />
        <BigStat
          label="Health milestones"
          value={`${achievedCount} / ${milestones.length}`}
          accent="warm"
          icon={<HeartPulse className="h-4 w-4" />}
        />
      </div>

      {/* Chart */}
      <section className="bg-card rounded-3xl p-5 shadow-soft animate-fade-up">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">Last 14 days</h2>
          <span className="text-xs text-muted-foreground">Bars vs your limit</span>
        </div>
        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={1} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                cursor={{ fill: "hsl(var(--secondary))" }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="limit" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} name="Limit" />
              <Bar dataKey="smoked" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Smoked" />
              <ReferenceLine y={plan.startCount} stroke="hsl(var(--accent))" strokeDasharray="4 4" label={{ value: "Start", position: "right", fontSize: 10, fill: "hsl(var(--accent))" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Health milestones */}
      <section className="space-y-3 animate-fade-up">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Health recovery</h2>
          {nextMilestone && (
            <span className="text-xs text-muted-foreground">Next: {nextMilestone.title}</span>
          )}
        </div>
        <div className="space-y-2">
          {milestones.slice(0, 6).map((m) => (
            <div
              key={m.title}
              className={cn(
                "rounded-2xl p-4 flex items-start gap-3 border transition-smooth",
                m.achieved ? "bg-primary/8 border-primary/20" : "bg-card border-border"
              )}
            >
              <div className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                m.achieved ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                <HeartPulse className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold text-sm">{m.title}</p>
                  {m.achieved && <span className="text-[10px] uppercase tracking-wider text-primary font-bold">Done</span>}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="animate-fade-up">
        <h2 className="text-lg font-semibold mb-3">Achievements</h2>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map(({ id, label, got, icon: Icon }) => (
            <div
              key={id}
              className={cn(
                "rounded-2xl p-3 text-center border transition-smooth",
                got ? "bg-card border-primary/30 shadow-soft" : "bg-secondary/40 border-border opacity-60"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-xl mx-auto flex items-center justify-center",
                got ? "gradient-warm" : "bg-secondary"
              )}>
                <Icon className={cn("h-5 w-5", got ? "text-accent-foreground" : "text-muted-foreground")} />
              </div>
              <p className="text-[11px] mt-2 font-medium leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BigStat({ label, value, accent, icon }: { label: string; value: string; accent: "primary" | "warm"; icon: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft relative overflow-hidden">
      <div
        className={cn(
          "absolute -top-8 -right-8 h-20 w-20 rounded-full opacity-15 blur-2xl",
          accent === "primary" ? "gradient-primary" : "gradient-warm"
        )}
      />
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1.5 relative">
        {icon}<span>{label}</span>
      </div>
      <div className="text-2xl font-semibold tabular-nums leading-tight relative">{value}</div>
    </div>
  );
}
