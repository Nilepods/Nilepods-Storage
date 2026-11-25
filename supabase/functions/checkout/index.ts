// Starts a card payment for a studio session or a package.
//  1. Validates and saves the booking via the database (price is computed there; the slot is held 20 min).
//  2. Creates a Paymob payment intention.
//  3. Returns the URL of Paymob's hosted checkout. Card details are entered there, never on our site.
import { adminClient } from '../_shared/admin.ts';
import { ALLOWED_ORIGINS, PAYMOB_API, PAYMOB_CARD_INTEGRATION_ID, PAYMOB_PUBLIC_KEY } from '../_shared/config.ts';

const SERVICE_NAMES: Record<string, string> = { rec: 'Recording Only', mix: 'Recording + Live Edit', pro: 'Recording + Pro Edit' };
const FRIENDLY: Record<string, string> = {
  slot_taken: 'Sorry, that time was just booked. Please pick another time.',
  closed_friday: 'The studio is closed on Fridays.',
  outside_opening_hours: 'Sessions run between 3 PM and 11 PM.',
  in_the_past: 'That time has already passed. Please pick another time.',
  too_far_ahead: 'Bookings open up to 60 days ahead.',
  invalid_people: 'Too many people for this setup.',
  too_many_requests: 'Too many attempts. Please wait a while and try again.',
};

function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function reply(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });
}

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const int = (v: unknown) => (Number.isInteger(v) ? (v as number) : null);

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405, origin);
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return reply({ error: 'Origin not allowed' }, 403, origin);

  let b: Record<string, any>;
  try { b = await req.json(); } catch { return reply({ error: 'Invalid request' }, 400, origin); }

  const info = b.info ?? {};
  const first = str(info.first, 80), last = str(info.last, 80), email = str(info.email, 254);
  const phone = str(info.phone, 30), wa = info.wa === true;
  if (!first || !last || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply({ error: 'Please check your name and email.' }, 400, origin);
  }

  const db = adminClient();
  let ref: string, total: number, itemName: string, table: string;

  if (b.kind === 'session') {
    const ex = b.extras ?? {};
    const { data, error } = await db.rpc('create_booking', {
      p_service: str(b.service, 10), p_setup_id: str(b.setup, 10), p_date: str(b.date, 10),
      p_start_hour: int(b.start), p_people: int(b.people),
      p_extra_hours: int(ex.hour ?? 0), p_extra_cameras: int(ex.cam ?? 0), p_extra_mics: int(ex.mic ?? 0),
      p_photographer: (ex.photo ?? 0) > 0,
      p_first_name: first, p_last_name: last, p_email: email, p_phone: phone, p_whatsapp_ok: wa,
    }).single();
    if (error) {
      return reply({ error: FRIENDLY[error.message] ?? 'We could not create this booking. Please check the details.', code: error.message }, 400, origin);
    }
    ({ ref, total_egp: total } = data as { ref: string; total_egp: number });
    itemName = `${SERVICE_NAMES[b.service] ?? 'Studio session'} ${b.date} ${b.start}:00`;
    table = 'bookings';
  } else if (b.kind === 'package') {
    const { data, error } = await db.rpc('create_package_order', {
      p_service: str(b.service, 10), p_sessions: int(b.sessions),
      p_first_name: first, p_last_name: last, p_email: email, p_phone: phone, p_whatsapp_ok: wa,
    }).single();
    if (error) {
      return reply({ error: FRIENDLY[error.message] ?? 'We could not create this order. Please check the details.', code: error.message }, 400, origin);
    }
    ({ ref, total_egp: total } = data as { ref: string; total_egp: number });
    itemName = `${SERVICE_NAMES[b.service] ?? 'Package'} x${b.sessions} sessions`;
    table = 'package_orders';
  } else {
    return reply({ error: 'Invalid request' }, 400, origin);
  }

  const amount = total * 100;
  const release = () => db.rpc('record_payment', { p_ref: ref, p_success: false, p_amount_cents: amount, p_paymob_order_id: null, p_paymob_transaction_id: null });

  const secret = (Deno.env.get('PAYMOB_SECRET_KEY') ?? '').trim();
  if (!secret || /[^\x21-\x7e]/.test(secret)) {
    // Never log the key itself.
    console.error(`PAYMOB_SECRET_KEY is missing or contains invalid characters (length ${secret.length}). Re-enter it in Supabase -> Edge Functions -> Secrets.`);
    await release();
    return reply({ error: 'The payment service is not available right now. Please try again in a few minutes.', code: 'paymob_key_invalid' }, 502, origin);
  }

  let res: Response;
  try {
    res = await fetch(`${PAYMOB_API}/v1/intention/`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      currency: 'EGP',
      payment_methods: [PAYMOB_CARD_INTEGRATION_ID],
      items: [{ name: itemName.slice(0, 50), amount, description: `Nilepods ${ref}`, quantity: 1 }],
      billing_data: {
        first_name: first, last_name: last, email, phone_number: phone || 'NA',
        apartment: 'NA', floor: 'NA', street: 'NA', building: 'NA', city: 'Cairo', country: 'EG', state: 'NA', postal_code: 'NA',
      },
      special_reference: ref,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paymob-webhook`,
      redirection_url: `${origin}/?payment=${encodeURIComponent(ref)}`,
    }),
    });
  } catch (e) {
    console.error('Paymob request failed', String(e));
    await release();
    return reply({ error: 'The payment service is not available right now. Please try again in a few minutes.', code: 'paymob_unreachable' }, 502, origin);
  }
  const pj = await res.json().catch(() => ({}));
  if (!res.ok || !pj.client_secret) {
    console.error('Paymob intention failed', res.status, JSON.stringify(pj).slice(0, 500));
    // Release the hold so the slot is not blocked by a checkout that never started.
    await release();
    return reply({ error: 'The payment service is not available right now. Please try again in a few minutes.', code: `paymob_rejected_${res.status}` }, 502, origin);
  }
  console.log('Paymob intention created', ref, 'fields:', Object.keys(pj).join(','));

  const orderId = Number(pj.intention_order_id ?? pj.order_id ?? pj.order?.id) || null;
  if (orderId) await db.from(table).update({ paymob_order_id: orderId }).eq('ref', ref);

  const url = `${PAYMOB_API}/unifiedcheckout/?publicKey=${encodeURIComponent(PAYMOB_PUBLIC_KEY)}&clientSecret=${encodeURIComponent(pj.client_secret)}`;
  return reply({ ref, total, url }, 200, origin);
});
