// Booking emails: a confirmation to the customer and a "new booking" alert to the team.
// Sent through Brevo SMTP (same account as the sign-in emails). Port 465 is used because
// Supabase Edge Functions cannot open outgoing connections on port 587.
//
// Secrets (Supabase -> Edge Functions -> Secrets): BREVO_SMTP_USER, BREVO_SMTP_KEY
// Never throws: a failed email must not break a booking. Failures are logged.
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';
import { adminClient } from './admin.ts';
import { BOOKINGS_INBOX, SENDER, SITE_URL } from './config.ts';

const SERVICES: Record<string, string> = { rec: 'Recording Only', mix: 'Recording + Live Edit', pro: 'Recording + Pro Edit' };
const SETUPS: Record<string, string> = { s1: 'Setup 1', s2: 'Setup 2', s3: 'Setup 3', s4: 'Setup 4', s5: 'Setup 5', s6: 'Setup 6', s7: 'Setup 7' };

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const money = (n: number) => n.toLocaleString('en-US') + ' EGP';
const cairo = (iso: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', ...opts }).format(new Date(iso));
const hour = (iso: string) => cairo(iso, { hour: 'numeric', hour12: true }).replace(' ', ' ').toUpperCase();

function shell(title: string, intro: string, rows: [string, string][], cta?: { label: string; url: string }, footnote = '') {
  const rowHtml = rows.map(([k, v]) => `<tr><td style="padding:9px 0;border-bottom:1px solid #2A241C;font-size:14px;color:#A89C8B;">${esc(k)}</td><td align="right" style="padding:9px 0;border-bottom:1px solid #2A241C;font-size:14px;color:#FFFFFF;">${v}</td></tr>`).join('');
  const button = cta ? `<tr><td align="center" style="padding:8px 32px 28px;"><a href="${esc(cta.url)}" style="display:inline-block;background:#E2B872;color:#17120B;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 30px;border-radius:999px;">${esc(cta.label)}</a></td></tr>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#0E0C0A;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0E0C0A;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#17140F;border:1px solid #2A241C;border-radius:16px;font-family:Arial,Helvetica,sans-serif;">
<tr><td align="center" style="padding:32px 32px 4px;"><span style="font-size:28px;font-weight:bold;color:#FFFFFF;">nile</span><span style="font-size:28px;font-weight:bold;color:#0E0C0A;background:#FFFFFF;padding:0 6px 2px;border-radius:3px;margin-left:1px;">pods</span>
<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#E2B872;margin-top:10px;">Podcast &amp; video studios</div></td></tr>
<tr><td style="padding:22px 32px 6px;"><h1 style="margin:0 0 10px;font-size:23px;line-height:1.3;color:#FFFFFF;">${esc(title)}</h1><p style="margin:0;font-size:15px;line-height:1.7;color:#CFC5B5;">${intro}</p></td></tr>
<tr><td style="padding:14px 32px 22px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rowHtml}</table></td></tr>
${button}
${footnote ? `<tr><td style="padding:0 32px 30px;font-size:13px;line-height:1.6;color:#A89C8B;">${footnote}</td></tr>` : ''}
</table><p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7D7365;">Nilepods &middot; Cairo &middot; Open Saturday&ndash;Thursday, 3&ndash;11 PM</p>
</td></tr></table></body></html>`;
}

async function send(messages: { to: string; subject: string; html: string; replyTo?: string }[]) {
  const user = (Deno.env.get('BREVO_SMTP_USER') ?? '').trim(), pass = (Deno.env.get('BREVO_SMTP_KEY') ?? '').trim();
  if (!user || !pass) { console.error('Booking email not sent: BREVO_SMTP_USER / BREVO_SMTP_KEY secrets are missing'); return; }
  const client = new SMTPClient({ connection: { hostname: 'smtp-relay.brevo.com', port: 465, tls: true, auth: { username: user, password: pass } } });
  try {
    for (const m of messages) await client.send({ from: SENDER, to: m.to, replyTo: m.replyTo, subject: m.subject, html: m.html, content: 'auto' });
  } finally {
    await client.close().catch(() => {});
  }
}

// Sends the confirmation + team alert for a booking or package order, by reference.
export async function sendBookingEmails(ref: string): Promise<void> {
  try {
    const db = adminClient();
    const { data: b } = await db.from('bookings').select('*').eq('ref', ref).maybeSingle();
    const { data: o } = b ? { data: null } : await db.from('package_orders').select('*').eq('ref', ref).maybeSingle();
    const r = b ?? o;
    if (!r) { console.error('Booking email: reference not found', ref); return; }

    const cash = r.payment_method === 'cash', paid = r.payment_status === 'paid';
    const payLine = paid ? `Paid by card &middot; ${money(r.total_egp)}` : cash ? `${money(r.total_egp)} &middot; pay at the studio` : money(r.total_egp);
    const test = r.is_test ? '[TEST] ' : '';
    let rows: [string, string][], subjectWhat: string, intro: string, footnote: string;

    if (b) {
      const date = cairo(b.starts_at, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const time = `${hour(b.starts_at)} &ndash; ${hour(b.ends_at)}`;
      const extras = [b.extra_cameras ? `${b.extra_cameras} extra camera` : '', b.extra_mics ? `${b.extra_mics} extra mic` : '', b.photographer ? 'Photographer' : ''].filter(Boolean).join(', ') || 'None';
      rows = [['Order', esc(b.ref)], ['Date', esc(date)], ['Time', time], ['Service', esc(SERVICES[b.service] ?? b.service)], ['Setup', esc(SETUPS[b.setup_id] ?? b.setup_id)],
        ['People on camera', esc(b.people)], ['Extras', esc(extras)], ['Total', payLine]];
      subjectWhat = `${date.split(',')[0]} ${cairo(b.starts_at, { day: 'numeric', month: 'short' })}, ${hour(b.starts_at)}`;
      intro = `Hi ${esc(b.first_name)}, your session is booked. We can't wait to see you at the studio.`;
      footnote = (cash && !paid ? 'Please pay at the studio on the day. ' : '') + 'Please arrive 10 minutes early. To change or cancel, reply to this email.';
    } else {
      rows = [['Order', esc(o.ref)], ['Package', esc(`${SERVICES[o.service] ?? o.service} × ${o.sessions} sessions`)], ['Total', payLine]];
      subjectWhat = `${o.sessions}-session package`;
      intro = `Hi ${esc(o.first_name)}, your package is ${paid ? 'confirmed' : 'reserved'}. Our team will contact you to schedule your sessions.`;
      footnote = (cash && !paid ? 'Please pay at the studio. ' : '') + 'Questions? Just reply to this email.';
    }

    const customerHtml = shell(b ? "You're booked!" : 'Your Nilepods package', intro, rows, { label: 'View my bookings', url: `${SITE_URL}/?account=1` }, footnote);
    const staffRows: [string, string][] = [['Customer', esc(`${r.first_name} ${r.last_name}`)], ['Email', esc(r.email)], ['Phone', esc(r.phone || '—') + (r.whatsapp_ok ? ' (WhatsApp OK)' : '')], ...rows];
    const staffHtml = shell(b ? 'New booking' : 'New package order', `${esc(r.first_name)} ${esc(r.last_name)} just ${b ? 'booked a session' : 'ordered a package'}${r.is_test ? ' (test data)' : ''}.`, staffRows, { label: 'Open the admin', url: `${SITE_URL}/admin/` });

    await send([
      { to: r.email, replyTo: BOOKINGS_INBOX, subject: `${test}Your Nilepods booking: ${subjectWhat}`.trim(), html: customerHtml },
      { to: BOOKINGS_INBOX, replyTo: r.email, subject: `${test}New ${b ? 'booking' : 'package'}: ${r.first_name} ${r.last_name} · ${subjectWhat}`.trim(), html: staffHtml },
    ]);
    console.log('Booking emails sent', ref);
  } catch (e) {
    console.error('Booking email failed', ref, String(e));
  }
}
