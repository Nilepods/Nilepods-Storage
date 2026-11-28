// WhatsApp messages through Meta's WhatsApp Cloud API.
//
// Secrets (Supabase -> Edge Functions -> Secrets):
//   WHATSAPP_TOKEN     - a permanent System User access token with whatsapp_business_messaging permission
//   WHATSAPP_PHONE_ID  - the "Phone number ID" of the studio's WhatsApp number (from WhatsApp Manager / API Setup)
// Until both are set, nothing is sent and the site works as before.
//
// Business-initiated WhatsApp messages must use templates approved by Meta. The names below must match
// the templates created in WhatsApp Manager exactly (see docs/whatsapp-templates.md for their text).

export const WA_TEMPLATES = {
  bookingConfirmed: 'booking_confirmed',   // customer, new booking      {{1}} name {{2}} date {{3}} time {{4}} service {{5}} room {{6}} ref
  bookingMoved: 'booking_moved',           // customer, rescheduled      same as above
  operatorBooking: 'operator_booking',     // operators                  {{1}} New/Moved {{2}} date {{3}} time {{4}} service {{5}} room {{6}} client {{7}} people {{8}} ref
  otp: 'account_otp',                      // authentication template, code in {{1}} and in the copy-code button
};
export const WA_LANG = 'en';

export function waConfigured(): boolean {
  return !!(Deno.env.get('WHATSAPP_TOKEN') ?? '').trim() && !!(Deno.env.get('WHATSAPP_PHONE_ID') ?? '').trim();
}

// "010 1234 5678", "+20 10...", "0020..." -> "201012345678". Returns '' when it can't be a phone number.
export function waNumber(raw: string | null | undefined): string {
  let n = String(raw ?? '').replace(/\D/g, '');
  if (n.startsWith('00')) n = n.slice(2);
  if (/^01\d{9}$/.test(n)) n = '2' + n;            // Egyptian mobile typed locally
  return /^[1-9]\d{7,14}$/.test(n) ? n : '';
}

type Comp = Record<string, unknown>;

async function sendTemplate(to: string, name: string, bodyParams: string[], extra: Comp[] = []): Promise<boolean> {
  const token = (Deno.env.get('WHATSAPP_TOKEN') ?? '').trim(), phoneId = (Deno.env.get('WHATSAPP_PHONE_ID') ?? '').trim();
  if (!token || !phoneId) { console.log('WhatsApp not configured; skipped', name); return false; }
  const num = waNumber(to);
  if (!num) { console.warn('WhatsApp: bad number, skipped', name); return false; }
  const components: Comp[] = [];
  if (bodyParams.length) components.push({ type: 'body', parameters: bodyParams.map((t) => ({ type: 'text', text: String(t).slice(0, 900) })) });
  components.push(...extra);
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: num, type: 'template', template: { name, language: { code: WA_LANG }, components } }),
  });
  if (!res.ok) { console.error('WhatsApp send failed', name, res.status, (await res.text()).slice(0, 500)); return false; }
  return true;
}

export function sendWhatsAppBooking(to: string, moved: boolean, p: { name: string; date: string; time: string; service: string; room: string; ref: string }) {
  return sendTemplate(to, moved ? WA_TEMPLATES.bookingMoved : WA_TEMPLATES.bookingConfirmed, [p.name, p.date, p.time, p.service, p.room, p.ref]);
}

export function sendWhatsAppOperator(to: string, p: { label: string; date: string; time: string; service: string; room: string; client: string; people: string; ref: string }) {
  return sendTemplate(to, WA_TEMPLATES.operatorBooking, [p.label, p.date, p.time, p.service, p.room, p.client, p.people, p.ref]);
}

export function sendWhatsAppOtp(to: string, code: string) {
  return sendTemplate(to, WA_TEMPLATES.otp, [code], [{ type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] }]);
}
