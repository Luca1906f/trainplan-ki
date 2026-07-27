'use server';

import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ADMIN_COOKIE_NAME, computeAdminToken } from '@/lib/auth/adminSession';
import { trainingPlanDraftSchema } from '@/lib/training/validate';
import type { TrainingPlanDraft } from '@/lib/training/types';

interface SaveArgs {
  targetEmail: string;
  plan: TrainingPlanDraft;
}

// This action writes into any user's account via the service-role key, so it
// must be admin-only in its own right — not just gated by the (currently
// unwired) page middleware.
async function assertAdmin(): Promise<void> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookie = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!adminPassword || cookie !== (await computeAdminToken(adminPassword))) {
    throw new Error('Nicht autorisiert.');
  }
}

/**
 * Schreibt einen (ggf. im Editor angepassten) Planentwurf nach Supabase:
 * plans → plan_days → plan_exercises → sets. Ab dann ist er die eine
 * Wahrheit — für die TRYME-App genauso wie für PDF- und DOCX-Export.
 */
export async function saveTrainingPlan({ targetEmail, plan }: SaveArgs) {
  await assertAdmin();

  const email = targetEmail.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new Error('Bitte eine gültige Ziel-E-Mail angeben.');
  }

  // Auch hier nochmal validieren — der Editor darf nichts Kaputtes durchreichen.
  const parsed = trainingPlanDraftSchema.safeParse(plan);
  if (!parsed.success) {
    throw new Error('Der Plan ist unvollständig und kann so nicht gespeichert werden.');
  }
  const draft = parsed.data;

  const supabase = supabaseAdmin();

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (profileErr) throw new Error(profileErr.message);
  if (!profile) {
    throw new Error(
      `Kein Konto für ${email} gefunden. Der Nutzer muss sich zuerst (in der TryMe-App) registrieren.`,
    );
  }
  const userId = profile.id as string;

  // Bisher aktiven Trainingsplan archivieren — es soll immer nur einer aktiv sein.
  await supabase
    .from('plans')
    .update({ status: 'archived' })
    .eq('user_id', userId)
    .eq('status', 'active');

  const { data: created, error } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      name: draft.name,
      description: draft.description,
      status: 'active',
    })
    .select()
    .single();
  if (error || !created) {
    throw new Error(error?.message ?? 'Plan konnte nicht gespeichert werden.');
  }

  for (const day of draft.days) {
    const { data: dayRow } = await supabase
      .from('plan_days')
      .insert({
        plan_id: created.id,
        name: day.name,
        day_order: day.dayOrder,
        notes: day.notes,
      })
      .select()
      .single();
    if (!dayRow) continue;

    for (const exercise of day.exercises) {
      const { data: exRow } = await supabase
        .from('plan_exercises')
        .insert({
          day_id: dayRow.id,
          name: exercise.name,
          exercise_id: exercise.exerciseId ?? null,
          exercise_order: exercise.exerciseOrder,
          notes: exercise.notes,
          progression_type: exercise.progressionType,
          progression_increment_kg: exercise.progressionIncrementKg,
          progression_min_reps: exercise.progressionMinReps,
          progression_max_reps: exercise.progressionMaxReps,
        })
        .select()
        .single();
      if (!exRow) continue;

      if (exercise.sets.length > 0) {
        await supabase.from('sets').insert(
          exercise.sets.map((s) => ({
            plan_exercise_id: exRow.id,
            set_order: s.setOrder,
            set_type: s.setType,
            reps: s.reps,
            weight_kg: s.weightKg,
            rir: s.rir,
            pause_seconds: s.pauseSeconds,
          })),
        );
      }
    }
  }

  return { planId: created.id as string, email };
}
