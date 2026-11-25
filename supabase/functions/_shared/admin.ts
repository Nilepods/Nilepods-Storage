import { createClient } from 'jsr:@supabase/supabase-js@2';

// Server-side client with full database access. Only ever used inside Edge Functions.
export function adminClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  let key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!key) {
    try { key = Object.values(JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}'))[0] as string; } catch { /* ignore */ }
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
