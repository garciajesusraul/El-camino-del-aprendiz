import React, { useState } from 'react';
import { AppState, MedalDefinition } from '../types';
import { MATERIAS, KINDER_MATERIA } from '../data/constants';
import { isMedalEarned } from '../services/storage';
import { Award, Sparkles, Lock, CheckCircle2, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';

interface MedalAlbumProps {
  state: AppState;
  editable?: boolean;
  onToggleEnabled?: (id: string) => void;
  onToggleActive?: (id: string, userId: string, active: boolean) => void;
  onCreate?: (def: MedalDefinition) => void;
  onUpdate?: (def: MedalDefinition) => void;
  onDelete?: (id: string) => void;
}

export const MedalAlbum: React.FC<MedalAlbumProps> = ({ state, editable, onToggleEnabled, onToggleActive, onCreate, onUpdate, onDelete }) => {
  const [filterMateria, setFilterMateria] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MedalDefinition | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('🏅');
  const [formMateria, setFormMateria] = useState<string>('general');

  const startCreate = () => {
    setEditing(null); setFormTitle(''); setFormDesc(''); setFormIcon('🏅'); setFormMateria('general'); setShowForm(true);
  };
  const startEdit = (m: MedalDefinition) => {
    setEditing(m); setFormTitle(m.title); setFormDesc(m.description); setFormIcon(m.icon); setFormMateria(m.materiaId || 'general'); setShowForm(true);
  };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    const def: MedalDefinition = {
      id: editing ? editing.id : `medal-custom-${Date.now()}`,
      title: formTitle.trim(),
      description: formDesc.trim(),
      icon: formIcon.trim() || '🏅',
      materiaId: formMateria === 'general' ? null : formMateria,
      criteriaType: editing ? editing.criteriaType : 'manual',
      criteriaParams: editing?.criteriaParams,
      enabled: editing ? editing.enabled : true,
    };
    if (editing && onUpdate) onUpdate(def); else if (!editing && onCreate) onCreate(def);
    setShowForm(false);
  };

  const grouped = (state.medalDefinitions || []).filter(m => filterMateria === 'all' ? true : (m.materiaId || 'general') === filterMateria);
  const materiasOpts = [{ id: 'general', name: 'General' }, ...MATERIAS.map(m => ({ id: m.id, name: m.shortName })), { id: KINDER_MATERIA.id, name: 'Kinder' }];

  return (
    <div className="space-y-3">
      {/* Filtro por materia - compacto */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Award className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-[11px] font-bold text-slate-400">Materia:</span>
        <button onClick={() => setFilterMateria('all')} className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${filterMateria==='all'?'bg-amber-500 text-slate-950':'bg-slate-800 text-slate-300 border border-slate-700'}`}>Todas</button>
        {materiasOpts.map(o => (
          <button key={o.id} onClick={() => setFilterMateria(o.id)} className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${filterMateria===o.id?'bg-amber-500 text-slate-950':'bg-slate-800 text-slate-300 border border-slate-700'}`}>{o.name}</button>
        ))}
        {editable && (
          <button onClick={startCreate} className="ml-auto px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0">
            <Plus className="w-3.5 h-3.5" /> Nueva medalla
          </button>
        )}
      </div>

      {showForm && editable && (
        <form onSubmit={handleSave} className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={formTitle} onChange={e=>setFormTitle(e.target.value)} placeholder="Título ej: Semana 1 a tiempo" className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold" required />
            <input value={formIcon} onChange={e=>setFormIcon(e.target.value)} placeholder="Icono 🏅" className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center" />
            <select value={formMateria} onChange={e=>setFormMateria(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white">
              {materiasOpts.map(o=> <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <input value={formDesc} onChange={e=>setFormDesc(e.target.value)} placeholder="Descripción" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={()=>setShowForm(false)} className="px-3 py-1 rounded-lg bg-slate-700 text-slate-300 text-xs">Cancelar</button>
            <button type="submit" className="px-4 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black">Guardar</button>
          </div>
        </form>
      )}

      {/* Grid compacto por materia */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {grouped.map(m => {
          const earned = isMedalEarned(state, m);
          const isEnabled = m.enabled;
          return (
            <div key={m.id} className={`relative p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 ${earned ? 'bg-amber-950/40 border-amber-500/50 shadow' : 'bg-slate-900 border-slate-800 opacity-70'} ${!isEnabled ? 'opacity-40 grayscale' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${earned ? 'bg-amber-500/20 border-amber-400 shadow-inner' : 'bg-slate-800 border-slate-700'}`}>{m.icon}</div>
              <p className="text-[11px] font-bold text-white leading-tight line-clamp-2">{m.title}</p>
              <p className="text-[9px] text-slate-400 line-clamp-2">{m.description}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${earned ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {earned ? <><CheckCircle2 className="w-3 h-3" /> Ganada</> : <><Lock className="w-3 h-3" /> Bloqueada</>}
              </span>
              {!isEnabled && <span className="text-[8px] text-rose-300 font-bold">Desactivada</span>}
              <span className="text-[8px] text-slate-500">{m.materiaId ? (MATERIAS.find(x=>x.id===m.materiaId)?.shortName || m.materiaId) : 'General'}</span>
              {editable && (
                <div className="flex items-center gap-1 mt-1 flex-wrap justify-center">
                  <button onClick={()=> onToggleEnabled && onToggleEnabled(m.id)} className={`p-1 rounded ${isEnabled ? 'bg-slate-700 text-amber-300' : 'bg-slate-800 text-slate-400'}`} title={isEnabled?'Desactivar':'Activar'}>{isEnabled?<Eye className="w-3 h-3"/>:<EyeOff className="w-3 h-3"/>}</button>
                  <button onClick={()=> {
                    const active = isMedalEarned(state, m);
                    if(onToggleActive) onToggleActive(m.id, state.activeUserId, !active);
                  }} className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold" title="Forzar activo/inactivo para el niño actual">{earned?'Quitar':'Dar'}</button>
                  <button onClick={()=> startEdit(m)} className="p-1 rounded bg-slate-700 text-slate-300"><Edit3 className="w-3 h-3"/></button>
                  <button onClick={()=> onDelete && onDelete(m.id)} className="p-1 rounded bg-rose-900/50 text-rose-300"><Trash2 className="w-3 h-3"/></button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {grouped.length===0 && <p className="text-xs text-slate-500 text-center py-4">No hay medallas para este filtro.</p>}
      <p className="text-[10px] text-slate-500 flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400"/> Las medallas se activan solas al lograr el hito; el padre puede crear, renombrar o forzar activar/desactivar.</p>
    </div>
  );
};