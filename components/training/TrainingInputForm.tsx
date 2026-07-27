'use client';

import type { TrainingPlanInput, Equipment } from '@/lib/training/types';

const GOALS: { value: TrainingPlanInput['goal']; label: string }[] = [
  { value: 'strength', label: 'Maximalkraft' },
  { value: 'hypertrophy', label: 'Muskelaufbau' },
  { value: 'endurance', label: 'Kraftausdauer' },
  { value: 'general', label: 'Allgemeine Fitness' },
];

const EXPERIENCE: { value: TrainingPlanInput['experience']; label: string }[] = [
  { value: 'beginner', label: 'Anfänger' },
  { value: 'intermediate', label: 'Fortgeschritten' },
  { value: 'advanced', label: 'Erfahren' },
];

const EQUIPMENT: { value: Equipment; label: string }[] = [
  { value: 'barbell', label: 'Langhantel' },
  { value: 'dumbbell', label: 'Kurzhantel' },
  { value: 'machine', label: 'Maschinen' },
  { value: 'cable', label: 'Kabelzug' },
  { value: 'bodyweight', label: 'Körpergewicht' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'bands', label: 'Bänder' },
];

export function TrainingInputForm({
  value,
  onChange,
}: {
  value: TrainingPlanInput;
  onChange: (v: TrainingPlanInput) => void;
}) {
  const set = <K extends keyof TrainingPlanInput>(key: K, v: TrainingPlanInput[K]) =>
    onChange({ ...value, [key]: v });

  const toggleEquipment = (eq: Equipment) => {
    const has = value.equipment.includes(eq);
    set(
      'equipment',
      has ? value.equipment.filter((e) => e !== eq) : [...value.equipment, eq],
    );
  };

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Kundenname (optional)</span>
        <input
          type="text"
          value={value.clientName ?? ''}
          onChange={(e) => set('clientName', e.target.value)}
          placeholder="Max Mustermann"
          className="w-full rounded-lg border px-3 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Ziel</span>
          <select
            value={value.goal}
            onChange={(e) => set('goal', e.target.value as TrainingPlanInput['goal'])}
            className="w-full rounded-lg border px-3 py-2"
          >
            {GOALS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Erfahrung</span>
          <select
            value={value.experience}
            onChange={(e) => set('experience', e.target.value as TrainingPlanInput['experience'])}
            className="w-full rounded-lg border px-3 py-2"
          >
            {EXPERIENCE.map((x) => (
              <option key={x.value} value={x.value}>{x.label}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Tage / Woche</span>
          <input
            type="number"
            min={1}
            max={7}
            value={value.daysPerWeek}
            onChange={(e) =>
              set('daysPerWeek', Math.max(1, Math.min(7, Number(e.target.value) || 1)))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Minuten / Einheit</span>
          <input
            type="number"
            min={20}
            max={180}
            step={5}
            value={value.sessionMinutes}
            onChange={(e) =>
              set('sessionMinutes', Math.max(20, Math.min(180, Number(e.target.value) || 60)))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>
      </div>

      <div className="text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Verfügbares Equipment</span>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map((eq) => {
            const active = value.equipment.includes(eq.value);
            return (
              <button
                key={eq.value}
                type="button"
                onClick={() => toggleEquipment(eq.value)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  active
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 text-neutral-600'
                }`}
              >
                {eq.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Hinweise (optional)</span>
        <textarea
          value={value.notes ?? ''}
          onChange={(e) => set('notes', e.target.value)}
          rows={2}
          placeholder="z. B. Knieprobleme, kein Kreuzheben, Fokus Oberkörper …"
          className="w-full rounded-lg border px-3 py-2"
        />
      </label>
    </div>
  );
}
