import { supabase } from './supabase.js';

// Customer and staff sign-in.
// Customers use email + password (created when they first book), with "forgot password"
// and an email-link fallback. Staff use the email link (see admin).

const need = () => { if (!supabase) throw new Error('Sign-in is not available right now.'); };
const rateLimited = (e) => /rate limit|security purposes|seconds/i.test(e?.message || '');

// Email-link sign-in (no password).
export async function sendSignInLink(email, returnPath) {
  need();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: window.location.origin + returnPath, shouldCreateUser: true },
  });
  if (error) {
    if (rateLimited(error)) throw new Error('Please wait a minute before asking for another link.');
    throw new Error('Could not send the sign-in link. Check the email address and try again.');
  }
}

export async function signInWithPassword(email, password) {
  need();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) {
    const e = new Error(/not confirmed/i.test(error.message) ? 'Your email is not confirmed yet. Find the email "Welcome to Nilepods - confirm your email" (check Promotions and Spam) and tap Confirm, or tap "Email me a sign-in link instead" below.'
      : /invalid/i.test(error.message) ? 'Wrong email or password.' : 'Could not sign in. Please try again.');
    e.code = /not confirmed/i.test(error.message) ? 'not_confirmed' : /invalid/i.test(error.message) ? 'invalid' : 'other';
    throw e;
  }
  return data.session;
}

// Creates an account. Returns 'created' (a confirmation email was sent), 'signed_in'
// (email confirmation is off), or 'exists' (this email already has an account).
export async function signUpWithPassword(email, password, profile) {
  need();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(), password,
    options: { data: profile, emailRedirectTo: window.location.origin + '/?account=1' },
  });
  if (error) {
    if (/already registered|already exists/i.test(error.message)) return 'exists';
    if (rateLimited(error)) throw new Error('Too many attempts. Please wait a minute and try again.');
    if (/password/i.test(error.message)) throw new Error('Please choose a stronger password (at least 8 characters).');
    throw new Error('Could not create your account. Please try again.');
  }
  // Supabase returns a user with no identities when the email is already registered.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return 'exists';
  return data.session ? 'signed_in' : 'created';
}

export async function sendPasswordReset(email, returnPath = '/?account=1&reset=1') {
  need();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: window.location.origin + returnPath });
  if (error) throw new Error(rateLimited(error) ? 'Please wait a minute before asking again.' : 'Could not send the reset email. Check the address and try again.');
}

export async function setPassword(password) {
  need();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(/same/i.test(error.message) ? 'That is already your password.' : 'Could not save the password. Use at least 8 characters.');
}

// Saves name/phone on the account so the booking form can skip "Your information".
export async function saveProfile(profile) {
  if (supabase) await supabase.auth.updateUser({ data: profile });
}

// Calls fn(session, event) now and whenever the person signs in or out.
export function watchSession(fn) {
  if (!supabase) { fn(null, 'INITIAL'); return () => {}; }
  supabase.auth.getSession().then(({ data }) => fn(data.session, 'INITIAL'));
  const { data } = supabase.auth.onAuthStateChange((event, session) => fn(session, event));
  return () => data.subscription.unsubscribe();
}

// Records this sign-in and returns { email, name, role } (role null for customers).
export async function recordSignIn() {
  const { data, error } = await supabase.rpc('record_sign_in');
  if (error) throw error;
  return (data && data[0]) || null;
}

export async function signOut() {
  // 'local' signs out this browser only, not the account's other devices and sessions.
  if (supabase) await supabase.auth.signOut({ scope: 'local' });
}
