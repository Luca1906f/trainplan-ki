'use client';

import { useEffect, useState } from 'react';
import type { TrainingPlanDraft, TrainingSet } from '@/lib/training/types';

type ExportData = { plan: TrainingPlanDraft; clientName?: string };

function readExport(): ExportData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('tp_export');
    return raw ? (JSON.parse(raw) as ExportData) : null;
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

const SET_TAG: Record<string, string> = { warmup: 'Aufwärmen', dropset: 'Dropset', normal: '' };

function reps(s: TrainingSet): string {
  const r = s.reps == null ? 'AMRAP' : `${s.reps} Wdh.`;
  const rir = s.rir != null ? `, RIR ${s.rir}` : '';
  const tag = SET_TAG[s.setType] ? ` (${SET_TAG[s.setType]})` : '';
  return `${r}${tag}${rir}`;
}
function weight(s: TrainingSet): string {
  const w = s.weightKg == null ? '—' : `${s.weightKg} kg`;
  return s.pauseSeconds != null ? `${w} · ${s.pauseSeconds}s` : w;
}

export default function PrintPage() {
  // Read the one-shot handoff during render (React-recommended for browser
  // state) rather than in an effect.
  const [data] = useState<ExportData | null>(readExport);

  // Print once the plan is on screen; the browser's "Save as PDF" produces the
  // file. Gives clean, controllable output without a server-side PDF engine.
  useEffect(() => {
    if (data) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [data]);

  if (!data) {
    return (
      <main style={{ padding: 40, fontFamily: 'system-ui' }}>
        <p>Kein Plan zum Drucken gefunden. Öffne den Export erneut aus dem Editor.</p>
      </main>
    );
  }

  const { plan, clientName } = data;
  const today = new Date().toLocaleDateString('de-DE');

  return (
    <main className="sheet">
      <style>{`
        :root { --accent:#2F6FB0; --muted:#6B7280; --border:#D8DCE3; --text:#1F2430; }
        * { box-sizing: border-box; }
        .sheet { max-width: 800px; margin: 0 auto; padding: 32px; color: var(--text);
                 font-family: Calibri, system-ui, sans-serif; font-size: 13px; }
        .brand { font-weight: 800; font-size: 22px; }
        .brand .git { color: var(--accent); }
        .kicker { letter-spacing: .18em; color: var(--muted); font-weight: 700; font-size: 11px; margin-top: 2px; }
        h1 { font-size: 20px; margin: 14px 0 2px; }
        .desc { color: var(--muted); margin: 0 0 6px; }
        .meta { color: var(--muted); border-bottom: 2px solid var(--border); padding-bottom: 10px; margin-bottom: 18px; }
        .day { break-inside: avoid; margin-bottom: 20px; }
        .day h2 { font-size: 15px; border-bottom: 2px solid var(--accent); padding-bottom: 4px; margin: 0 0 8px; }
        .day .note { color: var(--muted); font-style: italic; margin: 0 0 8px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: var(--accent); color: #fff; text-align: left; padding: 6px 8px; font-size: 12px; }
        td { border: 1px solid var(--border); padding: 6px 8px; vertical-align: top; }
        tr.first td { border-top: 2px solid var(--border); }
        .ex { font-weight: 700; }
        .muted { color: var(--muted); }
        @media print {
          .sheet { padding: 0; }
          .day { page-break-inside: avoid; }
          @page { margin: 16mm; }
        }
      `}</style>

      <div className="brand">Fit<span className="git">Git</span></div>
      <div className="kicker">TRAININGSPLAN</div>
      <h1>{plan.name}</h1>
      {plan.description ? <p className="desc">{plan.description}</p> : null}
      <p className="meta">
        {clientName ? `Kunde: ${clientName}   ·   ` : ''}Datum: {today}
      </p>

      {plan.days.map((day, di) => (
        <section className="day" key={di}>
          <h2>TAG {di + 1} · {day.name.toUpperCase()}</h2>
          {day.notes ? <p className="note">{day.notes}</p> : null}
          <table>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Übung</th>
                <th style={{ width: '12%' }}>Satz</th>
                <th style={{ width: '28%' }}>Wiederholungen</th>
                <th style={{ width: '20%' }}>Gewicht / Pause</th>
              </tr>
            </thead>
            <tbody>
              {day.exercises.map((ex) => {
                const sets = ex.sets.length ? ex.sets : [null];
                return sets.map((s, si) => (
                  <tr key={`${ex.name}-${si}`} className={si === 0 ? 'first' : ''}>
                    <td className="ex">{si === 0 ? ex.name : ''}</td>
                    <td className="muted">{si + 1}</td>
                    <td>{s ? reps(s) : '—'}</td>
                    <td className="muted">{s ? weight(s) : '—'}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </section>
      ))}
    </main>
  );
}
