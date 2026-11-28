// Confirms that a signed-in customer owns their phone number, with a 6-digit code sent by WhatsApp.
//   POST { action: 'send', phone }  -> sends a code (max 1 per minute, 5 per hour)
//   POST { action: 'verify', code } -> on success, stores the number on the account as verified
// The verified number is kept in app_metadata.phone_verified, which only the server can change.
import { adminClient } from '../_shared/admin.ts';
import { ALLOWED_ORIGINS } from '../_shared/config.ts';
import { sendWhatsAppOtp, waConfigured, waNumber } from '../_shared/whatsapp.ts';

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

async function hash(code: string, userId: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code + ':' + userId));
  return Array.from(new Uint8Array(d)).map((x) => x.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405, origin);
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return reply({ error: 'Origin not allowed' }, 403, origin);

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const db = adminClient();
  const { data: u } = token ? await db.auth.getUser(token) : { data: { user: null } };
  const user = u?.user;
  if (!user) return reply({ error: 'Please sign in first.' }, 401, origin);

  let body: { action?: string; phone?: string; code?: string };
  try { body = await req.json(); } catch { return reply({ error: 'Bad request' }, 400, origin); }

  if (body.action === 'send') {
    if (!waConfigured()) return reply({ error: 'WhatsApp codes are not available yet. Please try again later.' }, 503, origin);
    const phone = waNumber(body.phone);
    if (!phone) return reply({ error: 'Please enter a valid mobile number, for example 010 1234 5678.' }, 400, origin);
    const { data: prev } = await db.from('phone_otps').select('*').eq('user_id', user.id).maybeSingle();
    const now = Date.now();
    let sent = 1, windowStart = new Date(now).toISOString();
    if (prev) {
      const sinceLast = now - (new Date(prev.expires_at).getTime() - 10 * 60_000);
      if (sinceLast < 60_000) return reply({ error: 'Please wait a minute before asking for another code.' }, 429, origin);
      const inWindow = now - new Date(prev.window_start).getTime() < 3600_000;
      if (inWindow && prev.sent_count >= 5) return reply({ error: 'Too many codes requested. Please try again in an hour.' }, 429, origin);
      if (inWindow) { sent = prev.sent_count + 1; windowStart = prev.window_start; }
    }
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
    const ok = await sendWhatsAppOtp(phone, code);
    if (!ok) return reply({ error: 'We could not send a WhatsApp code to that number. Check it has WhatsApp and try again.' }, 502, origin);
    await db.from('phone_otps').upsert({ user_id: user.id, phone, code_hash: await hash(code, user.id), expires_at: new Date(now + 10 * 60_000).toISOString(),
      attempts: 0, sent_count: sent, window_start: windowStart });
    return reply({ ok: true, phone }, 200, origin);
  }

  if (body.action === 'verify') {
    const code = String(body.code ?? '').replace(/\D/g, '');
    const { data: row } = await db.from('phone_otps').select('*').eq('user_id', user.id).maybeSingle();
    if (!row || new Date(row.expires_at).getTime() < Date.now()) return reply({ error: 'That code has expired. Please ask for a new one.' }, 400, origin);
    if (row.attempts >= 5) return reply({ error: 'Too many wrong codes. Please ask for a new one.' }, 429, origin);
    if (code.length !== 6 || (await hash(code, user.id)) !== row.code_hash) {
      await db.from('phone_otps').update({ attempts: row.attempts + 1 }).eq('user_id', user.id);
      return reply({ error: 'That code is not right. Please check it and try again.' }, 400, origin);
    }
    await db.auth.admin.updateUserById(user.id, { app_metadata: { ...(user.app_metadata ?? {}), phone_verified: row.phone } });
    await db.from('phone_otps').delete().eq('user_id', user.id);
    return reply({ ok: true, phone: row.phone }, 200, origin);
  }

  return reply({ error: 'Bad request' }, 400, origin);
});
