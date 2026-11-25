// Receives Paymob's "transaction processed" callback, verifies its HMAC signature,
// and records the result. Unsigned or tampered requests are rejected.
import { adminClient } from '../_shared/admin.ts';

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

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok');

  const received = (new URL(req.url).searchParams.get('hmac') ?? '').toLowerCase();
  let body: any;
  try { body = await req.json(); } catch { return new Response('bad request', { status: 400 }); }
  if (body?.type !== 'TRANSACTION' || !body.obj) return new Response('ignored');

  const obj = body.obj;
  const message = HMAC_FIELDS.map((f) => { const v = get(obj, f); return v == null ? '' : String(v); }).join('');
  const expected = await hmacHex(Deno.env.get('PAYMOB_HMAC_SECRET') ?? '', message);
  if (!received || !safeEqual(expected, received)) {
    console.warn('Rejected Paymob callback with bad HMAC', obj?.id);
    return new Response('invalid signature', { status: 401 });
  }

  // Refunds, voids and still-pending transactions are not booking confirmations.
  if (obj.pending || obj.is_refunded || obj.is_voided) return new Response('noted');

  const db = adminClient();
  let ref: string | null = obj.order?.merchant_order_id ?? obj.special_reference ?? null;
  if (!ref && obj.order?.id) {
    for (const table of ['bookings', 'package_orders']) {
      const { data } = await db.from(table).select('ref').eq('paymob_order_id', obj.order.id).maybeSingle();
      if (data?.ref) { ref = data.ref; break; }
    }
  }
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
  console.log('Paymob callback', ref, data);
  return new Response('ok');
});
