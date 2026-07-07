export const ADMIN_COOKIE_NAME = "fitgit_admin_session";

export async function computeAdminToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`fitgit-admin:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
