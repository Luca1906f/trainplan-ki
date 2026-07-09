import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, computeAdminToken } from "@/lib/auth/adminSession";
import { getSupabaseUser } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Admin-Gate für den Trainingsplan-Generator (unverändert).
  if (path === "/generator") {
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

  // Supabase-Login für den Ernährungsplaner + das Tracking.
  if (path.startsWith("/ernaehrungsplan") || path.startsWith("/heute")) {
    const { user, response, configured } = await getSupabaseUser(request);
    // Falls Supabase (noch) nicht konfiguriert ist: Seite normal durchlassen,
    // damit der Rest der Site nicht bricht.
    if (!configured) return NextResponse.next();
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/generator", "/ernaehrungsplan/:path*", "/heute/:path*"],
};
