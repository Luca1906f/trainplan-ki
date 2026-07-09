'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { dayTotals, mealTotals } from '@/lib/nutrition/totals';
import { GOAL_LABEL, type MacroTargets, type Goal, type DietForm, type DietStyle } from '@/lib/nutrition/macros';
import type { PlanDay } from '@/lib/nutrition/types';

interface SaveArgs {
  targetEmail: string;
  goal: Goal;
  dietForm: DietForm;
  dietStyle: DietStyle;
  targets: MacroTargets;
  week: PlanDay[];
}

export async function savePlan({ targetEmail, goal, dietForm, dietStyle, targets, week }: SaveArgs) {
  const email = targetEmail.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new Error('Bitte eine gültige Ziel-E-Mail angeben.');
  }

  const supabase = supabaseAdmin();

  // Nutzer über sein Profil (E-Mail → user_id) finden. Muss vorher registriert sein.
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

  const name = `${GOAL_LABEL[goal]} · ${targets.kcal} kcal · ${new Date().toLocaleDateString('de-DE')}`;

  // Bisherigen aktiven Plan dieses Nutzers deaktivieren, neuen aktiv setzen.
  await supabase
    .from('nutrition_plans')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);

  const { data: plan, error } = await supabase
    .from('nutrition_plans')
    .insert({
      user_id: userId,
      name, goal, diet_form: dietForm, diet_style: dietStyle, is_active: true,
      target_kcal: targets.kcal, protein_g: targets.proteinG,
      carbs_g: targets.carbsG, fat_g: targets.fatG,
    })
    .select()
    .single();
  if (error || !plan) throw new Error(error?.message ?? 'Plan konnte nicht gespeichert werden');

  for (const [dayIndex, day] of week.entries()) {
    const t = dayTotals(day);
    const { data: d } = await supabase
      .from('nutrition_plan_days')
      .insert({
        plan_id: plan.id, day_index: dayIndex, day_label: day.dayLabel, tips: day.tips ?? [],
        total_kcal: t.kcal, total_protein_g: t.proteinG, total_carbs_g: t.carbsG, total_fat_g: t.fatG,
      })
      .select()
      .single();
    if (!d) continue;

    for (const [mealIndex, meal] of day.meals.entries()) {
      const mt = mealTotals(meal);
      const { data: m } = await supabase
        .from('nutrition_meals')
        .insert({
          day_id: d.id, meal_index: mealIndex, meal_type: meal.mealType, name: meal.name,
          kcal: mt.kcal, protein_g: mt.proteinG, carbs_g: mt.carbsG, fat_g: mt.fatG,
        })
        .select()
        .single();
      if (!m) continue;

      await supabase.from('nutrition_meal_items').insert(
        meal.items.map((i) => ({
          meal_id: m.id, food_name: i.foodName, amount_g: i.amountG,
          kcal: i.kcal, protein_g: i.proteinG, carbs_g: i.carbsG, fat_g: i.fatG,
        })),
      );
    }
  }
  return { planId: plan.id, email };
}
