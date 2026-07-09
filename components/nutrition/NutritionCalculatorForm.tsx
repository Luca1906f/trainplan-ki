'use client';

import type {
  MacroInput, Sex, Goal, Activity, Somatotype, DietForm, DietStyle,
} from '@/lib/nutrition/macros';

export interface PlannerInputs extends MacroInput {
  dietStyle: DietStyle;
  mealSlots: string[];
  preferences: string;
  allergies: string[];
}

const ALL_SLOTS = ['Frühstück', 'Mittagessen', 'Abendessen', 'Snack'];

export function NutritionCalculatorForm({
  value, onChange,
}: {
  value: PlannerInputs;
  onChange: (v: PlannerInputs) => void;
}) {
  const set = <K extends keyof PlannerInputs>(k: K, v: PlannerInputs[K]) =>
    onChange({ ...value, [k]: v });

  const num = (v: string) => (v === '' ? undefined : Number(v));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Geschlecht">
          <Select value={value.sex} onChange={(v) => set('sex', v as Sex)}
            options={[['male', 'männlich'], ['female', 'weiblich']]} />
        </Field>
        <Field label="Alter">
          <Input type="number" value={value.age} onChange={(v) => set('age', Number(v))} />
        </Field>
        <Field label="Größe (cm)">
          <Input type="number" value={value.heightCm} onChange={(v) => set('heightCm', Number(v))} />
        </Field>
        <Field label="Gewicht (kg)">
          <Input type="number" value={value.weightKg} onChange={(v) => set('weightKg', Number(v))} />
        </Field>
        <Field label="Ziel">
          <Select value={value.goal} onChange={(v) => set('goal', v as Goal)}
            options={[['cut', 'Abnehmen'], ['maintain', 'Halten'], ['bulk', 'Aufbauen']]} />
        </Field>
        <Field label="Aktivität">
          <Select value={value.activity} onChange={(v) => set('activity', v as Activity)}
            options={[
              ['sedentary', 'sitzend'], ['light', 'leicht'], ['moderate', 'moderat'],
              ['high', 'hoch'], ['athlete', 'athlet'],
            ]} />
        </Field>
      </div>

      <details className="rounded-lg border p-3">
        <summary className="cursor-pointer text-sm text-neutral-600">Genauer einstellen</summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Körperfett % (optional)">
            <Input type="number" value={value.bodyFatPct ?? ''}
              onChange={(v) => set('bodyFatPct', num(v))} />
          </Field>
          <Field label="Körpertyp">
            <Select value={value.somatotype} onChange={(v) => set('somatotype', v as Somatotype)}
              options={[
                ['meso', 'weiß nicht / mesomorph'], ['ecto', 'ektomorph (schlank)'],
                ['endo', 'endomorph (kräftig)'],
              ]} />
          </Field>
          <Field label="Diätform">
            <Select value={value.dietForm} onChange={(v) => set('dietForm', v as DietForm)}
              options={[
                ['standard', 'Standard (empfohlen)'], ['keto', 'Keto'],
                ['lowcarb', 'Low-Carb'], ['highprotein', 'High-Protein'],
              ]} />
          </Field>
          <Field label="Ernährungsform">
            <Select value={value.dietStyle} onChange={(v) => set('dietStyle', v as DietStyle)}
              options={[
                ['omnivore', 'omnivor'], ['vegetarian', 'vegetarisch'], ['vegan', 'vegan'],
              ]} />
          </Field>
          <Field label="Mahlzeiten">
            <div className="flex flex-wrap gap-2 pt-1">
              {ALL_SLOTS.map((s) => {
                const on = value.mealSlots.includes(s);
                return (
                  <button key={s} type="button"
                    onClick={() => set('mealSlots',
                      on ? value.mealSlots.filter((x) => x !== s) : [...value.mealSlots, s])}
                    className={`rounded-lg px-2 py-1 text-xs ${on ? 'bg-neutral-900 text-white' : 'border'}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Allergien (Komma-getrennt)">
            <Input value={value.allergies.join(', ')}
              onChange={(v) => set('allergies', v.split(',').map((x) => x.trim()).filter(Boolean))} />
          </Field>
          <div className="col-span-2">
            <Field label="Vorlieben (frei)">
              <Input value={value.preferences} onChange={(v) => set('preferences', v)} />
            </Field>
          </div>
        </div>
      </details>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
function Input({ value, onChange, type = 'text' }:
  { value: string | number; onChange: (v: string) => void; type?: string }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border px-2 py-1.5" />
  );
}
function Select({ value, onChange, options }:
  { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border px-2 py-1.5">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
