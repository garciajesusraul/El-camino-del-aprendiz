import { createClient } from '@supabase/supabase-js';

const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const key = ((import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const supabaseEnabled = Boolean(url && key && (import.meta as any).env?.VITE_USE_SUPABASE !== 'false');

export const supabase = supabaseEnabled && url && key ? createClient(url, key) : null as unknown as ReturnType<typeof createClient>;

export function isSupabaseConfigured(): boolean {
  return supabaseEnabled && !!supabase;
}
