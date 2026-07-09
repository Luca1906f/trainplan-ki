'use client';

import { useMemo, useState } from 'react';
import { calcMacros } from '@/lib/nutrition/macros';
import { targetWarnings } from '@/lib/nutrition/validate';
import { generateWeek } from '@/lib/nutrition/generateWeek';
import type { PlanDay } from '@/lib/nutrition/types';
import { savePlan } from '@/app/ernaehrungsplan/actions';
import { NutritionCalculatorForm, type PlannerInputs } from './NutritionCalculatorForm';
import { MacroSummary } from './MacroSummary';
import { WeeklyPlanView } from './WeeklyPlanView';
import { FreeAddOnsNote } from './FreeAddOnsNote';
import { FruitInfoNote } from './FruitInfoNote';

const DEFAULTS: PlannerInputs = {
  sex: 'male', age: 25, heightCm: 180, weightKg: 80,
  activity: 'moderate', goal: 'cut', somatotype: 'meso', dietForm: 'standard',
  dietStyle: 'omnivore', mealSlots: ['Frühstück', 'Mittagessen', 'Abendessen', 'Snack'],
  preferences: '', allergies: [],
};

const TIPS = [
  'Wusstest du? ~30 g Ballaststoffe pro Tag halten dich länger satt.',
  'Protein gleichmäßig über den Tag verteilt hält die Muskeln bei Laune.',
  'Wasser vor dem Essen dämpft oft den größten Hunger.',
];

type Phase = 'idle' | 'generating' | 'done';

export function NutritionPlanner() {
  const [inputs, setInputs] = useState<PlannerInputs>(DEFAULTS);
  const [phase, setPhase] = useState<Phase>('idle');
  const [days, setDays] = useState<PlanDay[]>([]);
  const [progress, setProgress] = useState(0);
  const [ok, setOk] = useState(true);
  const [saved, setSaved] = useState(false);

  const targets = useMemo(() => calcMacros(inputs), [inputs]);
  const warnings = targetWarnings(targets, inputs.weightKg);

  async function run() {
    setPhase('generating');
    setDays([]); setProgress(0); setSaved(false); setOk(true);
    const result = await generateWeek(
      {
        targets, dietForm: inputs.dietForm, dietStyle: inputs.dietStyle,
        preferences: inputs.preferences, allergies: inputs.allergies, mealSlots: inputs.mealSlots,
      },
      (day, i) => { setDays((prev) => [...prev, day]); setProgress(i + 1); },
    );
    setOk(result.ok);
    setPhase('done');
    if (result.ok) {
      try {
        await savePlan({
          goal: inputs.goal, dietForm: inputs.dietForm, dietStyle: inputs.dietStyle,
          targets, week: result.days,
        });
        setSaved(true);
      } catch { setSaved(false); }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-xl font-semibold">Ernährungsplan erstellen</h1>

      <NutritionCalculatorForm value={inputs} onChange={setInputs} />
      <MacroSummary t={targets} warnings={warnings} />
      <FreeAddOnsNote />
      <FruitInfoNote />

      <button
        onClick={run}
        disabled={phase === 'generating'}
        className="w-full rounded-xl bg-neutral-900 py-3 font-medium text-white disabled:opacity-50"
      >
        {phase === 'generating' ? `Generiere… Tag ${progress}/7` : 'Wochenplan generieren'}
      </button>

      {phase === 'generating' && (
        <p className="text-center text-sm text-neutral-500">{TIPS[progress % TIPS.length]}</p>
      )}

      {days.length > 0 && (
        <WeeklyPlanView days={days} targets={targets} />
      )}

      {phase === 'done' && !ok && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
          Ein paar Tage konnten nicht generiert werden.
          <button onClick={run} className="ml-2 underline">Nochmal versuchen</button>
        </div>
      )}
      {phase === 'done' && ok && (
        <p className="text-sm text-green-600">
          {saved ? 'Plan gespeichert und aktiv gesetzt.' : 'Generiert, aber Speichern schlug fehl.'}
        </p>
      )}
    </div>
  );
}
