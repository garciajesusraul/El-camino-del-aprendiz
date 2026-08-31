import React from 'react';
import { AppState } from '../types';
import { getHabitCompliance } from '../services/storage';

interface HabitsBoardProps {
  state: AppState;
  onToggleHabit: (habitId: string) => void;
  onClose?: () => void;
}

export const HabitsBoard: React.FC<HabitsBoardProps> = ({ state, onToggleHabit }) => {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-3">
      <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
        <h4 className="text-sm font-black text-amber-300">HÁBITOS</h4>
        <p className="text-xs text-slate-400">Tocá para marcar hoy. Cada hábito tiene meta diaria/semanal/mensual y % de cumplimiento promedio.</p>
      </div>
      <div className="grid gap-2">
        {state.habitDefinitions.filter(h=>h.enabled).map(h=>{
          const logToday = state.habitLogs.find(l=> l.habitId===h.id && l.userId===state.activeUserId && l.date===today);
          const doneToday = !!logToday?.completed;
          const compliance = getHabitCompliance(state, h.id);
          const goalLabel = h.goalType==='daily' ? `Meta diaria: ${h.goalCount} vez/día` : h.goalType==='weekly' ? `Meta semanal: ${h.goalCount} veces/semana` : `Meta mensual: ${h.goalCount} veces/mes`;
          return (
            <div key={h.id} className={`p-2.5 rounded-xl border flex items-center justify-between ${doneToday ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-900 border-slate-700'}`}>
              <div className="flex items-center gap-2">
                <button onClick={()=>onToggleHabit(h.id)} className={`w-7 h-7 rounded-lg border flex items-center justify-center ${doneToday ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>{doneToday ? '✓' : ''}</button>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1"><span>{h.icon}</span>{h.title} <span className="text-[10px] text-amber-300">+{h.points} vida</span></div>
                  <div className="text-[10px] text-slate-400">{goalLabel} — {h.description}</div>
                  <div className="text-[10px] text-slate-500">Cumplimiento: <span className="font-bold text-emerald-400">{compliance}%</span></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">{doneToday ? 'Hoy: hecho' : 'Hoy: pendiente'}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
        <h5 className="text-xs font-black text-slate-200">Premios por Hábitos (vida)</h5>
        <p className="text-[11px] text-slate-400">Se canjean con puntos de vida. Configurá días obligatorios en cada premio (0 = sin límite). Ej: Lavarse los dientes 7 días seguidos.</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {state.storeItems.filter(s=> s.type==='real_life' && s.costType==='vida').slice(0,4).map(it=> (
            <div key={it.id} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
              <div className="text-lg">{it.icon}</div>
              <div className="text-xs font-bold text-white">{it.title}</div>
              <div className="text-[10px] text-amber-300">{it.cost} vida {it.requiredDays ? `· ${it.requiredDays} días seguidos` : ''}</div>
            </div>
          ))}
        </div>
        <h5 className="text-xs font-black text-slate-200 mt-3">Premios especiales (monedas de oro)</h5>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {state.storeItems.filter(s=> s.costType==='coins').slice(0,4).map(it=> (
            <div key={it.id} className="bg-slate-900 border border-amber-500/30 rounded-lg p-2 text-center">
              <div className="text-lg">{it.icon}</div>
              <div className="text-xs font-bold text-white">{it.title}</div>
              <div className="text-[10px] text-amber-300">{it.cost} oro</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};