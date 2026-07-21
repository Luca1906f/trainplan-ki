import type { Equipment, MuscleGroup } from './types';

/**
 * Kuratierte Übungsbibliothek. Sie ist die gemeinsame Grundlage für
 * KI-Erzeugung, Editor-Auswahl, PDF/DOCX und die TRYME-App. Der Anzeigename
 * wird beim Speichern mit in `plan_exercises.name` geschrieben, damit jede
 * Ausgabe auch ohne diese Datei lesbar bleibt.
 */
export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  equipment: Equipment[];
  /** Mehrgelenkig (Grundübung) vs. isoliert — steuert die Reihenfolge im Plan. */
  compound: boolean;
}

export const EXERCISES: Exercise[] = [
  // ── Brust ────────────────────────────────────────────────────────────
  { id: 'bench_press', name: 'Bankdrücken', muscle: 'chest', equipment: ['barbell'], compound: true },
  { id: 'db_bench_press', name: 'Kurzhantel-Bankdrücken', muscle: 'chest', equipment: ['dumbbell'], compound: true },
  { id: 'incline_bench', name: 'Schrägbankdrücken', muscle: 'chest', equipment: ['barbell', 'dumbbell'], compound: true },
  { id: 'chest_press_machine', name: 'Brustpresse', muscle: 'chest', equipment: ['machine'], compound: true },
  { id: 'cable_fly', name: 'Kabelzug-Fliegende', muscle: 'chest', equipment: ['cable'], compound: false },
  { id: 'pec_deck', name: 'Butterfly', muscle: 'chest', equipment: ['machine'], compound: false },
  { id: 'push_up', name: 'Liegestütze', muscle: 'chest', equipment: ['bodyweight'], compound: true },
  { id: 'dips_chest', name: 'Dips (Brust)', muscle: 'chest', equipment: ['bodyweight'], compound: true },

  // ── Rücken ───────────────────────────────────────────────────────────
  { id: 'deadlift', name: 'Kreuzheben', muscle: 'back', equipment: ['barbell'], compound: true },
  { id: 'pull_up', name: 'Klimmzüge', muscle: 'back', equipment: ['bodyweight'], compound: true },
  { id: 'lat_pulldown', name: 'Latzug', muscle: 'back', equipment: ['cable', 'machine'], compound: true },
  { id: 'barbell_row', name: 'Langhantelrudern', muscle: 'back', equipment: ['barbell'], compound: true },
  { id: 'db_row', name: 'Kurzhantelrudern', muscle: 'back', equipment: ['dumbbell'], compound: true },
  { id: 'cable_row', name: 'Kabelrudern sitzend', muscle: 'back', equipment: ['cable'], compound: true },
  { id: 't_bar_row', name: 'T-Bar-Rudern', muscle: 'back', equipment: ['barbell', 'machine'], compound: true },
  { id: 'straight_arm_pulldown', name: 'Überzüge am Kabel', muscle: 'back', equipment: ['cable'], compound: false },
  { id: 'hyperextension', name: 'Rückenstrecken', muscle: 'back', equipment: ['bodyweight', 'machine'], compound: false },

  // ── Schultern ────────────────────────────────────────────────────────
  { id: 'overhead_press', name: 'Schulterdrücken', muscle: 'shoulders', equipment: ['barbell'], compound: true },
  { id: 'db_shoulder_press', name: 'Kurzhantel-Schulterdrücken', muscle: 'shoulders', equipment: ['dumbbell'], compound: true },
  { id: 'arnold_press', name: 'Arnold-Press', muscle: 'shoulders', equipment: ['dumbbell'], compound: true },
  { id: 'lateral_raise', name: 'Seitheben', muscle: 'shoulders', equipment: ['dumbbell', 'cable'], compound: false },
  { id: 'front_raise', name: 'Frontheben', muscle: 'shoulders', equipment: ['dumbbell'], compound: false },
  { id: 'reverse_fly', name: 'Reverse Flys', muscle: 'shoulders', equipment: ['dumbbell', 'machine'], compound: false },
  { id: 'face_pull', name: 'Face Pulls', muscle: 'shoulders', equipment: ['cable', 'bands'], compound: false },

  // ── Bizeps ───────────────────────────────────────────────────────────
  { id: 'barbell_curl', name: 'Langhantel-Curls', muscle: 'biceps', equipment: ['barbell'], compound: false },
  { id: 'db_curl', name: 'Kurzhantel-Curls', muscle: 'biceps', equipment: ['dumbbell'], compound: false },
  { id: 'hammer_curl', name: 'Hammer-Curls', muscle: 'biceps', equipment: ['dumbbell'], compound: false },
  { id: 'preacher_curl', name: 'Scott-Curls', muscle: 'biceps', equipment: ['machine', 'barbell'], compound: false },
  { id: 'cable_curl', name: 'Kabel-Curls', muscle: 'biceps', equipment: ['cable'], compound: false },

  // ── Trizeps ──────────────────────────────────────────────────────────
  { id: 'triceps_pushdown', name: 'Trizepsdrücken am Kabel', muscle: 'triceps', equipment: ['cable'], compound: false },
  { id: 'skull_crusher', name: 'Stirndrücken', muscle: 'triceps', equipment: ['barbell', 'dumbbell'], compound: false },
  { id: 'close_grip_bench', name: 'Enges Bankdrücken', muscle: 'triceps', equipment: ['barbell'], compound: true },
  { id: 'overhead_triceps', name: 'Überkopf-Trizepsdrücken', muscle: 'triceps', equipment: ['dumbbell', 'cable'], compound: false },
  { id: 'dips_triceps', name: 'Dips (Trizeps)', muscle: 'triceps', equipment: ['bodyweight'], compound: true },

  // ── Beine: Quadrizeps ────────────────────────────────────────────────
  { id: 'squat', name: 'Kniebeugen', muscle: 'quads', equipment: ['barbell'], compound: true },
  { id: 'front_squat', name: 'Frontkniebeugen', muscle: 'quads', equipment: ['barbell'], compound: true },
  { id: 'leg_press', name: 'Beinpresse', muscle: 'quads', equipment: ['machine'], compound: true },
  { id: 'lunges', name: 'Ausfallschritte', muscle: 'quads', equipment: ['dumbbell', 'bodyweight'], compound: true },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', muscle: 'quads', equipment: ['dumbbell', 'bodyweight'], compound: true },
  { id: 'goblet_squat', name: 'Goblet Squat', muscle: 'quads', equipment: ['kettlebell', 'dumbbell'], compound: true },
  { id: 'leg_extension', name: 'Beinstrecker', muscle: 'quads', equipment: ['machine'], compound: false },

  // ── Beine: Beinbeuger / Gesäß ────────────────────────────────────────
  { id: 'romanian_deadlift', name: 'Rumänisches Kreuzheben', muscle: 'hamstrings', equipment: ['barbell', 'dumbbell'], compound: true },
  { id: 'leg_curl', name: 'Beinbeuger', muscle: 'hamstrings', equipment: ['machine'], compound: false },
  { id: 'good_morning', name: 'Good Mornings', muscle: 'hamstrings', equipment: ['barbell'], compound: true },
  { id: 'nordic_curl', name: 'Nordic Curls', muscle: 'hamstrings', equipment: ['bodyweight'], compound: false },
  { id: 'hip_thrust', name: 'Hip Thrust', muscle: 'glutes', equipment: ['barbell', 'bodyweight'], compound: true },
  { id: 'glute_bridge', name: 'Glute Bridge', muscle: 'glutes', equipment: ['bodyweight', 'barbell'], compound: false },
  { id: 'cable_kickback', name: 'Kickbacks am Kabel', muscle: 'glutes', equipment: ['cable'], compound: false },

  // ── Waden ────────────────────────────────────────────────────────────
  { id: 'standing_calf_raise', name: 'Wadenheben stehend', muscle: 'calves', equipment: ['machine', 'bodyweight'], compound: false },
  { id: 'seated_calf_raise', name: 'Wadenheben sitzend', muscle: 'calves', equipment: ['machine'], compound: false },

  // ── Rumpf ────────────────────────────────────────────────────────────
  { id: 'plank', name: 'Plank', muscle: 'core', equipment: ['bodyweight'], compound: false },
  { id: 'crunch', name: 'Crunches', muscle: 'core', equipment: ['bodyweight'], compound: false },
  { id: 'leg_raise', name: 'Beinheben', muscle: 'core', equipment: ['bodyweight'], compound: false },
  { id: 'russian_twist', name: 'Russian Twists', muscle: 'core', equipment: ['bodyweight', 'kettlebell'], compound: false },
  { id: 'cable_crunch', name: 'Crunches am Kabel', muscle: 'core', equipment: ['cable'], compound: false },
  { id: 'ab_wheel', name: 'Ab Wheel Rollout', muscle: 'core', equipment: ['bodyweight'], compound: false },

  // ── Cardio / Ganzkörper ──────────────────────────────────────────────
  { id: 'treadmill', name: 'Laufband', muscle: 'cardio', equipment: ['machine'], compound: true },
  { id: 'rowing_machine', name: 'Rudergerät', muscle: 'cardio', equipment: ['machine'], compound: true },
  { id: 'bike', name: 'Fahrrad-Ergometer', muscle: 'cardio', equipment: ['machine'], compound: true },
  { id: 'jump_rope', name: 'Seilspringen', muscle: 'cardio', equipment: ['bodyweight'], compound: true },
  { id: 'burpee', name: 'Burpees', muscle: 'fullbody', equipment: ['bodyweight'], compound: true },
  { id: 'kb_swing', name: 'Kettlebell Swings', muscle: 'fullbody', equipment: ['kettlebell'], compound: true },
];

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

/** Übungen, die sich mit dem vorhandenen Equipment ausführen lassen. */
export function exercisesFor(available: Equipment[]): Exercise[] {
  if (available.length === 0) return EXERCISES;
  return EXERCISES.filter((e) => e.equipment.some((eq) => available.includes(eq)));
}

/** Kompakte Liste für den KI-Prompt: "id | Name | Muskel | Equipment". */
export function exerciseCatalogForPrompt(available: Equipment[]): string {
  return exercisesFor(available)
    .map((e) => `${e.id} | ${e.name} | ${e.muscle} | ${e.equipment.join(',')}`)
    .join('\n');
}
