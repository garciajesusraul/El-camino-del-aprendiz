import { supabase, isSupabaseConfigured } from './supabase';

export const FAMILY_CODE_KEY = 'rpg_family_code';
export const SYNC_INTERVAL_KEY = 'rpg_sync_interval_minutes';
// SUPERADMIN_PASS ya NO está en el código: se verifica contra Supabase (tabla superadmin_config)
// Fallback offline via VITE_SUPERADMIN_PASS si Supabase no está configurado
const FALLBACK_SUPERADMIN_PASS = (import.meta as any).env?.VITE_SUPERADMIN_PASS as string | undefined || 'uruguay';
export const SUPERADMIN_FAMILY = 'LEON';

export function normalizeFamilyCode(code: string): string {
  return code.trim().toUpperCase();
}

export function getFamilyCode(): string | null {
  try {
    const v = localStorage.getItem(FAMILY_CODE_KEY);
    return v ? normalizeFamilyCode(v) : null;
  } catch { return null; }
}

export function setFamilyCode(code: string): void {
  localStorage.setItem(FAMILY_CODE_KEY, normalizeFamilyCode(code));
}

export function clearFamilyCode(): void {
  try { localStorage.removeItem(FAMILY_CODE_KEY); } catch {}
}

export function isLeonFamily(code: string | null): boolean {
  return normalizeFamilyCode(code || '') === SUPERADMIN_FAMILY;
}

export function getSyncIntervalMinutes(): number {
  try {
    const v = localStorage.getItem(SYNC_INTERVAL_KEY);
    const n = v ? parseInt(v, 10) : 30;
    return [5, 10, 15, 30, 60].includes(n) ? n : 30;
  } catch { return 30; }
}

export function setSyncIntervalMinutes(minutes: number): void {
  const allowed = [5, 10, 15, 30, 60];
  const m = allowed.includes(minutes) ? minutes : 30;
  localStorage.setItem(SYNC_INTERVAL_KEY, String(m));
}

export async function validateFamilyCode(code: string): Promise<{ ok: boolean; exists: boolean; error?: string }> {
  const norm = normalizeFamilyCode(code);
  if (!norm) return { ok: false, exists: false, error: 'Código vacío' };
  if (!isSupabaseConfigured()) {
    // offline mode: allow LEON always, others if already cached?
    // For now allow any code locally when supabase not configured
    return { ok: true, exists: true };
  }
  const { data, error } = await supabase.from('families').select('code').eq('code', norm).limit(1);
  if (error) return { ok: false, exists: false, error: error.message };
  return { ok: true, exists: !!data && data.length > 0 };
}

export async function fetchFamilies(): Promise<{ code: string; display_name: string; created_at?: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('families').select('code, display_name, created_at').order('created_at');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createFamily(code: string, displayName?: string): Promise<void> {
  const norm = normalizeFamilyCode(code);
  if (!norm) throw new Error('Código vacío');
  if (!isSupabaseConfigured()) throw new Error('Supabase no configurado');
  const { error } = await supabase.from('families').insert({ code: norm, display_name: displayName || `Familia ${norm}` });
  if (error) throw new Error(error.message);
  // ensure family_settings and play_stats rows
  await supabase.from('family_settings').upsert({ family_code: norm });
  await supabase.from('play_stats').upsert({ family_code: norm });
}

export async function deleteFamily(code: string): Promise<void> {
  const norm = normalizeFamilyCode(code);
  if (norm === SUPERADMIN_FAMILY) throw new Error('No se puede eliminar LEON');
  if (!isSupabaseConfigured()) throw new Error('Supabase no configurado');
  const { error } = await supabase.from('families').delete().eq('code', norm);
  if (error) throw new Error(error.message);
}

export async function checkSuperadminPassword(input: string): Promise<boolean> {
  const trimmed = (input || '').trim();
  if (!trimmed) return false;
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('verify_superadmin_password', { p_input: trimmed } as any);
      if (!error && typeof data === 'boolean') return data;
      // Si la función no existe aún (schema no ejecutado), fallback a comparación local
      console.warn('[superadmin] RPC verify_superadmin_password falló, usando fallback:', error?.message);
    } catch (e) {
      console.warn('[superadmin] error RPC', e);
    }
  }
  // Fallback offline / sin migrar: compara contra env o default
  return trimmed === FALLBACK_SUPERADMIN_PASS;
}

// Mantener versión síncrona deprecated para compatibilidad (usa fallback local solamente)
export function checkSuperadminPasswordSync(input: string): boolean {
  return (input || '').trim() === FALLBACK_SUPERADMIN_PASS;
}
