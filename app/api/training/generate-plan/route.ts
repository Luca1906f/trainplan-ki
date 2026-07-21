import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, computeAdminToken } from '@/lib/auth/adminSession';
import { exerciseCatalogForPrompt } from '@/lib/training/exercises';
import { trainingPlanDraftSchema, trainingPlanInputSchema, planWarnings } from '@/lib/training/validate';

export const runtime = 'nodejs';

// Wie bei der Ernährungs-Generierung: nur mit gültigem Admin-Cookie, damit
// Fremde die kostenpflichtige KI-Generierung nicht auslösen können.
async function isAdmin(): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const cookie = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  return cookie === (await computeAdminToken(adminPassword));
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const planTool: Anthropic.Tool = {
  name: 'build_plan',
  description: 'Gibt einen kompletten Trainingsplan als strukturierte Daten zurück.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Kurzer Planname.' },
      description: { type: 'string', description: '1–2 Sätze zum Aufbau des Plans.' },
      days: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'z. B. "Push", "Oberkörper", "Beine".' },
            dayOrder: { type: 'number' },
            notes: { type: 'string' },
            exercises: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  exerciseId: { type: 'string', description: 'id aus dem Übungskatalog.' },
                  name: { type: 'string', description: 'Anzeigename exakt aus dem Katalog.' },
                  exerciseOrder: { type: 'number' },
                  notes: { type: 'string' },
                  progressionType: { type: 'string', enum: ['linear', 'double_progression', 'none'] },
                  progressionIncrementKg: { type: 'number' },
                  progressionMinReps: { type: 'number' },
                  progressionMaxReps: { type: 'number' },
                  sets: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        setOrder: { type: 'number' },
                        setType: { type: 'string', enum: ['normal', 'warmup', 'dropset'] },
                        reps: { type: ['number', 'null'] },
                        weightKg: { type: ['number', 'null'] },
                        rir: { type: ['number', 'null'] },
                        pauseSeconds: { type: ['number', 'null'] },
                      },
                      required: ['setOrder', 'setType', 'reps', 'weightKg', 'rir', 'pauseSeconds'],
                    },
                  },
                },
                required: [
                  'name', 'exerciseOrder', 'notes', 'progressionType',
                  'progressionIncrementKg', 'progressionMinReps', 'progressionMaxReps', 'sets',
                ],
              },
            },
          },
          required: ['name', 'dayOrder', 'notes', 'exercises'],
        },
      },
    },
    required: ['name', 'description', 'days'],
  },
};

const GOAL_LABEL: Record<string, string> = {
  strength: 'Maximalkraft (schwer, wenige Wiederholungen)',
  hypertrophy: 'Muskelaufbau (moderates Gewicht, mittlere Wiederholungen)',
  endurance: 'Kraftausdauer (leichter, hohe Wiederholungen)',
  general: 'allgemeine Fitness / Gesundheit',
};

const EXPERIENCE_LABEL: Record<string, string> = {
  beginner: 'Anfänger (wenig Technik-Erfahrung, Fokus auf Grundübungen)',
  intermediate: 'Fortgeschritten',
  advanced: 'Sehr erfahren',
};

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const parsed = trainingPlanInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Ungültige Eingaben.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const catalog = exerciseCatalogForPrompt(input.equipment);

  const system = `Du bist ein erfahrener Kraft- und Fitnesstrainer. Erstelle EINEN kompletten Trainingsplan.

Ziel: ${GOAL_LABEL[input.goal]}
Erfahrung: ${EXPERIENCE_LABEL[input.experience]}
Trainingstage pro Woche: ${input.daysPerWeek}
Zeit pro Einheit: ca. ${input.sessionMinutes} Minuten
Zusätzliche Hinweise: ${input.notes || '-'}

ÜBUNGSKATALOG (id | Name | Muskel | Equipment) — verwende AUSSCHLIESSLICH Übungen aus dieser Liste
und übernimm id und Name exakt:
${catalog}

Regeln:
- Genau ${input.daysPerWeek} Trainingstage, sinnvoll aufgeteilt (z. B. Ganzkörper bei 1–3 Tagen, Push/Pull/Beine oder Ober-/Unterkörper bei 4+).
- Grundübungen (compound) zuerst, Isolationsübungen danach.
- Die Satz- und Wiederholungszahlen zum Ziel passend wählen: Maximalkraft ~3–6 Wdh. mit RIR 1–2,
  Muskelaufbau ~6–12 Wdh. mit RIR 1–3, Kraftausdauer ~12–20 Wdh.
- Pausen: schwere Grundübungen 120–180 s, Isolation 45–90 s.
- Bei schweren Grundübungen 1–2 Aufwärmsätze (setType "warmup", rir null) voranstellen.
- weightKg: nur setzen, wenn sinnvoll schätzbar; sonst null (offen / Körpergewicht).
- Realistisches Volumen für ${input.sessionMinutes} Minuten — lieber weniger Übungen sauber als überladen.
- Alle Texte auf Deutsch.

Antworte ausschließlich über das Tool build_plan.`;

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 8000,
    system,
    tools: [planTool],
    tool_choice: { type: 'tool', name: 'build_plan' },
    messages: [
      {
        role: 'user',
        content: `Erstelle den Trainingsplan${input.clientName ? ` für ${input.clientName}` : ''}.`,
      },
    ],
  });

  const block = msg.content.find((b) => b.type === 'tool_use');
  if (!block || block.type !== 'tool_use') {
    return NextResponse.json({ error: 'Keine Plan-Daten erhalten.' }, { status: 502 });
  }

  // Die KI-Antwort wird hart validiert — nichts Unvalidiertes darf weiter
  // Richtung Editor oder Datenbank.
  const draft = trainingPlanDraftSchema.safeParse(block.input);
  if (!draft.success) {
    return NextResponse.json(
      { error: 'Plan war unvollständig — bitte erneut generieren.', details: draft.error.flatten() },
      { status: 502 },
    );
  }

  return NextResponse.json({
    plan: draft.data,
    warnings: planWarnings(draft.data),
  });
}
