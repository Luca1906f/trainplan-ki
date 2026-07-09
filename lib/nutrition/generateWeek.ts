import type { MacroTargets, DietForm, DietStyle } from './macros';
import type { PlanDay } from './types';
import { containsAllergen } from './allergyGuard';

export const TAGE = [
  'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag',
];

export interface WeekBase {
  targets: MacroTargets;
  dietForm: DietForm;
  dietStyle: DietStyle;
  preferences: string;
  allergies: string[];
  mealSlots: string[];
}

async function generateDayWithRetry(payload: any, tries = 2): Promise<PlanDay> {
  for (let a = 0; a <= tries; a++) {
    try {
      const res = await fetch('/api/nutrition/generate-day', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const day = (await res.json()) as PlanDay;
      if (!day.meals?.length) throw new Error('leerer Tag');
      return day;
    } catch (e) {
      if (a === tries) throw e;
      await new Promise((r) => setTimeout(r, 800 * (a + 1)));
    }
  }
  throw new Error('unreachable');
}

// Sequentiell wegen avoidMeals (Abwechslung). onDay -> progressiv rendern.
export async function generateWeek(
  base: WeekBase,
  onDay?: (d: PlanDay, index: number) => void,
): Promise<{ days: PlanDay[]; ok: boolean }> {
  const days: PlanDay[] = [];
  const seen: string[] = [];
  try {
    for (let i = 0; i < TAGE.length; i++) {
      const payload = { ...base, dayLabel: TAGE[i], avoidMeals: seen };
      let day = await generateDayWithRetry(payload);
      let guard = 0;
      while (containsAllergen(day, base.allergies) && guard < 2) {
        day = await generateDayWithRetry(payload);
        guard++;
      }
      day.meals.forEach((m) => seen.push(m.name));
      days.push(day);
      onDay?.(day, i);
    }
    return { days, ok: true };
  } catch {
    return { days, ok: false };
  }
}
