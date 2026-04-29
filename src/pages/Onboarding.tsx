import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CadenceWeeks, PACE_LABEL, PACE_PERCENT, ReductionPace, UserPlan } from "@/lib/types";
import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ArrowRight, Leaf, Check, ShieldCheck } from "lucide-react";

const STEPS = 5;

export default function Onboarding() {
  const { completeOnboarding } = useAppState();
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(20);
  const [pace, setPace] = useState<ReductionPace>("normal");
  const [cadence, setCadence] = useState<CadenceWeeks>(2);
  const [pricePerPack, setPricePerPack] = useState(8);
  const [cigarettesPerPack, setCigarettesPerPack] = useState(20);

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    const plan: UserPlan = {
      startDate: new Date().toISOString(),
      startCount: count,
      pace,
      cadenceWeeks: cadence,
      pricePerPack,
      cigarettesPerPack,
      currency: "$",
    };
    completeOnboarding(plan);
  };

  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col px-6 pt-12 pb-8 safe-top">
        {/* Progress */}
        <div className="flex gap-1.5 mb-10">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-smooth",
                i <= step ? "gradient-primary" : "bg-border"
              )}
            />
          ))}
        </div>

        <div className="flex-1 animate-fade-up" key={step}>
          {step === 0 && (
            <div className="space-y-8">
              <div className="h-16 w-16 rounded-3xl gradient-primary shadow-glow flex items-center justify-center">
                <Leaf className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight">Welcome to Ease</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Quitting cold turkey rarely sticks. Ease helps you cut down step by step — at a pace your body can follow.
                </p>
              </div>
              <ul className="space-y-3 text-sm">
                {["Set your starting daily count", "Pick how fast you want to reduce", "Track every cigarette and your savings"].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-foreground/80">
                    <span className="h-6 w-6 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-semibold mb-2">How many a day?</h2>
                <p className="text-muted-foreground">Roughly how many cigarettes do you smoke on a typical day right now?</p>
              </div>
              <div className="bg-card rounded-3xl p-8 shadow-soft text-center">
                <div className="text-7xl font-semibold text-primary tabular-nums">{count}</div>
                <div className="text-sm text-muted-foreground mt-1">cigarettes / day</div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full mt-6 accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span><span>100</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-semibold mb-2">Your pace</h2>
                <p className="text-muted-foreground">Pick how aggressively you want to reduce each cycle.</p>
              </div>
              <div className="space-y-3">
                {(["slow", "normal", "fast"] as ReductionPace[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPace(p)}
                    className={cn(
                      "w-full text-left p-5 rounded-2xl border-2 transition-smooth bg-card",
                      pace === p ? "border-primary shadow-soft" : "border-transparent hover:border-border"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold text-lg">{PACE_LABEL[p]}</span>
                      <span className="text-primary font-semibold tabular-nums">−{PACE_PERCENT[p]}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {p === "slow" && "Gentle — for long-term smokers."}
                      {p === "normal" && "Balanced and sustainable."}
                      {p === "fast" && "Ambitious — quicker to zero."}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <h3 className="font-semibold mb-3">How often should the reduction happen?</h3>
                <div className="grid grid-cols-4 gap-2">
                  {([1, 2, 3, 4] as CadenceWeeks[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCadence(c)}
                      className={cn(
                        "py-4 rounded-2xl border-2 text-center transition-smooth bg-card",
                        cadence === c ? "border-primary shadow-soft" : "border-transparent"
                      )}
                    >
                      <div className="text-2xl font-semibold tabular-nums">{c}</div>
                      <div className="text-[11px] text-muted-foreground">{c === 1 ? "week" : "weeks"}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-semibold mb-2">Cost of a pack</h2>
                <p className="text-muted-foreground">So we can show you how much money you're saving.</p>
              </div>
              <div className="bg-card rounded-3xl p-6 shadow-soft space-y-5">
                <div>
                  <Label htmlFor="price">Price per pack</Label>
                  <Input
                    id="price"
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={pricePerPack}
                    onChange={(e) => setPricePerPack(parseFloat(e.target.value) || 0)}
                    className="mt-1.5 h-12 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="perpack">Cigarettes per pack</Label>
                  <Input
                    id="perpack"
                    type="number"
                    inputMode="numeric"
                    value={cigarettesPerPack}
                    onChange={(e) => setCigarettesPerPack(parseInt(e.target.value) || 0)}
                    className="mt-1.5 h-12 text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="h-16 w-16 rounded-3xl gradient-primary shadow-glow flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold mb-2">Your data stays here</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ease works fully offline. No account, no sign-up, nothing sent to the cloud.
                </p>
              </div>
              <div className="bg-card rounded-3xl p-5 shadow-soft space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center mt-0.5">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <p className="text-foreground/80">Everything is saved only on this device.</p>
                </div>
                <div className="flex gap-3">
                  <span className="h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center mt-0.5">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <p className="text-foreground/80">If you delete the app or switch phones, your progress won't sync over.</p>
                </div>
                <div className="flex gap-3">
                  <span className="h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center mt-0.5">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <p className="text-foreground/80">No tracking, no ads, no third parties.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={back} size="lg" className="flex-1 h-14 rounded-2xl">
              Back
            </Button>
          )}
          {step < STEPS - 1 ? (
            <Button onClick={next} size="lg" className="flex-1 h-14 rounded-2xl gradient-primary text-primary-foreground border-0 shadow-soft text-base">
              Continue <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={finish} size="lg" className="flex-1 h-14 rounded-2xl gradient-primary text-primary-foreground border-0 shadow-soft text-base">
              I understand
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
