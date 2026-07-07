import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { name, email, subject, message } = body ?? {};

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Bitte alle Pflichtfelder ausfüllen." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const coachEmail = process.env.COACH_EMAIL;
  if (!coachEmail) {
    return NextResponse.json(
      { error: "COACH_EMAIL ist serverseitig nicht konfiguriert." },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  const result = await sendEmail({
    to: coachEmail,
    subject: `FitGit Website-Kontakt: ${subject}`,
    text: [
      `Neue Kontaktanfrage über die FitGit-Website`,
      ``,
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Betreff: ${subject}`,
      ``,
      `Nachricht:`,
      message,
    ].join("\n"),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
