import type { PlanDay } from './types';

export function containsAllergen(day: PlanDay, allergies: string[]): boolean {
  if (!allergies?.length) return false;
  const hay = day.meals
    .flatMap((m) => [m.name, ...m.items.map((i) => i.foodName)])
    .join(' ')
    .toLowerCase();
  return allergies.some((a) => hay.includes(a.trim().toLowerCase()));
}
