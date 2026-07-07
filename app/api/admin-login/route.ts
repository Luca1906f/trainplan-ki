import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, computeAdminToken } from "@/lib/auth/adminSession";

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({}));
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD ist serverseitig nicht konfiguriert." },
      { status: 500 },
    );
  }

  if (typeof password !== "string" || password !== adminPassword) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const token = await computeAdminToken(adminPassword);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
