import type { MacroTargets } from '@/lib/nutrition/macros';
import { macrosKcal } from '@/lib/nutrition/macros';

const FORMULA_LABEL = {
  'katch-mcardle': 'Katch-McArdle (mit Körperfett)',
  mifflin: 'Mifflin-St Jeor',
} as const;

export function MacroSummary({ t, warnings }: { t: MacroTargets; warnings: string[] }) {
  const cells = [
    { label: 'kcal', value: `~${t.kcal}` },
    { label: 'Protein', value: `${t.proteinG} g` },
    { label: 'Carbs', value: `${t.carbsG} g` },
    { label: 'Fett', value: `${t.fatG} g` },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {cells.map((c) => (
          <div key={c.label} className="rounded-xl border p-3 text-center">
            <div className="text-lg font-semibold">{c.value}</div>
            <div className="text-xs text-neutral-500">{c.label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500">
        Berechnet mit {FORMULA_LABEL[t.formula]} · effektiv {macrosKcal(t)} kcal
      </p>
      {warnings.map((w) => (
        <p key={w} className="text-xs text-amber-600">{w}</p>
      ))}
    </div>
  );
}
