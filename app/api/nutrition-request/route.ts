import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";

const ZIELE: Record<string, string> = {
  cut: "Abnehmen / Definition",
  maintain: "Gewicht halten",
  bulk: "Aufbauen / Zunehmen",
};

const STIL: Record<string, string> = {
  omnivore: "Omnivor",
  vegetarian: "Vegetarisch",
  vegan: "Vegan",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    goal,
    sex,
    age,
    heightCm,
    weightKg,
    dietStyle,
    preferences,
    allergies,
  } = body ?? {};

  if (!name || !email || !goal || !heightCm || !weightKg) {
    return NextResponse.json(
      { error: "Bitte alle Pflichtfelder ausfüllen." },
      { status: 400 },
    );
  }

  const coachEmail = process.env.COACH_EMAIL;
  if (!coachEmail) {
    return NextResponse.json(
      { error: "COACH_EMAIL ist serverseitig nicht konfiguriert." },
      { status: 500 },
    );
  }

  const lines = [
    `Neue Ernährungsplan-Anfrage über FitGit`,
    ``,
    `Name: ${name}`,
    `E-Mail (= TryMe-Konto): ${email}`,
    `Ziel: ${ZIELE[goal] ?? goal}`,
    `Geschlecht: ${sex === "female" ? "weiblich" : "männlich"}`,
    `Alter: ${age || "(keine Angabe)"}`,
    `Größe: ${heightCm} cm`,
    `Gewicht: ${weightKg} kg`,
    `Ernährungsform: ${STIL[dietStyle] ?? dietStyle ?? "(keine Angabe)"}`,
    `Vorlieben: ${preferences || "(keine Angabe)"}`,
    `Allergien: ${allergies || "(keine Angabe)"}`,
    ``,
    `→ Plan im Admin-Generator erstellen und auf diese E-Mail speichern.`,
  ];

  const result = await sendEmail({
    to: coachEmail,
    subject: `Neue FitGit-Ernährungsplan-Anfrage von ${name}`,
    text: lines.join("\n"),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
