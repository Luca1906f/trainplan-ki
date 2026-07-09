'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { dayBudget } from '@/lib/nutrition/budget';
import { emitConsistencyEvent } from '@/lib/missions/events';
import { MealCheckRow } from './MealCheckRow';
import { BudgetCard } from './BudgetCard';

interface MealRow {
  id: string;
  mealType: string;
  name: string;
  kcal: number;
  checked: boolean;
}
interface TodayData {
  targetKcal: number;
  tips: string[];
  meals: MealRow[];
}

// Lokale Zeit des Users als Wahrheit (kein UTC-Kippen um Mitternacht).
function localToday() {
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // Mo=0 … So=6
  const logDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  return { dayIndex, logDate };
}

export function TodayView() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const { dayIndex, logDate } = useMemo(localToday, []);
  const supabase = useMemo(supabaseBrowser, []);

  useEffect(() => {
    (async () => {
      const { data: plan } = await supabase
        .from('nutrition_plans').select('id').eq('is_active', true).maybeSingle();
      if (!plan) { setLoading(false); return; }

      const { data: day } = await supabase
        .from('nutrition_plan_days')
        .select('id, tips, total_kcal')
        .eq('plan_id', plan.id).eq('day_index', dayIndex).maybeSingle();
      if (!day) { setLoading(false); return; }

      const { data: meals } = await supabase
        .from('nutrition_meals')
        .select('id, meal_type, name, kcal')
        .eq('day_id', day.id).order('meal_index');

      const { data: checks } = await supabase
        .from('nutrition_meal_checkins')
        .select('meal_id').eq('log_date', logDate);
      const checkedIds = new Set((checks ?? []).map((c) => c.meal_id));

      setData({
        targetKcal: day.total_kcal ?? 0,
        tips: day.tips ?? [],
        meals: (meals ?? []).map((m) => ({
          id: m.id, mealType: m.meal_type, name: m.name, kcal: m.kcal ?? 0,
          checked: checkedIds.has(m.id),
        })),
      });
      setLoading(false);
    })();
  }, [supabase, dayIndex, logDate]);

  async function toggle(mealId: string) {
    if (!data) return;
    const wasChecked = data.meals.find((m) => m.id === mealId)?.checked;
    const next = data.meals.map((m) => (m.id === mealId ? { ...m, checked: !m.checked } : m));
    setData({ ...data, meals: next }); // optimistic

    try {
      if (wasChecked) {
        await supabase.from('nutrition_meal_checkins')
          .delete().eq('meal_id', mealId).eq('log_date', logDate);
      } else {
        await supabase.from('nutrition_meal_checkins')
          .insert({ meal_id: mealId, log_date: logDate });
        await emitConsistencyEvent({ type: 'nutrition_tracked', date: logDate });
        if (next.every((m) => m.checked)) {
          await emitConsistencyEvent({ type: 'nutrition_day_complete', date: logDate });
        }
      }
    } catch {
      setData((d) => (d ? { ...d, meals: data.meals } : d)); // rollback
    }
  }

  if (loading) return <div className="p-4 text-neutral-400">Lädt…</div>;
  if (!data)
    return (
      <div className="mx-auto max-w-md p-4 text-center text-neutral-500">
        Noch kein Plan aktiv — erstelle in fitgit einen Ernährungsplan.
      </div>
    );

  const budget = dayBudget(data.targetKcal, data.meals);

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <div className="text-center">
        <div className="text-3xl font-semibold">{budget.eaten} / {data.targetKcal}</div>
        <div className="text-xs text-neutral-500">kcal heute</div>
      </div>

      <div className="space-y-2">
        {data.meals.map((m) => (
          <MealCheckRow key={m.id} {...m} onToggle={() => toggle(m.id)} />
        ))}
      </div>

      <BudgetCard budget={budget} />

      {data.tips.length > 0 && (
        <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
          {data.tips.map((t, i) => <p key={i}>💡 {t}</p>)}
        </div>
      )}
    </div>
  );
}
