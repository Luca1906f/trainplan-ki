import type { Meal } from '@/lib/nutrition/types';
import { mealTotals } from '@/lib/nutrition/totals';

export function MealCard({ meal }: { meal: Meal }) {
  const t = mealTotals(meal);
  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{meal.mealType}</div>
          <div className="font-medium">{meal.name}</div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {t.kcal} kcal · {t.proteinG}P {t.carbsG}C {t.fatG}F
        </div>
      </div>
      <ul className="space-y-1 text-sm">
        {meal.items.map((i, idx) => (
          <li key={idx} className="flex justify-between text-foreground/80">
            <span>{i.foodName} · {i.amountG} g</span>
            <span className="text-muted-foreground">{i.kcal} kcal</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
