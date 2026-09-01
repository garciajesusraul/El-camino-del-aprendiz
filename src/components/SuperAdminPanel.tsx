import React, { useEffect, useState } from 'react';
import { checkSuperadminPassword, createFamily, deleteFamily, fetchFamilies, normalizeFamilyCode, isLeonFamily, getFamilyCode } from '../services/family';

export function SuperAdminPanel({ onClose }: { onClose: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [families, setFamilies] = useState<{ code: string; display_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const familyCode = getFamilyCode();

  useEffect(() => {
    if (!isLeonFamily(familyCode)) return;
    if (authed) refresh();
  }, [authed]);

  const refresh = async () => {
    setLoading(true); setErr(null);
    try { setFamilies(await fetchFamilies()); } catch (e: any) { setErr(e?.message || String(e)); } finally { setLoading(false); }
  };

  const handleAuth = () => {
    if (checkSuperadminPassword(pass)) { setAuthed(true); setPassError(null); }
    else setPassError('Contraseña incorrecta');
  };

  const handleCreate = async () => {
    const norm = normalizeFamilyCode(newCode);
    if (!norm) { setErr('Escribe un código'); return; }
    setLoading(true); setErr(null); setMsg(null);
    try { await createFamily(norm); setMsg(`Familia ${norm} creada`); setNewCode(''); await refresh(); } catch (e: any) { setErr(e?.message || String(e)); } finally { setLoading(false); }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`¿Eliminar familia ${code}? Se borrarán sus datos.`)) return;
    setLoading(true); setErr(null); setMsg(null);
    try { await deleteFamily(code); setMsg(`Familia ${code} eliminada`); await refresh(); } catch (e: any) { setErr(e?.message || String(e)); } finally { setLoading(false); }
  };

  if (!isLeonFamily(familyCode)) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-red-600 rounded-3xl p-6 max-w-md w-full text-center">
          <h3 className="font-black text-red-300">Acceso denegado</h3>
          <p className="text-xs text-slate-400 mt-2">SUPERADMIN solo visible en familia LEON. Tu familia actual: {familyCode || '—'}. Entra con código LEON.</p>
          <button onClick={onClose} className="mt-4 px-5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur flex items-center justify-center p-3">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-violet-500 rounded-3xl shadow-[0_16px_60px_rgba(0,0,0,0.85)] overflow-hidden">
        <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-violet-950 p-4 border-b border-violet-500/40 flex items-center justify-between">
          <h3 className="text-base font-black text-violet-300 flex items-center gap-2">🛡️ SUPERADMIN <span className="text-[10px] font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">LEON</span></h3>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700">✕</button>
        </div>
        <div className="p-4 overflow-y-auto space-y-4">
          {!authed ? (
            <div className="bg-slate-800/60 border border-violet-500/30 rounded-2xl p-4">
              <p className="text-xs text-slate-300 mb-2">Ingresa la contraseña de SUPERADMIN para gestionar familias.</p>
              <div className="flex gap-2">
                <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAuth()} placeholder="Contraseña" className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500" autoFocus />
                <button onClick={handleAuth} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm cursor-pointer">Entrar</button>
              </div>
              {passError && <p className="text-xs text-red-300 mt-2">{passError}</p>}
              <p className="text-[11px] text-slate-500 mt-2">Pista: uruguay (minúsculas)</p>
            </div>
          ) : (
            <>
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                <h4 className="text-xs font-black text-violet-300 mb-2">Crear familia</h4>
                <div className="flex gap-2">
                  <input value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="Ej: OVEJA, CABRA..." className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-black tracking-widest uppercase focus:outline-none focus:border-violet-500" />
                  <button onClick={handleCreate} disabled={loading} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm cursor-pointer">Crear</button>
                </div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-slate-300">Familias ({families.length})</h4>
                  <button onClick={refresh} disabled={loading} className="text-[11px] px-2 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 cursor-pointer">↻ Actualizar</button>
                </div>
                {loading && <p className="text-xs text-slate-500">Cargando...</p>}
                {families.length === 0 && !loading && <p className="text-xs text-slate-500">No hay familias o error de conexión. Ejecuta supabase_schema.sql en Supabase SQL Editor.</p>}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {families.map((f) => (
                    <div key={f.code} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                      <div>
                        <div className="text-sm font-black text-white tracking-widest">{f.code}</div>
                        <div className="text-[11px] text-slate-500">{f.display_name}</div>
                      </div>
                      <button onClick={() => handleDelete(f.code)} disabled={f.code === 'LEON'} className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${f.code === 'LEON' ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-50' : 'bg-red-600 hover:bg-red-500 text-white border-red-500'}`}>{f.code === 'LEON' ? 'Protegido' : 'Eliminar'}</button>
                    </div>
                  ))}
                </div>
              </div>
              {msg && <div className="bg-emerald-950/50 border border-emerald-600 text-emerald-200 text-xs rounded-xl p-2.5">{msg}</div>}
              {err && <div className="bg-red-950/50 border border-red-600 text-red-200 text-xs rounded-xl p-2.5">{err}</div>}
              <p className="text-[11px] text-slate-500">Eliminar borra la familia y sus datos (profiles, tasks, hábitos). No se puede eliminar LEON.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
