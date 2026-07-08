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
  const email: string | undefined = body?.email?.trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Bitte eine gültige E-Mail-Adresse angeben." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const siteUrl = process.env.PUBLIC_SITE_URL || "https://fitgit.app";

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Newsletter ist serverseitig nicht konfiguriert." },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  // 1. Create a pending subscription and get a confirmation token.
  let token: string;
  try {
    const rpcRes = await fetch(
      `${supabaseUrl}/rest/v1/rpc/request_newsletter_subscription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ p_email: email }),
      },
    );
    if (!rpcRes.ok) {
      const detail = await rpcRes.text();
      return NextResponse.json(
        { error: `Anmeldung fehlgeschlagen (${rpcRes.status}).`, detail },
        { status: 502, headers: CORS_HEADERS },
      );
    }
    token = (await rpcRes.json()) as string;
  } catch {
    return NextResponse.json(
      { error: "Verbindung zur Datenbank fehlgeschlagen." },
      { status: 502, headers: CORS_HEADERS },
    );
  }

  // 2. Send the double-opt-in confirmation email to the subscriber.
  const confirmUrl = `${siteUrl}/newsletter-bestaetigt?token=${encodeURIComponent(token)}`;
  const result = await sendEmail({
    to: email,
    subject: "Bitte bestätige deine Newsletter-Anmeldung",
    text: [
      "Hallo,",
      "",
      "bitte bestätige deine Anmeldung zum FitGit-Newsletter, indem du auf den folgenden Link klickst:",
      "",
      confirmUrl,
      "",
      "Wenn du dich nicht angemeldet hast, kannst du diese E-Mail einfach ignorieren – ohne Bestätigung wird nichts an dich verschickt.",
      "",
      "FitGit",
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
