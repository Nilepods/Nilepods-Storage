// Moves a booked session to a new time, then emails the customer and the team.
// The rules (owner only, 48+ hours before for customers, staff any time, slot free)
// live in the database function reschedule_booking, called as the signed-in person.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { sendBookingEmails } from '../_shared/notify.ts';
import { ALLOWED_ORIGINS } from '../_shared/config.ts';

const FRIENDLY: Record<string, string> = {
  not_found: 'We could not find that booking.',
  not_your_booking: 'This booking belongs to a different account.',
  cannot_reschedule: 'This booking can no longer be moved.',
  too_late_to_reschedule: 'Sessions can only be moved up to 48 hours before they start. Please contact us.',
  closed_friday: 'The studio is closed on Fridays.',
  too_far_ahead: 'Bookings open up to 60 days ahead.',
  outside_opening_hours: 'Sessions run between 3 PM and 11 PM.',
  in_the_past: 'That time has already passed. Please pick another time.',
  no_change: 'That is already your booked time.',
  slot_taken: 'Sorry, that time is taken. Please pick another time.',
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
  const ref = typeof b.ref === 'string' ? b.ref.slice(0, 20) : '';
  const date = typeof b.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : '';
  const start = Number.isInteger(b.start) ? (b.start as number) : null;
  if (!ref || !date || start === null) return reply({ error: 'Invalid request' }, 400, origin);

  // Runs as the signed-in person, so the database applies their rules (customer or staff).
  const asUser = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } }, auth: { persistSession: false },
  });
  const { data, error } = await asUser.rpc('reschedule_booking', { p_ref: ref, p_date: date, p_start_hour: start }).single();
  if (error) {
    return reply({ error: FRIENDLY[error.message] ?? 'Could not move this booking. Please try again.', code: error.message }, 400, origin);
  }
  console.log('Rescheduled', ref, data);
  // deno-lint-ignore no-explicit-any
  const rt = (globalThis as any).EdgeRuntime;
  const p = sendBookingEmails(ref, 'rescheduled');
  if (rt?.waitUntil) rt.waitUntil(p); else await p;
  return reply({ ok: true, ...(data as object) }, 200, origin);
});
