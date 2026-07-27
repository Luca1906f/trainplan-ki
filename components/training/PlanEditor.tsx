'use client';

import type {
  TrainingPlanDraft,
  TrainingDay,
  TrainingExercise,
  TrainingSet,
  SetType,
} from '@/lib/training/types';

/** Immutable helpers — every edit returns a fresh draft up to onChange. */
function replaceAt<T>(arr: T[], i: number, next: T): T[] {
  const copy = arr.slice();
  copy[i] = next;
  return copy;
}
function removeAt<T>(arr: T[], i: number): T[] {
  return arr.filter((_, idx) => idx !== i);
}

const emptySet = (order: number): TrainingSet => ({
  setOrder: order,
  setType: 'normal',
  reps: 10,
  weightKg: null,
  rir: 2,
  pauseSeconds: 90,
});

const emptyExercise = (order: number): TrainingExercise => ({
  name: '',
  exerciseOrder: order,
  notes: '',
  progressionType: 'none',
  progressionIncrementKg: 2.5,
  progressionMinReps: 8,
  progressionMaxReps: 12,
  sets: [emptySet(0)],
});

const numOrNull = (v: string): number | null => {
  const t = v.trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
};

export function PlanEditor({
  plan,
  onChange,
}: {
  plan: TrainingPlanDraft;
  onChange: (p: TrainingPlanDraft) => void;
}) {
  const setDays = (days: TrainingDay[]) => onChange({ ...plan, days });
  const setDay = (di: number, day: TrainingDay) => setDays(replaceAt(plan.days, di, day));
  const setExercises = (di: number, exercises: TrainingExercise[]) =>
    setDay(di, { ...plan.days[di], exercises });
  const setExercise = (di: number, ei: number, ex: TrainingExercise) =>
    setExercises(di, replaceAt(plan.days[di].exercises, ei, ex));
  const setSets = (di: number, ei: number, sets: TrainingSet[]) =>
    setExercise(di, ei, { ...plan.days[di].exercises[ei], sets });

  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Planname</span>
        <input
          value={plan.name}
          onChange={(e) => onChange({ ...plan, name: e.target.value })}
          className="w-full rounded-lg border px-3 py-2"
        />
      </label>

      {plan.days.map((day, di) => (
        <div key={di} className="rounded-xl border p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="shrink-0 text-xs font-semibold text-neutral-400">TAG {di + 1}</span>
            <input
              value={day.name}
              onChange={(e) => setDay(di, { ...day, name: e.target.value })}
              placeholder="z. B. Push"
              className="w-full rounded-lg border px-2 py-1 text-sm font-medium"
            />
            <button
              type="button"
              onClick={() => setDays(removeAt(plan.days, di))}
              className="shrink-0 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600"
            >
              Tag löschen
            </button>
          </div>

          {day.exercises.map((ex, ei) => (
            <div key={ei} className="mb-2 rounded-lg bg-neutral-50 p-2">
              <div className="mb-1 flex items-center gap-2">
                <input
                  value={ex.name}
                  onChange={(e) => setExercise(di, ei, { ...ex, name: e.target.value })}
                  placeholder="Übung"
                  className="w-full rounded border px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setExercises(di, removeAt(day.exercises, ei))}
                  className="shrink-0 text-xs text-red-500"
                  title="Übung entfernen"
                >
                  ✕
                </button>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="text-neutral-400">
                    <th className="text-left font-normal">Typ</th>
                    <th className="text-left font-normal">Wdh.</th>
                    <th className="text-left font-normal">kg</th>
                    <th className="text-left font-normal">RIR</th>
                    <th className="text-left font-normal">Pause s</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s, si) => (
                    <tr key={si}>
                      <td className="pr-1">
                        <select
                          value={s.setType}
                          onChange={(e) =>
                            setSets(di, ei, replaceAt(ex.sets, si, { ...s, setType: e.target.value as SetType }))}
                          className="w-full rounded border px-1 py-0.5"
                        >
                          <option value="normal">Normal</option>
                          <option value="warmup">Aufwärmen</option>
                          <option value="dropset">Dropset</option>
                        </select>
                      </td>
                      <td className="pr-1">
                        <input
                          value={s.reps ?? ''}
                          onChange={(e) =>
                            setSets(di, ei, replaceAt(ex.sets, si, { ...s, reps: numOrNull(e.target.value) === null ? null : Math.round(numOrNull(e.target.value)!) }))}
                          placeholder="AMRAP"
                          className="w-14 rounded border px-1 py-0.5"
                        />
                      </td>
                      <td className="pr-1">
                        <input
                          value={s.weightKg ?? ''}
                          onChange={(e) =>
                            setSets(di, ei, replaceAt(ex.sets, si, { ...s, weightKg: numOrNull(e.target.value) }))}
                          placeholder="—"
                          className="w-14 rounded border px-1 py-0.5"
                        />
                      </td>
                      <td className="pr-1">
                        <input
                          value={s.rir ?? ''}
                          onChange={(e) =>
                            setSets(di, ei, replaceAt(ex.sets, si, { ...s, rir: numOrNull(e.target.value) === null ? null : Math.round(numOrNull(e.target.value)!) }))}
                          className="w-10 rounded border px-1 py-0.5"
                        />
                      </td>
                      <td className="pr-1">
                        <input
                          value={s.pauseSeconds ?? ''}
                          onChange={(e) =>
                            setSets(di, ei, replaceAt(ex.sets, si, { ...s, pauseSeconds: numOrNull(e.target.value) === null ? null : Math.round(numOrNull(e.target.value)!) }))}
                          className="w-14 rounded border px-1 py-0.5"
                        />
                      </td>
                      <td>
                        {ex.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSets(di, ei, removeAt(ex.sets, si))}
                            className="text-red-400"
                            title="Satz entfernen"
                          >
                            –
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                onClick={() => setSets(di, ei, [...ex.sets, emptySet(ex.sets.length)])}
                className="mt-1 text-xs text-blue-600"
              >
                + Satz
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setExercises(di, [...day.exercises, emptyExercise(day.exercises.length)])}
            className="text-sm text-blue-600"
          >
            + Übung
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setDays([
            ...plan.days,
            { name: `Tag ${plan.days.length + 1}`, dayOrder: plan.days.length, notes: '', exercises: [emptyExercise(0)] },
          ])}
        className="w-full rounded-xl border border-dashed py-2 text-sm text-neutral-600"
      >
        + Tag hinzufügen
      </button>
    </div>
  );
}
