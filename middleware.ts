import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, computeAdminToken } from "@/lib/auth/adminSession";

// Admin-Gate für alle Generator-Bereiche (Trainingsplan + Ernährungsplan).
// Muss `middleware.ts` heißen und `middleware` exportieren, damit Next.js es
// überhaupt ausführt — als `proxy.ts` lief es faktisch nie.
//
// Die Login-Seite selbst (`/generator/login`) liegt außerhalb des Matchers,
// sonst gäbe es eine Redirect-Schleife.
export async function middleware(request: NextRequest) {
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
