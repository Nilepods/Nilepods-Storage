import { supabase } from './supabase.js';

// Email-link sign-in (no passwords). Supabase emails a link; clicking it brings the
// person back to `returnPath` on this site, already signed in.
export async function sendSignInLink(email, returnPath) {
  if (!supabase) throw new Error('Sign-in is not available right now.');
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: window.location.origin + returnPath, shouldCreateUser: true },
  });
  if (error) {
    if (/rate limit|security purposes|seconds/i.test(error.message)) throw new Error('Please wait a minute before asking for another link.');
    throw new Error('Could not send the sign-in link. Check the email address and try again.');
  }
}

// Calls fn(session) now and whenever the person signs in or out.
export function watchSession(fn) {
  if (!supabase) { fn(null); return () => {}; }
  supabase.auth.getSession().then(({ data }) => fn(data.session));
  const { data } = supabase.auth.onAuthStateChange((_event, session) => fn(session));
  return () => data.subscription.unsubscribe();
}

// Records this sign-in and returns { email, name, role } (role null for customers).
export async function recordSignIn() {
  const { data, error } = await supabase.rpc('record_sign_in');
  if (error) throw error;
  return (data && data[0]) || null;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}
