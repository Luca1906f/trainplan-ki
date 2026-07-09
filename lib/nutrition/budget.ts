const KCAL_PER_KG_FAT = 7700;

export interface DayBudget {
  eaten: number;
  rest: number;
  kgPerWeek: number;
  allChecked: boolean;
}

export function dayBudget(
  targetKcal: number,
  meals: { kcal: number; checked: boolean }[],
): DayBudget {
  const eaten = meals.filter((m) => m.checked).reduce((s, m) => s + m.kcal, 0);
  const rest = targetKcal - eaten;
  const kgPerWeek = +((Math.abs(rest) * 7) / KCAL_PER_KG_FAT).toFixed(2);
  const allChecked = meals.length > 0 && meals.every((m) => m.checked);
  return { eaten, rest, kgPerWeek, allChecked };
}

export function budgetMessage(b: DayBudget): string {
  if (b.allChecked && b.rest > 0)
    return `Kein Hunger mehr? Lass es stehen — bei ~${b.rest} kcal/Tag sind das rund ${b.kgPerWeek} kg mehr pro Woche.`;
  if (b.rest > 150)
    return `Noch ${b.rest} kcal frei — Platz für ein Spaßgetränk 🍹 oder einen Snack.`;
  if (b.rest >= 0) return 'Fast am Ziel für heute.';
  return 'Heute leicht drüber — morgen wieder, kein Ding.';
}
