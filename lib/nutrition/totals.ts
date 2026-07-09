import type { Meal, PlanDay } from './types';

const zero = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };

export function mealTotals(m: Meal) {
  return m.items.reduce(
    (a, i) => ({
      kcal: a.kcal + i.kcal, proteinG: a.proteinG + i.proteinG,
      carbsG: a.carbsG + i.carbsG, fatG: a.fatG + i.fatG,
    }),
    { ...zero },
  );
}

export function dayTotals(d: PlanDay) {
  return d.meals.map(mealTotals).reduce(
    (a, t) => ({
      kcal: a.kcal + t.kcal, proteinG: a.proteinG + t.proteinG,
      carbsG: a.carbsG + t.carbsG, fatG: a.fatG + t.fatG,
    }),
    { ...zero },
  );
}
