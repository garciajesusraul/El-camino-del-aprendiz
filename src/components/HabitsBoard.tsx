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
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-2 gap-2.5 flex-1 auto-rows-fr">
        {state.habitDefinitions.filter(h=>h.enabled).map(h=>{
          const logToday = state.habitLogs.find(l=> l.habitId===h.id && l.userId===state.activeUserId && l.date===today);
          const doneToday = !!logToday?.completed;
          const compliance = getHabitCompliance(state, h.id);
          const goalLabel = h.goalType==='daily' ? `Meta diaria: ${h.goalCount} vez/día` : h.goalType==='weekly' ? `Meta semanal: ${h.goalCount} veces/semana` : `Meta mensual: ${h.goalCount} veces/mes`;
          return (
            <div key={h.id} className={`p-3 rounded-xl border flex items-center justify-between ${doneToday ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-900 border-slate-700'}`}>
              <div className="flex items-center gap-2.5">
                <button onClick={()=>onToggleHabit(h.id)} className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 text-sm ${doneToday ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>{doneToday ? '✓' : ''}</button>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white flex items-center gap-1 truncate"><span className="text-base">{h.icon}</span><span className="truncate">{h.title}</span> <span className="text-xs text-amber-300 shrink-0">+{h.points} vida</span></div>
                  <div className="text-xs text-slate-300 truncate">{goalLabel} — {h.description}</div>
                  <div className="text-xs text-slate-400">Cumplimiento: <span className="font-bold text-emerald-400">{compliance}%</span></div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-xs text-slate-300 font-medium">{doneToday ? 'Hoy: hecho' : 'Hoy: pendiente'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};