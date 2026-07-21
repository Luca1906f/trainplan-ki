import { z } from 'zod';
import type { TrainingPlanDraft } from './types';

/** Eingaben aus dem Generator-Formular. */
export const trainingPlanInputSchema = z.object({
  goal: z.enum(['strength', 'hypertrophy', 'endurance', 'general']),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  daysPerWeek: z.number().int().min(1).max(7),
  equipment: z
    .array(z.enum(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'bands']))
    .min(1),
  sessionMinutes: z.number().int().min(20).max(180),
  notes: z.string().max(500).optional(),
  clientName: z.string().max(120).optional(),
});

const setSchema = z.object({
  setOrder: z.number().int().min(0),
  setType: z.enum(['normal', 'warmup', 'dropset']),
  reps: z.number().int().min(1).max(100).nullable(),
  weightKg: z.number().min(0).max(500).nullable(),
  rir: z.number().int().min(0).max(10).nullable(),
  pauseSeconds: z.number().int().min(0).max(600).nullable(),
});

const exerciseSchema = z.object({
  name: z.string().min(1).max(120),
  exerciseId: z.string().max(60).optional(),
  exerciseOrder: z.number().int().min(0),
  notes: z.string().max(300).default(''),
  progressionType: z.enum(['linear', 'double_progression', 'none']).default('none'),
  progressionIncrementKg: z.number().min(0).max(50).default(2.5),
  progressionMinReps: z.number().int().min(1).max(50).default(8),
  progressionMaxReps: z.number().int().min(1).max(50).default(12),
  sets: z.array(setSchema).min(1).max(12),
});

const daySchema = z.object({
  name: z.string().min(1).max(80),
  dayOrder: z.number().int().min(0),
  notes: z.string().max(300).default(''),
  exercises: z.array(exerciseSchema).min(1).max(15),
});

/**
 * Validiert einen kompletten Planentwurf — egal ob er von der KI kommt oder
 * im Editor bearbeitet wurde. Nichts Unvalidiertes darf in die DB.
 */
export const trainingPlanDraftSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(600).default(''),
  days: z.array(daySchema).min(1).max(7),
});

/**
 * Nicht-blockierende Hinweise: der Plan ist gültig, sieht aber
 * trainingswissenschaftlich auffällig aus. Der Coach entscheidet.
 */
export function planWarnings(plan: TrainingPlanDraft): string[] {
  const w: string[] = [];

  for (const day of plan.days) {
    const sets = day.exercises.reduce((s, e) => s + e.sets.length, 0);
    if (sets > 30) {
      w.push(`„${day.name}“: ${sets} Sätze — sehr hohes Volumen für eine Einheit.`);
    }
    if (sets < 6) {
      w.push(`„${day.name}“: nur ${sets} Sätze — als vollwertige Einheit eher wenig.`);
    }
    if (day.exercises.length > 0 && !day.exercises.some((e) => e.sets.length > 0)) {
      w.push(`„${day.name}“: Übungen ohne Sätze.`);
    }
  }

  if (plan.days.length >= 6) {
    w.push('6+ Trainingstage pro Woche — auf ausreichend Regeneration achten.');
  }

  return w;
}
