import { useMemo, useState } from "react";
import { useAppState } from "@/lib/store";
import { dailyLimit, nextLimit, todayKey, lastSmokeGapMs } from "@/lib/calc";
import { Button } from "@/components/ui/button";
import { Cigarette, Undo2, Sparkles, Flame, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";

export default function Home() {
  const { state, logSmoke, undoSmoke } = useAppState();
  const plan = state.plan!;
  const [pop, setPop] = useState(0);

  const today = state.logs[todayKey()];
  const count = today?.count ?? 0;
  const limit = useMemo(() => dailyLimit(plan), [plan, today]);
  const next = useMemo(() => nextLimit(plan), [plan]);
  const gapMs = lastSmokeGapMs(state.logs);
  const overLimit = count > limit;
  const remaining = Math.max(0, limit - count);
  const progress = limit === 0 ? (count > 0 ? 100 : 0) : Math.min(100, (count / limit) * 100);

  const handleSmoke = () => {
    logSmoke();
    setPop((p) => p + 1);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <div className="px-5 pt-8 pb-4 space-y-6">
      <header className="flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-sm text-muted-foreground">Today</p>
          <h1 className="text-2xl font-semibold">
            {greeting()}{plan.name ? `, ${plan.name}` : ""}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Daily limit</p>
          <p className="text-2xl font-semibold tabular-nums text-primary">{limit}</p>
        </div>
      </header>

      {/* Hero counter */}
      <div className="relative bg-card rounded-[2rem] p-7 shadow-soft overflow-hidden animate-fade-up">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full gradient-primary opacity-10 blur-3xl" />
        <div className="relative">
          <p className="text-sm text-muted-foreground mb-1">Smoked today</p>
          <div className="flex items-baseline gap-2">
            <span
              key={pop}
              className={cn(
                "text-7xl font-semibold tabular-nums leading-none",
                overLimit ? "text-destructive" : "text-foreground",
                pop > 0 && "animate-count-pop"
              )}
            >
              {count}
            </span>
            <span className="text-xl text-muted-foreground">/ {limit}</span>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-2.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-smooth",
                overLimit ? "bg-destructive" : "gradient-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className={cn("mt-3 text-sm font-medium", overLimit ? "text-destructive" : "text-muted-foreground")}>
            {overLimit
              ? `${count - limit} over your limit — be kind to yourself, tomorrow restarts.`
              : remaining === 0
                ? "You've hit your limit for today. You've got this."
                : `${remaining} left for today`}
          </p>
        </div>
      </div>

      {/* The big action */}
      <div className="flex flex-col items-center pt-2 animate-fade-up">
        <button
          onClick={handleSmoke}
          className="relative h-44 w-44 rounded-full gradient-primary text-primary-foreground shadow-elevated active:scale-95 transition-bounce animate-pulse-ring"
          aria-label="I smoked"
        >
          <span className="absolute inset-0 rounded-full bg-white/0 active:bg-white/10 transition" />
          <div className="flex flex-col items-center gap-2">
            <Cigarette className="h-10 w-10" strokeWidth={2.2} />
            <span className="text-lg font-semibold tracking-tight">I smoked</span>
          </div>
        </button>

        {count > 0 && (
          <Button
            onClick={undoSmoke}
            variant="ghost"
            size="sm"
            className="mt-4 rounded-full text-muted-foreground"
          >
            <Undo2 className="h-4 w-4 mr-1.5" /> Undo last
          </Button>
        )}
      </div>

      {/* Mini insights */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <InsightCard
          icon={<Wind className="h-4 w-4" />}
          label="Last cigarette"
          value={gapMs > 0 ? formatDistanceToNowStrict(Date.now() - gapMs) : "—"}
          sub={gapMs > 0 ? "ago" : "none today"}
        />
        <InsightCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Next limit"
          value={String(next.limit)}
          sub={`in ${next.daysUntil} day${next.daysUntil === 1 ? "" : "s"}`}
        />
      </div>

      {/* Tip */}
      <div className="bg-secondary/60 border border-border rounded-2xl p-4 flex gap-3 animate-fade-up">
        <Flame className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80 leading-relaxed">
          Cravings usually pass in 3–5 minutes. Try a glass of water, a short walk, or three slow breaths before reaching for one.
        </p>
      </div>
    </div>
  );
}

function InsightCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1.5">
        {icon}<span>{label}</span>
      </div>
      <div className="text-xl font-semibold tabular-nums leading-tight">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
