import { createClient } from '@supabase/supabase-js';

// Only the public (publishable / anon) key belongs here. It is safe in the browser
// because Row Level Security in the database decides what it may read or write.
// Never put the service_role / secret key in any VITE_ variable: those are bundled
// into the public website.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

if (!supabase && import.meta.env.DEV) {
  console.warn('Supabase is not configured: copy .env.example to .env and fill in the values.');
}
