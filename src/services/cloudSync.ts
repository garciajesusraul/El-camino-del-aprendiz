import { supabase, isSupabaseConfigured } from './supabase';
import { getFamilyCode, getSyncIntervalMinutes } from './family';
import { AppState } from '../types';
import { loadAppState, saveAppState } from './storage';

export async function syncStateToCloud(state: AppState): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Supabase no configurado' };
  const familyCode = getFamilyCode();
  if (!familyCode) return { ok: false, error: 'Sin family_code' };
  try {
    // Snapshot completo (backup)
    const { error: snapErr } = await supabase
      .from('app_state_snapshots')
      .upsert({ family_code: familyCode, state: state as any, updated_at: new Date().toISOString() }, { onConflict: 'family_code' });
    if (snapErr) return { ok: false, error: snapErr.message };

    // También intenta sync granular si las tablas existen (ignora errores PGRST205)
    // profiles
    try {
      const profilesPayload = state.profiles.map(p => ({
        id: p.id,
        family_code: familyCode,
        name: p.name,
        role: p.role,
        age: p.age,
        gender: p.gender || 'boy',
        grade_level: p.gradeLevel || 'segundo_grado',
        km_ganados: p.kmGanados,
        km_reales: p.kmReales,
        start_km: p.startKm,
        wisdom_points: p.wisdomPoints,
        life_points: p.lifePoints,
        coins: p.coins,
        level: p.level,
        current_streak: p.currentStreak,
        unlocked_cities: p.unlockedCities as any,
        unlocked_houses: p.unlockedHouses as any,
        avatar: p.avatar as any,
        inventory: p.inventory as any,
        pomodoro_minutes: p.pomodoroMinutes || 20,
        updated_at: new Date().toISOString(),
      }));
      if (profilesPayload.length) await supabase.from('profiles').upsert(profilesPayload as any);
    } catch {}

    // tasks (reemplazo simple: delete + insert para familia)
    try {
      if (state.tasks.length < 2000) {
        await supabase.from('tasks').delete().eq('family_code', familyCode);
        const tasksPayload = state.tasks.map(t => ({
          id: t.id,
          family_code: familyCode,
          user_id: t.userId || state.activeUserId,
          materia_id: t.materiaId,
          bimestre: t.bimestre,
          semana: t.semana,
          title: t.title,
          description: t.description || null,
          type: t.type,
          points: t.points,
          status: t.status,
          is_daily_habit: !!t.isDailyHabit,
          is_guide_complete: !!t.isGuideComplete,
          is_guide_subtask: !!t.isGuideSubtask,
          created_at: t.createdAt,
          submitted_at: (t as any).submittedAt || null,
          approved_at: (t as any).approvedAt || null,
          days_overdue: (t as any).daysOverdue || null,
          original_points: (t as any).originalPoints || null,
        }));
        if (tasksPayload.length) {
          // chunk to avoid limits
          const chunk = 500;
          for (let i = 0; i < tasksPayload.length; i += chunk) {
            await supabase.from('tasks').insert(tasksPayload.slice(i, i + chunk) as any);
          }
        }
      }
    } catch {}

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function loadStateFromCloud(): Promise<{ state: AppState | null; error?: string }> {
  if (!isSupabaseConfigured()) return { state: null, error: 'Supabase no configurado' };
  const familyCode = getFamilyCode();
  if (!familyCode) return { state: null, error: 'Sin family_code' };
  try {
    const { data, error } = await supabase.from('app_state_snapshots').select('state, updated_at').eq('family_code', familyCode).limit(1).maybeSingle();
    if (error) return { state: null, error: error.message };
    if (!data || !data.state) return { state: null };
    return { state: data.state as unknown as AppState };
  } catch (e: any) {
    return { state: null, error: e?.message || String(e) };
  }
}

export async function migrateLocalToCloudIfNeeded(): Promise<void> {
  const { state } = await loadStateFromCloud();
  if (state) return; // already has cloud data
  const local = loadAppState();
  await syncStateToCloud(local);
}

let syncTimer: number | null = null;
let lastSyncAt = 0;

export function schedulePeriodicSync(getState: () => AppState, onSync?: (ok: boolean, msg?: string) => void) {
  if (syncTimer) window.clearInterval(syncTimer);
  const intervalMs = getSyncIntervalMinutes() * 60 * 1000;
  syncTimer = window.setInterval(async () => {
    const state = getState();
    const res = await syncStateToCloud(state);
    lastSyncAt = Date.now();
    onSync?.(res.ok, res.error);
  }, intervalMs) as unknown as number;

  // also sync on visibility change
  const handler = async () => {
    if (document.visibilityState === 'visible' && Date.now() - lastSyncAt > 60_000) {
      const state = getState();
      await syncStateToCloud(state);
      lastSyncAt = Date.now();
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => {
    if (syncTimer) window.clearInterval(syncTimer);
    document.removeEventListener('visibilitychange', handler);
  };
}

export function getLastSyncAt(): number { return lastSyncAt; }
