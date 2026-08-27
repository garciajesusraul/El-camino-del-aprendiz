import React, { useState } from 'react';
import { AppState, Task } from '../types';
import { MATERIAS, BIMESTRES_INFO, KINDER_MATERIA } from '../data/constants';
import { sound } from '../services/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Heart,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  RotateCcw,
  BookOpen,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface MissionNotebookModalProps {
  state: AppState;
  onClose: () => void;
  onCompleteTask: (taskId: string) => void;
  onAddTask: (newTask: Partial<Task>) => void;
  onRescueTask: (taskId: string) => void;
}

export const MissionNotebookModal: React.FC<MissionNotebookModalProps> = ({
  state,
  onClose,
  onCompleteTask,
  onAddTask,
  onRescueTask,
}) => {
  const [activeTab, setActiveTab] = useState<'escuela' | 'habitos' | 'vencidas'>('escuela');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPoints, setNewPoints] = useState(10);
  const [newType, setNewType] = useState<'sabiduria' | 'vida'>('sabiduria');

  const isKinder = state.profile?.gradeLevel === 'kinder';
  const currentMateria = isKinder
    ? KINDER_MATERIA
    : MATERIAS.find((m) => m.id === state.currentMateria) || MATERIAS[0];
  const currentBimestre = BIMESTRES_INFO[state.currentCity - 1] || BIMESTRES_INFO[0];
  const currentHouse = state.currentHouse || 1;

  // Filter tasks for current user, subject, bimester, and week
  const isUserTask = (t: Task) => !t.userId || t.userId === state.activeUserId;

  const weekSchoolTasks = state.tasks.filter(
    (t) =>
      isUserTask(t) &&
      t.materiaId === currentMateria.id &&
      t.bimestre === state.currentCity &&
      t.semana === currentHouse &&
      t.type === 'sabiduria' &&
      t.status !== 'expired'
  );

  const weekHabitTasks = state.tasks.filter(
    (t) =>
      isUserTask(t) &&
      t.bimestre === state.currentCity &&
      t.semana === currentHouse &&
      t.type === 'vida' &&
      t.status !== 'expired'
  );

  const overdueTasks = state.tasks.filter((t) => isUserTask(t) && t.status === 'expired');

  const handleTaskCheck = (task: Task) => {
    if (task.status === 'approved') return;
    sound.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#16a34a', '#eab308', '#f43f5e'],
      });
    } catch {}
    onCompleteTask(task.id);
  };

  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      userId: state.activeUserId,
      materiaId: currentMateria.id,
      bimestre: state.currentCity,
      semana: currentHouse,
      title: newTitle.trim(),
      points: Number(newPoints),
      type: newType,
      status: 'pending',
    });

    setNewTitle('');
    setIsAddingTask(false);
    sound.playSelect();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      {/* Notebook Binder Container */}
      <div className="relative w-full max-w-[680px] max-h-[90vh] flex flex-col bg-amber-50 rounded-3xl shadow-2xl border-4 border-amber-800 overflow-hidden text-slate-800 font-sans">
        {/* Notebook Top Leather Spine & Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-100 p-4 px-6 border-b-4 border-amber-950 flex items-center justify-between shadow">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md border border-white/20"
              style={{ backgroundColor: currentMateria.color }}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white">
                  Libreta de Misiones • Semana {currentHouse}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold">
                  {currentBimestre.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-400/40 font-bold">
                  {state.profile.name}
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium">
                {currentMateria.name} — {currentBimestre.name} ({currentBimestre.months})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-amber-950/60 hover:bg-rose-700 text-amber-200 hover:text-white flex items-center justify-center transition-colors border border-amber-700/50"
            title="Cerrar y Volver al Mapa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notebook Paper Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4 border-b-2 border-amber-200 pb-2">
            <button
              onClick={() => {
                setActiveTab('escuela');
                sound.playSelect();
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === 'escuela'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-amber-100/80 hover:bg-amber-200/60 text-slate-700 border border-amber-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Escuela (Sabiduría)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {weekSchoolTasks.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('habitos');
                sound.playSelect();
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === 'habitos'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-amber-100/80 hover:bg-amber-200/60 text-slate-700 border border-amber-300'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Hábitos (Vida)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {weekHabitTasks.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('vencidas');
                sound.playSelect();
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === 'vencidas'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-amber-100/80 hover:bg-amber-200/60 text-slate-700 border border-amber-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Vencidas / Rescatar</span>
              {overdueTasks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                  {overdueTasks.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: ESCUELA (SABIDURÍA) */}
          {activeTab === 'escuela' && (
            <div className="space-y-3">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-sky-800 font-bold">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Completar estas tareas suma Puntos de Sabiduría (+KM de avance)</span>
                </div>
                <button
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Tarea</span>
                </button>
              </div>

              {/* Form to add custom task */}
              {isAddingTask && (
                <form
                  onSubmit={handleCreateNewTask}
                  className="bg-white border-2 border-sky-300 rounded-2xl p-3 shadow-md space-y-2 animate-fade-in"
                >
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Nueva Tarea Escolar</h4>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Resolver guía de ejercicios de fracciones..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-600">Puntos:</label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={newPoints}
                        onChange={(e) => setNewPoints(parseInt(e.target.value) || 10)}
                        className="w-16 text-xs p-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingTask(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow"
                      >
                        Guardar Tarea
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Task Items List */}
              <div className="space-y-2">
                {weekSchoolTasks.length === 0 ? (
                  <div className="text-center py-8 bg-white/70 rounded-2xl border border-amber-200">
                    <p className="text-sm font-bold text-slate-600">¡No hay tareas escolares cargadas para esta semana!</p>
                    <p className="text-xs text-slate-400 mt-1">Podés agregar una con el botón de arriba o desde el Modo Padre.</p>
                  </div>
                ) : (
                  weekSchoolTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskCheck(task)}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        task.status === 'approved'
                          ? 'bg-emerald-50 border-emerald-300 opacity-90'
                          : task.status === 'submitted'
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-white hover:bg-sky-50/60 border-slate-200 hover:border-sky-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            task.status === 'approved'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : task.status === 'submitted'
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {task.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                          {task.status === 'submitted' && <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              task.status === 'approved' ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-slate-500 font-medium">{task.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.status === 'submitted' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Pendiente Papá</span>
                          </span>
                        )}
                        {task.status === 'approved' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ¡Aprobada!
                          </span>
                        )}
                        <span className="text-xs font-black text-sky-600 bg-sky-100 px-2.5 py-1 rounded-xl border border-sky-200">
                          +{task.points} Pts
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HÁBITOS (VIDA) */}
          {activeTab === 'habitos' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span>Los hábitos diarios fortalecen los Puntos de Vida y la responsabilidad</span>
                </div>
              </div>

              <div className="space-y-2">
                {weekHabitTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskCheck(task)}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      task.status === 'approved'
                        ? 'bg-emerald-50 border-emerald-300 opacity-90'
                        : task.status === 'submitted'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-white hover:bg-emerald-50/60 border-slate-200 hover:border-emerald-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          task.status === 'approved'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : task.status === 'submitted'
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {task.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                        {task.status === 'submitted' && <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            task.status === 'approved' ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-slate-500 font-medium">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200">
                        +{task.points} Pts Vida
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TAREAS VENCIDAS & RESCATE */}
          {activeTab === 'vencidas' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3">
                <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Panel de Tareas con Degradación Temporal</span>
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Las tareas atrasadas van perdiendo puntos diariamente. Podés completarlas con puntaje reducido,
                  o un padre puede rescatarlas para restaurar su valor completo.
                </p>
              </div>

              {overdueTasks.length === 0 ? (
                <div className="text-center py-8 bg-white/70 rounded-2xl border border-amber-200">
                  <p className="text-sm font-bold text-emerald-700">¡Excelente! No tenés ninguna tarea atrasada.</p>
                  <p className="text-xs text-slate-400 mt-1">¡Seguí con este gran ritmo de estudio y hábitos!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl border-2 border-rose-200 bg-rose-50/60 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                          {task.daysOverdue || 7} días de retraso
                        </span>
                        <p className="text-sm font-bold text-slate-900 mt-1">{task.title}</p>
                        <p className="text-xs text-slate-500">
                          Puntaje original: <span className="line-through">{task.originalPoints || task.points} Pts</span>{' '}
                          ➔ Ahora: <span className="font-bold text-amber-700">{task.points} Pts</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRescueTask(task.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow"
                          title="Restaurar puntos completos (Modo Papá/Rescate)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Rescatar</span>
                        </button>
                        <button
                          onClick={() => handleTaskCheck(task)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                        >
                          Completar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-amber-100/90 border-t border-amber-200 p-3 px-6 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900">
            Consejo: Mantené tus tareas al día para evitar la pérdida de puntos.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-100 font-black text-xs shadow transition-transform active:scale-95"
          >
            Volver al Mapa
          </button>
        </div>
      </div>
    </div>
  );
};
