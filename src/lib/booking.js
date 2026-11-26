import { supabase } from './supabase.js';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL ? import.meta.env.VITE_SUPABASE_URL + '/functions/v1' : '';

// Hours already taken (paid bookings and active 20-minute payment holds).
// Returns { 'Y-M-D|setupId': [[startHour, endHour], ...] } using the same unpadded
// date keys as the booking calendar. No personal data is returned.
export async function loadBusySlots(fromDate, toDate) {
  if (!supabase) return {};
  const { data, error } = await supabase.rpc('get_busy_slots', { p_from: isoDate(fromDate), p_to: isoDate(toDate) });
  if (error) throw error;
  const map = {};
  for (const r of data || []) {
    const [y, m, d] = r.day.split('-').map(Number);
    const k = y + '-' + m + '-' + d + '|' + r.setup_id;
    (map[k] = map[k] || []).push([r.start_hour, r.end_hour]);
  }
  return map;
}

// Saves the booking and returns { ref, total, url } where url is Paymob's hosted checkout
// (card: the slot is held 20 minutes), or { ref, total, cash: true } for pay-at-the-studio
// (confirmed straight away). Throws an Error with a customer-friendly message.
export async function startCheckout(payload, accessToken) {
  if (!FUNCTIONS_URL) throw new Error('Online booking is not available right now.');
  let res;
  try {
    res = await fetch(FUNCTIONS_URL + '/checkout', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
        accessToken ? { Authorization: 'Bearer ' + accessToken } : {}),
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Could not reach the booking service. Check your connection and try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !(body.url || body.cash)) {
    const err = new Error(body.error || 'Something went wrong. Please try again.');
    err.code = body.code;
    throw err;
  }
  return body;
}

// Sends Paymob's signed redirect result to the server (which checks the signature).
export function forwardPaymobResult(search) {
  if (!FUNCTIONS_URL) return;
  fetch(FUNCTIONS_URL + '/paymob-webhook' + search, { method: 'GET' }).catch(function () {});
}

// Status of one booking / package after returning from Paymob.
export async function getPaymentStatus(ref) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_payment_status', { p_ref: ref });
  if (error) throw error;
  return (data && data[0]) || null;
}

export function isoDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
