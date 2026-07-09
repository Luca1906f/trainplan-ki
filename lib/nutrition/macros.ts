export type Sex = 'male' | 'female';
export type Goal = 'cut' | 'maintain' | 'bulk';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';
export type Somatotype = 'ecto' | 'meso' | 'endo';
export type DietForm = 'standard' | 'keto' | 'lowcarb' | 'highprotein';
export type DietStyle = 'omnivore' | 'vegetarian' | 'vegan';

export interface MacroInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  activity: Activity;
  goal: Goal;
  somatotype: Somatotype;
  dietForm: DietForm;
}

export interface MacroTargets {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  formula: 'katch-mcardle' | 'mifflin';
}

const ACTIVITY: Record<Activity, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725, athlete: 1.9,
};
const GOAL_FACTOR: Record<Goal, number> = { cut: 0.8, maintain: 1.0, bulk: 1.1 };
const FAT_PCT: Record<Somatotype, number> = { ecto: 0.2, meso: 0.25, endo: 0.35 };

function bmr(i: MacroInput): { value: number; formula: MacroTargets['formula'] } {
  if (i.bodyFatPct != null) {
    const lbm = i.weightKg * (1 - i.bodyFatPct / 100);
    return { value: 370 + 21.6 * lbm, formula: 'katch-mcardle' };
  }
  const v = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age + (i.sex === 'male' ? 5 : -161);
  return { value: v, formula: 'mifflin' };
}

export function calcMacros(i: MacroInput): MacroTargets {
  const b = bmr(i);
  const kcal = Math.round(b.value * ACTIVITY[i.activity] * GOAL_FACTOR[i.goal]);
  let proteinG: number, fatG: number, carbsG: number;

  switch (i.dietForm) {
    case 'keto':
      carbsG = 25;
      proteinG = Math.round(i.weightKg * 1.8);
      fatG = Math.max(0, Math.round((kcal - proteinG * 4 - carbsG * 4) / 9));
      break;
    case 'lowcarb':
      proteinG = Math.round(i.weightKg * 2.0);
      fatG = Math.round((kcal * 0.4) / 9);
      carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));
      break;
    case 'highprotein':
      proteinG = Math.round(i.weightKg * 2.4);
      fatG = Math.round((kcal * 0.25) / 9);
      carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));
      break;
    default: {
      const perKg = i.goal === 'cut' ? 2.2 : i.goal === 'bulk' ? 1.8 : 2.0;
      proteinG = Math.round(i.weightKg * perKg);
      fatG = Math.round((kcal * FAT_PCT[i.somatotype]) / 9);
      carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));
    }
  }
  return { kcal, proteinG, carbsG, fatG, formula: b.formula };
}

export const macrosKcal = (t: Pick<MacroTargets, 'proteinG' | 'carbsG' | 'fatG'>) =>
  t.proteinG * 4 + t.carbsG * 4 + t.fatG * 9;

export const GOAL_LABEL: Record<Goal, string> = { cut: 'Cut', maintain: 'Maintain', bulk: 'Bulk' };
