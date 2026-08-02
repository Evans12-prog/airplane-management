import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

function isPlaceholderValue(value: string) {
  return [
    '',
    'https://placeholder.supabase.co',
    'https://your-project-ref.supabase.co',
    'placeholder-key',
    'your-anon-key',
    'your-project-ref.supabase.co',
  ].includes(value);
}

const isConfigured = Boolean(
  rawSupabaseUrl &&
    rawSupabaseAnonKey &&
    !isPlaceholderValue(rawSupabaseUrl) &&
    !isPlaceholderValue(rawSupabaseAnonKey),
);

const supabaseUrl = isConfigured ? rawSupabaseUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isConfigured ? rawSupabaseAnonKey : 'placeholder-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'skyair-auth-token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Re-export as admin alias — same client in browser context (service role is backend-only)
export const supabaseAdmin = supabase;
export const isSupabaseConfigured = isConfigured;
