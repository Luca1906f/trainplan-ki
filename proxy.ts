import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, computeAdminToken } from "@/lib/auth/adminSession";

// Admin-Gate für alle Generator-Bereiche (Trainingsplan + Ernährungsplan).
// Next.js 16 nennt die frühere "Middleware" jetzt "Proxy": Datei `proxy.ts`
// im Projekt-Root, exportierte Funktion `proxy` (`middleware.ts` funktioniert
// noch, ist aber deprecated).
//
// Die Login-Seite selbst (`/generator/login`) liegt außerhalb des Matchers,
// sonst gäbe es eine Redirect-Schleife.
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
  matcher: ["/generator", "/ernaehrungsplan/:path*", "/trainingsplan/:path*"],
};
