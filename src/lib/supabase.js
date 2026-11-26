import { createClient } from '@supabase/supabase-js';

// Only the public (publishable / anon) key belongs here. It is safe in the browser
// because Row Level Security in the database decides what it may read or write.
// Never put the service_role / secret key in any VITE_ variable: those are bundled
// into the public website.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The staff admin and the customer site keep separate sign-ins (different storage keys),
// so being signed in on one never affects the other, even with both open in other tabs.
const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
const storageKey = isAdmin ? 'nilepods-admin-auth' : 'nilepods-customer-auth';

export const supabase = url && key ? createClient(url, key, { auth: { storageKey } }) : null;

if (!supabase && import.meta.env.DEV) {
  console.warn('Supabase is not configured: copy .env.example to .env and fill in the values.');
}
