import { z } from 'zod';
import type { MacroTargets } from './macros';

export const macroInputSchema = z.object({
  sex: z.enum(['male', 'female']),
  age: z.number().int().min(14).max(100),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(300),
  bodyFatPct: z.number().min(3).max(60).optional(),
  activity: z.enum(['sedentary', 'light', 'moderate', 'high', 'athlete']),
  goal: z.enum(['cut', 'maintain', 'bulk']),
  somatotype: z.enum(['ecto', 'meso', 'endo']),
  dietForm: z.enum(['standard', 'keto', 'lowcarb', 'highprotein']),
});

export function targetWarnings(t: MacroTargets, weightKg: number): string[] {
  const w: string[] = [];
  if (t.kcal < 1200) w.push('Sehr niedrige Kalorien — eher Richtung Erhaltung gehen.');
  if (t.fatG < weightKg * 0.5)
    w.push('Fett rechnerisch sehr niedrig — bei Keto die kcal erhöhen oder Diätform wechseln.');
  return w;
}
