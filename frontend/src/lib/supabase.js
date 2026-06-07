import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client instance for the frontend.
 * Used for authentication and direct client-side operations.
 * The anon key is safe to expose in the browser — Supabase uses
 * Row Level Security (RLS) to protect data.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a real client if credentials exist, otherwise create a placeholder
// that won't crash the app during development without Supabase setup
let supabase;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
} else {
  console.warn(
    '⚠️ Supabase credentials not found. Auth features will not work.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env'
  );

  // Mock client so the app doesn't crash — all methods return null/empty
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithOAuth: async () => ({ error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: { message: 'Supabase not configured' } }),
      updateUser: async () => ({ error: { message: 'Supabase not configured' } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  };
}

export { supabase };
