/**
 * Trainingsplan-Typen. Bewusst 1:1 zur Supabase-Struktur
 * (plans → plan_days → plan_exercises → sets), damit das Speichern eine
 * reine Abbildung ohne Umrechnung ist — und damit App, PDF und DOCX
 * dieselbe Quelle nutzen.
 */

export type SetType = 'normal' | 'warmup' | 'dropset';
export type ProgressionType = 'linear' | 'double_progression' | 'none';

export interface TrainingSet {
  setOrder: number;
  setType: SetType;
  /** null = AMRAP (so viele wie möglich) */
  reps: number | null;
  /** null = offen / Körpergewicht */
  weightKg: number | null;
  /** Reps In Reserve — wie viele Wiederholungen noch im Tank bleiben */
  rir: number | null;
  pauseSeconds: number | null;
}

export interface TrainingExercise {
  /** Anzeigename, immer gesetzt — unabhängig von der Übungsbibliothek */
  name: string;
  /** Optionaler Verweis in die Bibliothek (lib/training/exercises.ts) */
  exerciseId?: string;
  exerciseOrder: number;
  notes: string;
  progressionType: ProgressionType;
  progressionIncrementKg: number;
  progressionMinReps: number;
  progressionMaxReps: number;
  sets: TrainingSet[];
}

export interface TrainingDay {
  name: string;
  dayOrder: number;
  notes: string;
  exercises: TrainingExercise[];
}

/**
 * Ein kompletter Planentwurf, wie ihn die KI liefert und der Editor
 * bearbeitet. Erst beim Speichern wird daraus ein `plans`-Datensatz.
 */
export interface TrainingPlanDraft {
  name: string;
  description: string;
  days: TrainingDay[];
}

/** Eingaben, aus denen die KI den Plan erzeugt. */
export interface TrainingPlanInput {
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'general';
  experience: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  /** Verfügbares Equipment — die KI darf nur passende Übungen wählen. */
  equipment: Equipment[];
  sessionMinutes: number;
  /** Freitext: Einschränkungen, Verletzungen, Wünsche. */
  notes?: string;
  clientName?: string;
}

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'fullbody'
  | 'cardio';
