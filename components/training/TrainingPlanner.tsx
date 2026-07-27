'use client';

import { useState } from 'react';
import type {
  TrainingPlanDraft,
  TrainingPlanInput,
  Equipment,
} from '@/lib/training/types';
import { saveTrainingPlan } from '@/app/trainingsplan/actions';
import { TrainingInputForm } from './TrainingInputForm';
import { PlanEditor } from './PlanEditor';

type Phase = 'idle' | 'generating' | 'editing' | 'saving' | 'saved';

const DEFAULTS: TrainingPlanInput = {
  goal: 'hypertrophy',
  experience: 'intermediate',
  daysPerWeek: 3,
  equipment: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'] as Equipment[],
  sessionMinutes: 60,
  notes: '',
  clientName: '',
};

export function TrainingPlanner() {
  const [targetEmail, setTargetEmail] = useState('');
  const [inputs, setInputs] = useState<TrainingPlanInput>(DEFAULTS);
  const [phase, setPhase] = useState<Phase>('idle');
  const [draft, setDraft] = useState<TrainingPlanDraft | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const emailValid = targetEmail.trim().includes('@');

  async function generate() {
    setPhase('generating');
    setError(null);
    setDraft(null);
    setWarnings([]);
    try {
      const res = await fetch('/api/training/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'Generierung fehlgeschlagen.');
      }
      setDraft(data.plan as TrainingPlanDraft);
      setWarnings((data.warnings as string[]) ?? []);
      setPhase('editing');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generierung fehlgeschlagen.');
      setPhase('idle');
    }
  }

  async function save() {
    if (!draft) return;
    setPhase('saving');
    setError(null);
    try {
      await saveTrainingPlan({ targetEmail, plan: draft });
      setPhase('saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Speichern fehlgeschlagen.');
      setPhase('editing');
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-xl font-semibold">Trainingsplan erstellen</h1>

      <label className="block rounded-xl border p-3 text-sm">
        <span className="mb-1 block font-medium text-neutral-700">Für welchen Nutzer? (E-Mail)</span>
        <input
          type="email"
          value={targetEmail}
          onChange={(e) => setTargetEmail(e.target.value)}
          placeholder="max@mail.de"
          className="w-full rounded-lg border px-3 py-2"
        />
        <span className="mt-1 block text-xs text-neutral-500">
          Der Plan wird in das TryMe-Konto dieser E-Mail gespeichert und aktiv gesetzt.
          Der Nutzer muss bereits registriert sein.
        </span>
      </label>

      <TrainingInputForm value={inputs} onChange={setInputs} />

      <button
        onClick={generate}
        disabled={phase === 'generating' || phase === 'saving'}
        className="w-full rounded-xl bg-neutral-900 py-3 font-medium text-white disabled:opacity-50"
      >
        {phase === 'generating'
          ? 'KI erstellt den Plan…'
          : draft
            ? 'Neu generieren (verwirft Änderungen)'
            : 'Plan generieren'}
      </button>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="mb-1 font-medium">Hinweise:</p>
          <ul className="list-inside list-disc space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {draft && (phase === 'editing' || phase === 'saving' || phase === 'saved') && (
        <>
          <div className="rounded-xl border bg-neutral-50 p-3 text-sm text-neutral-600">
            Vorschlag der KI — passe Übungen, Sätze, Wiederholungen, Gewichte und
            Pausen frei an, bevor du speicherst.
          </div>

          <PlanEditor plan={draft} onChange={setDraft} />

          <div className="sticky bottom-0 -mx-4 border-t bg-white/95 p-4 backdrop-blur">
            {!emailValid && (
              <p className="mb-2 text-center text-xs text-neutral-500">
                Erst eine gültige Ziel-E-Mail oben eingeben.
              </p>
            )}
            <button
              onClick={save}
              disabled={phase === 'saving' || !emailValid}
              className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white disabled:opacity-50"
            >
              {phase === 'saving' ? 'Speichere…' : 'Plan speichern & aktiv setzen'}
            </button>
          </div>
        </>
      )}

      {phase === 'saved' && (
        <p className="text-sm text-green-600">
          Plan gespeichert und für {targetEmail.trim().toLowerCase()} aktiv gesetzt.
          Er erscheint jetzt in der TryMe-App.
        </p>
      )}
    </div>
  );
}
