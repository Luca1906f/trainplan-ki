import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const dayTool: Anthropic.Tool = {
  name: 'build_day',
  description: 'Gibt einen Tagesplan als strukturierte Daten zurück.',
  input_schema: {
    type: 'object',
    properties: {
      meals: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            mealType: { type: 'string' },
            name: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  foodName: { type: 'string' }, amountG: { type: 'number' },
                  kcal: { type: 'number' }, proteinG: { type: 'number' },
                  carbsG: { type: 'number' }, fatG: { type: 'number' },
                },
                required: ['foodName', 'amountG', 'kcal', 'proteinG', 'carbsG', 'fatG'],
              },
            },
          },
          required: ['mealType', 'name', 'items'],
        },
      },
      tips: {
        type: 'array', items: { type: 'string' },
        description: '1–2 kurze Tipps für den Tag.',
      },
    },
    required: ['meals', 'tips'],
  },
};

export async function POST(req: Request) {
  const { targets, dietStyle, preferences, allergies, dietForm, mealSlots, dayLabel, avoidMeals } =
    await req.json();

  const slots = mealSlots ?? ['Frühstück', 'Mittagessen', 'Abendessen', 'Snack'];

  const system = `Du bist Ernährungscoach. Erstelle EINEN Tagesplan (${dayLabel}).
Diätform: ${dietForm ?? 'standard'}. Ernährungsform: ${dietStyle ?? 'omnivore'}.
Mahlzeiten in genau dieser Reihenfolge: ${slots.join(', ')}.
Triff diese Tagesziele so genau wie möglich: ${targets.kcal} kcal, ${targets.proteinG}g Protein, ${targets.carbsG}g Carbs, ${targets.fatG}g Fett.
Vorlieben: ${preferences || '-'}.
NIEMALS verwenden (Allergien, hart ausschließen, auch Spuren): ${(allergies ?? []).join(', ') || 'keine'}.
Verteile das Protein gleichmäßig über die Mahlzeiten (~0,3–0,4 g/kg pro Hauptmahlzeit), nicht alles ins Abendessen.
Runde Mengen auf alltagstaugliche Portionen (25-g-Schritte, ganze Eier/Scheiben).
Gewürze/Kräuter frei (nicht einrechnen); nicht-stärkehaltiges Gemüse frei ergänzbar, klein halten.
Zuckerarmes Obst bevorzugen (Beeren) statt Weintrauben/Mango/Banane/Trockenfrüchte, außer es passt in die Makros.
Nur Lebensmittel mit Mengen in Gramm + plausible Makros. KEINE Rezepte.
Vermeide Wiederholung dieser Gerichte: ${(avoidMeals ?? []).join(', ') || 'keine'}.
Gib 1–2 kurze, konkrete Tages-Tipps (Feld tips). Antworte ausschließlich über das Tool build_day.`;

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 4000,
    system,
    tools: [dayTool],
    tool_choice: { type: 'tool', name: 'build_day' },
    messages: [{ role: 'user', content: `Erstelle den Plan für ${dayLabel}.` }],
  });

  const block = msg.content.find((b) => b.type === 'tool_use');
  if (!block || block.type !== 'tool_use') {
    return NextResponse.json({ error: 'Keine Plan-Daten erhalten' }, { status: 502 });
  }
  const out = block.input as any;
  return NextResponse.json({ dayLabel, meals: out.meals, tips: out.tips ?? [] });
}
