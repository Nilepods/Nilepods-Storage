// Staff cancel a booking or a package from the admin, then the customer and the team are emailed.
// Permissions are enforced in the database (called as the signed-in staff member):
// bookings: Owner or Manager (staff_update_booking); packages: Owner or Manager (staff_cancel_package).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { sendCancellationEmails } from '../_shared/notify.ts';
import { ALLOWED_ORIGINS } from '../_shared/config.ts';

const FRIENDLY: Record<string, string> = {
  not_staff: 'Only team members can do this.',
  not_allowed: 'Only the Owner or a Manager can cancel.',
  not_found: 'We could not find that order.',
  cannot_cancel: 'This package is already cancelled.',
};

function cors(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}
const reply = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405, origin);
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return reply({ error: 'Origin not allowed' }, 403, origin);
  const auth = req.headers.get('authorization') ?? '';
  if (!/^Bearer\s+\S+/i.test(auth)) return reply({ error: 'Please sign in first.' }, 401, origin);

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return reply({ error: 'Invalid request' }, 400, origin); }
  const kind = b.kind === 'package' ? 'package' : b.kind === 'booking' ? 'booking' : '';
  const ref = typeof b.ref === 'string' ? b.ref.slice(0, 20) : '';
  const notify = b.notify !== false;
  if (!kind || !ref) return reply({ error: 'Invalid request' }, 400, origin);

  const asUser = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } }, auth: { persistSession: false },
  });
  let cancelledSessions = 0;
  if (kind === 'booking') {
    const { error } = await asUser.rpc('staff_update_booking', { p_ref: ref, p_status: 'cancelled' });
    if (error) return reply({ error: FRIENDLY[error.message] ?? 'Could not cancel. Please try again.', code: error.message }, 400, origin);
  } else {
    const { data, error } = await asUser.rpc('staff_cancel_package', { p_ref: ref, p_cancel_bookings: b.cancelBookings === true });
    if (error) return reply({ error: FRIENDLY[error.message] ?? 'Could not cancel. Please try again.', code: error.message }, 400, origin);
    cancelledSessions = Number(data) || 0;
  }
  console.log('Staff cancelled', kind, ref, cancelledSessions);
  if (notify) {
    // deno-lint-ignore no-explicit-any
    const rt = (globalThis as any).EdgeRuntime;
    const p = sendCancellationEmails(ref, cancelledSessions);
    if (rt?.waitUntil) rt.waitUntil(p); else await p;
  }
  return reply({ ok: true, cancelledSessions }, 200, origin);
});
