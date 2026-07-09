import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, computeAdminToken } from "@/lib/auth/adminSession";

// Beide Admin-Bereiche (Trainingsplan-Generator + Ernährungsplan-Generator)
// hängen hinter demselben Passwort-Gate. Kein Nutzer kann die KI auslösen.
export async function proxy(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.redirect(new URL("/generator/login", request.url));
  }

  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const expected = await computeAdminToken(adminPassword);
  if (cookie !== expected) {
    return NextResponse.redirect(new URL("/generator/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/generator", "/ernaehrungsplan/:path*"],
};
