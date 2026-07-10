'use client';

import { useState } from 'react';
import type { PlanDay } from '@/lib/nutrition/types';
import type { MacroTargets } from '@/lib/nutrition/macros';
import { dayTotals } from '@/lib/nutrition/totals';
import { MealCard } from './MealCard';

function offTarget(actual: number, target: number) {
  return Math.abs(actual - target) / target > 0.05; // ±5 %
}

export function WeeklyPlanView({
  days, targets, onRegenerate,
}: {
  days: PlanDay[];
  targets: MacroTargets;
  onRegenerate?: (index: number) => void;
}) {
  const [active, setActive] = useState(0);
  if (!days.length) return null;
  const day = days[active];
  const t = dayTotals(day);
  const flagged = offTarget(t.kcal, targets.kcal);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-lg px-3 py-1 text-sm ${
              i === active ? 'bg-primary text-primary-foreground' : 'border'
            }`}
          >
            {d.dayLabel.slice(0, 2)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground/80">
          {t.kcal} kcal · {t.proteinG}P {t.carbsG}C {t.fatG}F
          <span className="text-muted-foreground"> / Ziel {targets.kcal} kcal</span>
        </span>
        {onRegenerate && (
          <button onClick={() => onRegenerate(active)} className="rounded-lg border px-2 py-1 text-xs">
            Tag neu
          </button>
        )}
      </div>

      {flagged && (
        <p className="text-xs text-destructive">
          Weicht deutlich vom Ziel ab — Tag ggf. neu generieren.
        </p>
      )}

      <div className="space-y-2">
        {day.meals.map((m, i) => (
          <MealCard key={i} meal={m} />
        ))}
      </div>

      {day.tips?.length > 0 && (
        <div className="rounded-lg bg-muted p-3 text-sm text-foreground/80">
          {day.tips.map((tip, i) => (
            <p key={i}>💡 {tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}
