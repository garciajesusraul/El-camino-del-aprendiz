import React, { useState } from 'react';
import { normalizeFamilyCode, setFamilyCode, validateFamilyCode, isLeonFamily } from '../services/family';
import { isSupabaseConfigured } from '../services/supabase';

export function FamilyGate({ onEnter }: { onEnter: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnter = async () => {
    const norm = normalizeFamilyCode(code);
    if (!norm) { setError('Escribe el código familiar'); return; }
    setLoading(true); setError(null);
    try {
      if (isSupabaseConfigured()) {
        const res = await validateFamilyCode(norm);
        if (!res.ok) { setError(res.error || 'Error validando'); setLoading(false); return; }
        if (!res.exists) { setError(`Familia "${norm}" no existe. Pide al administrador principal que la cree.`); setLoading(false); return; }
      }
      setFamilyCode(norm);
      onEnter(norm);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-[0_16px_60px_rgba(0,0,0,0.8)] p-6">
        <div className="text-center mb-4">
          <h1 className="text-xl font-black text-amber-300">El camino del aprendiz</h1>
          <p className="text-xs text-slate-400 mt-1">Ingresa el código de tu familia para entrar</p>
        </div>
        <label className="text-xs font-bold text-slate-300">Código familiar</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
          placeholder="INGRESA CÓDIGO"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="mt-1 w-full px-3 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-black tracking-widest text-center text-lg uppercase focus:outline-none focus:border-amber-500"
          autoFocus
        />
        <p className="text-[11px] text-slate-500 mt-2 text-center">Ingresa el código familiar proporcionado por el administrador.</p>
        {error && <div className="mt-3 bg-red-950/50 border border-red-600 text-red-200 text-xs rounded-xl p-2.5 text-center">{error}</div>}
        <button
          onClick={handleEnter}
          disabled={loading}
          className="mt-4 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-black text-sm shadow cursor-pointer"
        >
          {loading ? 'Verificando...' : 'Entrar →'}
        </button>
        {!isSupabaseConfigured() && <p className="text-[11px] text-amber-400/80 mt-3 text-center">Modo offline: Supabase no configurado.</p>}
      </div>
    </div>
  );
}

export function FamilyBadge({ familyCode, onSwitch }: { familyCode: string; onSwitch: () => void }) {
  const isLeon = isLeonFamily(familyCode);
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className={`px-2 py-1 rounded-full border font-black tracking-widest ${isLeon ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-800 text-slate-200 border-slate-700'}`}>{familyCode}</span>
      <button onClick={onSwitch} className="px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 cursor-pointer">Cambiar</button>
    </div>
  );
}
