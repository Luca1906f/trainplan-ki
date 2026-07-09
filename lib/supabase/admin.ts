import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client with the service-role key. Bypasses RLS so the
 * admin generator can write a plan into a specific user's account. NEVER import
 * this into client components — the service-role key must stay server-side.
 */
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY sind serverseitig nicht gesetzt.',
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
