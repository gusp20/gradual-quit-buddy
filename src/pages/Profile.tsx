import { useState } from "react";
import { useAppState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CadenceWeeks, PACE_LABEL, PACE_PERCENT, ReductionPace } from "@/lib/types";
import { cn } from "@/lib/utils";
import { dailyLimit, getCadenceLabel } from "@/lib/calc";
import { format, parseISO } from "date-fns";
import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { state, updatePlan, reset } = useAppState();
  const plan = state.plan!;
  const [name, setName] = useState(plan.name ?? "");

  return (
    <div className="px-5 pt-8 pb-4 space-y-6">
      <header className="animate-fade-up">
        <p className="text-sm text-muted-foreground">Your plan</p>
        <h1 className="text-3xl font-semibold">Profile</h1>
      </header>

      {/* Plan summary */}
      <section className="rounded-3xl gradient-hero p-6 text-primary-foreground shadow-elevated animate-fade-up">
        <p className="text-xs uppercase tracking-wider opacity-80">Today's limit</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-5xl font-semibold tabular-nums">{dailyLimit(plan)}</span>
          <span className="opacity-80">/ day</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="opacity-70 text-xs">Started</p>
            <p className="font-medium">{format(parseISO(plan.startDate), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="opacity-70 text-xs">Started at</p>
            <p className="font-medium">{plan.startCount} / day</p>
          </div>
          <div>
            <p className="opacity-70 text-xs">Pace</p>
            <p className="font-medium">{PACE_LABEL[plan.pace]} (−{PACE_PERCENT[plan.pace]}%)</p>
          </div>
          <div>
            <p className="opacity-70 text-xs">Cadence</p>
            <p className="font-medium">{getCadenceLabel(plan.cadenceWeeks)}</p>
          </div>
        </div>
      </section>

      {/* Name */}
      <section className="bg-card rounded-2xl p-5 shadow-soft animate-fade-up">
        <Label htmlFor="name">Your name</Label>
        <div className="flex gap-2 mt-1.5">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
            className="h-11"
          />
          <Button onClick={() => updatePlan({ name: name.trim() || undefined })} className="h-11 rounded-xl">
            Save
          </Button>
        </div>
      </section>

      {/* Pace */}
      <section className="bg-card rounded-2xl p-5 shadow-soft space-y-3 animate-fade-up">
        <h2 className="font-semibold">Reduction pace</h2>
        <div className="grid grid-cols-3 gap-2">
          {(["slow", "normal", "fast"] as ReductionPace[]).map((p) => (
            <button
              key={p}
              onClick={() => updatePlan({ pace: p })}
              className={cn(
                "py-3 rounded-xl border-2 text-center transition-smooth",
                plan.pace === p ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="text-sm font-semibold">{PACE_LABEL[p]}</div>
              <div className="text-[11px] text-muted-foreground">−{PACE_PERCENT[p]}%</div>
            </button>
          ))}
        </div>

        <h2 className="font-semibold pt-2">Cadence</h2>
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as CadenceWeeks[]).map((c) => (
            <button
              key={c}
              onClick={() => updatePlan({ cadenceWeeks: c })}
              className={cn(
                "py-3 rounded-xl border-2 text-center transition-smooth",
                plan.cadenceWeeks === c ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="text-base font-semibold tabular-nums">{c}w</div>
            </button>
          ))}
        </div>
      </section>

      {/* Cost */}
      <section className="bg-card rounded-2xl p-5 shadow-soft space-y-4 animate-fade-up">
        <h2 className="font-semibold">Cost of smoking</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="price">Price / pack</Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              step="0.5"
              value={plan.pricePerPack}
              onChange={(e) => updatePlan({ pricePerPack: parseFloat(e.target.value) || 0 })}
              className="mt-1.5 h-11"
            />
          </div>
          <div>
            <Label htmlFor="perpack">Cigs / pack</Label>
            <Input
              id="perpack"
              type="number"
              inputMode="numeric"
              value={plan.cigarettesPerPack}
              onChange={(e) => updatePlan({ cigarettesPerPack: parseInt(e.target.value) || 1 })}
              className="mt-1.5 h-11"
            />
          </div>
        </div>
      </section>

      {/* Reset */}
      <section className="animate-fade-up">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full h-12 rounded-2xl text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive">
              <RefreshCw className="h-4 w-4 mr-2" /> Reset all data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Reset everything?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your plan, all logged cigarettes, and your stats. You'll restart onboarding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={reset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-xs text-center text-muted-foreground mt-4">
          All your data lives only on this device. Nothing is uploaded.
        </p>
      </section>
    </div>
  );
}
