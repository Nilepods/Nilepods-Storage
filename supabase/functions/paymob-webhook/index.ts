// Receives Paymob's "transaction processed" callback, verifies its HMAC signature,
// and records the result. Unsigned or tampered requests are rejected.
import { adminClient } from '../_shared/admin.ts';
import { sendBookingEmails } from '../_shared/notify.ts';

// Field order defined by Paymob for the transaction-callback HMAC.
const HMAC_FIELDS = [
  'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction', 'id',
  'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
  'is_voided', 'order.id', 'owner', 'pending', 'source_data.pan', 'source_data.sub_type',
  'source_data.type', 'success',
];

const get = (o: any, path: string) => path.split('.').reduce((v, k) => (v == null ? v : v[k]), o);

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Paymob's browser redirect carries the same signed fields as query parameters
// (with "order" instead of "order.id"). The site forwards them here as a backup,
// so a booking is confirmed even if the server-to-server callback is late or missing.
function objFromQuery(q: URLSearchParams) {
  const o: any = { order: { id: q.get('order') }, source_data: {} };
  for (const f of HMAC_FIELDS) {
    if (f === 'order.id') continue;
    const v = q.get(f);
    if (f.startsWith('source_data.')) o.source_data[f.slice(12)] = v; else o[f] = v;
  }
  for (const b of ['success', 'pending', 'is_refunded', 'is_voided']) o[b] = o[b] === 'true' ? true : o[b] === 'false' ? false : o[b];
  return o;
}

const CORS = { 'Access-Control-Allow-Origin': '*' };

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const received = (url.searchParams.get('hmac') ?? '').toLowerCase();
  let obj: any;
  if (req.method === 'GET') {
    if (!received || !url.searchParams.get('id')) return new Response('ok', { headers: CORS });
    obj = objFromQuery(url.searchParams);
    // Only the signed Paymob order id is used to find the booking (looked up below).
  } else if (req.method === 'POST') {
    let body: any;
    try { body = await req.json(); } catch { return new Response('bad request', { status: 400 }); }
    if (body?.type !== 'TRANSACTION' || !body.obj) return new Response('ignored');
    obj = body.obj;
  } else {
    return new Response('ok', { headers: CORS });
  }

  const message = HMAC_FIELDS.map((f) => { const v = get(obj, f); return v == null ? '' : String(v); }).join('');
  const expected = await hmacHex(Deno.env.get('PAYMOB_HMAC_SECRET') ?? '', message);
  if (!received || !safeEqual(expected, received)) {
    console.warn('Rejected Paymob', req.method, 'with bad HMAC', obj?.id);
    return new Response('invalid signature', { status: 401, headers: CORS });
  }

  // Refunds, voids and still-pending transactions are not booking confirmations.
  if (obj.pending || obj.is_refunded || obj.is_voided) return new Response('noted', { headers: CORS });

  const db = adminClient();
  // The signed order id is the trusted link to our booking; the reference fields are a fallback.
  let ref: string | null = null;
  if (obj.order?.id) {
    for (const table of ['bookings', 'package_orders']) {
      const { data } = await db.from(table).select('ref').eq('paymob_order_id', Number(obj.order.id)).maybeSingle();
      if (data?.ref) { ref = data.ref; break; }
    }
  }
  if (!ref) ref = obj.order?.merchant_order_id ?? obj.special_reference ?? null;
  if (!ref) {
    console.error('Paymob callback without a known reference', obj.id, obj.order?.id);
    return new Response('unknown order');
  }

  const { data, error } = await db.rpc('record_payment', {
    p_ref: String(ref), p_success: obj.success === true, p_amount_cents: Number(obj.amount_cents),
    p_paymob_order_id: Number(obj.order?.id) || null, p_paymob_transaction_id: Number(obj.id) || null,
  });
  if (error) {
    console.error('record_payment failed', ref, error.message);
    return new Response('error', { status: 500 });
  }
  console.log('Paymob', req.method === 'GET' ? 'redirect' : 'callback', ref, data);
  if (data === 'confirmed' || data === 'paid_slot_lost' || data === 'amount_mismatch') {
    // deno-lint-ignore no-explicit-any
    const rt = (globalThis as any).EdgeRuntime;
    const p = sendBookingEmails(String(ref));
    if (rt?.waitUntil) rt.waitUntil(p); else await p;
  }
  return new Response('ok');
});
