import React from 'react';
import { AppState, Task } from '../types';
import { MATERIAS, KINDER_MATERIA } from '../data/constants';
import { PixelAvatar } from './PixelAvatar';
import {
  X,
  Sparkles,
  BookOpen,
  Heart,
  Coins,
  CheckCircle2,
  Calendar,
  Clock,
  Award,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface DailyPointsModalProps {
  state: AppState;
  onClose: () => void;
  onOpenNotebook?: () => void;
}

export const DailyPointsModal: React.FC<DailyPointsModalProps> = ({
  state,
  onClose,
  onOpenNotebook,
}) => {
  const profile = state.profile;
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Filter tasks completed/approved today for active child
  const completedTodayTasks = state.tasks.filter((t) => {
    const isUserTask = !t.userId || t.userId === state.activeUserId;
    if (!isUserTask) return false;
    if (t.status !== 'approved' && t.status !== 'submitted') return false;

    // Check date from submittedAt or approvedAt or createdAt
    const dateToCheck = t.approvedAt || t.submittedAt || t.createdAt;
    if (!dateToCheck) return false;
    return dateToCheck.startsWith(todayStr);
  });

  // Calculate today's breakdown
  const todayWisdom = completedTodayTasks
    .filter((t) => t.type === 'sabiduria')
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const todayLife = completedTodayTasks
    .filter((t) => t.type === 'vida')
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const todayTasksCount = completedTodayTasks.length;

  // Format nice spanish date
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const dateTitle = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  const getMateriaName = (materiaId: string) => {
    if (materiaId === 'general') return 'Hogar y Hábitos';
    if (materiaId === KINDER_MATERIA.id) return KINDER_MATERIA.name;
    const found = MATERIAS.find((m) => m.id === materiaId);
    return found ? found.name : materiaId;
  };

  const getMateriaColor = (materiaId: string) => {
    if (materiaId === 'general') return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40';
    if (materiaId === KINDER_MATERIA.id) return 'bg-amber-900/60 text-amber-300 border-amber-500/40';
    const found = MATERIAS.find((m) => m.id === materiaId);
    return found
      ? 'bg-cyan-900/60 text-cyan-300 border-cyan-500/40'
      : 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/90 rounded-3xl shadow-[0_16px_60px_rgba(0,0,0,0.85)] text-slate-100 flex flex-col max-h-[90vh] overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-4 sm:p-5 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-inner overflow-hidden">
              <PixelAvatar
                gender={profile.gender || 'boy'}
                hairColor={profile.avatar?.hairColor}
                size={38}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Mis Puntos del Día
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  {profile.name}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {dateTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Puntos Sabiduria */}
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-3 text-center shadow-inner flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-1">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-cyan-300">Sabiduría Hoy</span>
              <p className="text-xl sm:text-2xl font-black text-cyan-200 mt-0.5">
                +{todayWisdom}
              </p>
              <span className="text-[9px] text-slate-400">Escuela y Estudio</span>
            </div>

            {/* Puntos Vida */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-3 text-center shadow-inner flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-emerald-300">Vida Hoy</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-200 mt-0.5">
                +{todayLife}
              </p>
              <span className="text-[9px] text-slate-400">Hábitos del Hogar</span>
            </div>

            {/* Total Actividades */}
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-3 text-center shadow-inner flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-amber-300">Completadas</span>
              <p className="text-xl sm:text-2xl font-black text-amber-200 mt-0.5">
                {todayTasksCount}
              </p>
              <span className="text-[9px] text-slate-400">Misiones realizadas</span>
            </div>
          </div>

          {/* Progress / Motivation Banner */}
          <div className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shadow">
                <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-200">
                  {todayTasksCount > 0
                    ? '¡Excelente dedicación hoy! Seguí sumando para tus recompensas.'
                    : '¡Comenzá tus misiones de hoy para ganar puntos y avanzar tu viaje!'}
                </p>
                <p className="text-[10px] text-slate-400">
                  Racha actual: <strong className="text-amber-300">{profile.currentStreak || 1} días consecutivos</strong>
                </p>
              </div>
            </div>

            {onOpenNotebook && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNotebook();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <span>Ver Libreta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List of Tasks Done Today */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Detalle de Tareas Realizadas Hoy
            </h4>

            {completedTodayTasks.length === 0 ? (
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400">
                  <Clock className="w-6 h-6 text-amber-400/70" />
                </div>
                <p className="text-sm font-bold text-slate-300">
                  Aún no registraste tareas terminadas hoy
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Abrí tu libreta de misiones para marcar tus actividades escolares o tus hábitos del hogar y ver tus puntos aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {completedTodayTasks.map((task) => {
                  const isWisdom = task.type === 'sabiduria';
                  return (
                    <div
                      key={task.id}
                      className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isWisdom
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isWisdom ? <BookOpen className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-100 truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span
                              className={`px-1.5 py-0.2 rounded border font-semibold ${getMateriaColor(
                                task.materiaId
                              )}`}
                            >
                              {getMateriaName(task.materiaId)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {formatTime(task.approvedAt || task.submittedAt || task.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`px-2 py-1 rounded-xl text-xs font-black border ${
                            isWisdom
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          +{task.points} {isWisdom ? 'Sabiduría' : 'Vida'}
                        </span>
                        {task.status === 'submitted' && (
                          <p className="text-[9px] text-amber-400 mt-0.5 font-semibold">
                            Esperando visto bueno
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3.5 px-5 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px]">
            Tus puntos se acumulan para desbloquear ciudades y canjear en la tienda.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
