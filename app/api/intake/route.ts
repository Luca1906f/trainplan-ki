import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";

const ZIELE: Record<string, string> = {
  muskelaufbau: "Muskelaufbau",
  fettabbau: "Fettabbau / Definition",
  kraftaufbau: "Kraftaufbau",
  fitness: "Allgemeine Fitness",
  sonstiges: "Sonstiges",
};

const LEVEL: Record<string, string> = {
  anfaenger: "Anfänger",
  fortgeschritten: "Fortgeschritten",
  profi: "Profi",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    ziel,
    level,
    trainingstage,
    splitWahl,
    splitWunsch,
    notizen,
  } = body ?? {};

  if (
    !name ||
    !email ||
    !ziel ||
    !level ||
    !trainingstage ||
    (splitWahl !== "eigen" && splitWahl !== "coach")
  ) {
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
    `Neue Trainingsplan-Anfrage über FitGit`,
    ``,
    `Name: ${name}`,
    `E-Mail: ${email}`,
    `Ziel: ${ZIELE[ziel] ?? ziel}`,
    `Erfahrungslevel: ${LEVEL[level] ?? level}`,
    `Trainingstage/Woche: ${trainingstage}`,
    ``,
    splitWahl === "eigen"
      ? `Wunschsplit:\n${splitWunsch || "(keine Angabe)"}`
      : `Split: überlässt es FitGit`,
  ];

  if (notizen) {
    lines.push(``, `Notizen: ${notizen}`);
  }

  const result = await sendEmail({
    to: coachEmail,
    subject: `Neue FitGit-Anfrage von ${name}`,
    text: lines.join("\n"),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
