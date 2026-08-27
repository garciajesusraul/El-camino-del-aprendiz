import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ChildProfile, GenderType, GradeLevelType, ScoringConfig, StoreItem, Task } from '../types';
import { MATERIAS, BIMESTRES_INFO, KINDER_MATERIA, DEFAULT_SCORING_CONFIG } from '../data/constants';
import { PixelAvatar } from './PixelAvatar';
import { RewardEditorModal } from './RewardEditorModal';
import {
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  Heart,
  RotateCcw,
  UploadCloud,
  CheckSquare,
  Square,
  Settings,
  Unlock,
  Coins,
  Compass,
  User,
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Check,
  KeyRound,
  Award,
  BookOpen,
  ShoppingBag,
  Plus,
  Gift,
  Eye,
  ExternalLink,
} from 'lucide-react';

interface ParentAdminDashboardProps {
  state: AppState;
  onClose: () => void;
  onApproveTasks: (taskIds: string[]) => void;
  onRejectTask: (taskId: string) => void;
  onExecuteWeekPass: () => void;
  onUnlockAllCities: () => void;
  onToggleCity: (materiaId: string, cityNum: number) => void;
  onImportText: (text: string) => void;
  onImportStructured?: (options: {
    materiaId: string;
    bimestre: number;
    semana: number;
    mode: 'general' | 'guide';
    text: string;
  }) => void;
  onUpdateKmSettings: (startKm: number, kmGanados: number) => void;
  onToggleAutoApprove: (val: boolean) => void;
  onRescueTask: (taskId: string) => void;
  onSwitchUser?: (userId: string) => void;
  onCreateUser?: (name: string, age?: number, gender?: GenderType, gradeLevel?: GradeLevelType) => void;
  onUpdateUserProfile?: (
    userId: string,
    updates: {
      name?: string;
      age?: number;
      gender?: GenderType;
      gradeLevel?: GradeLevelType;
    }
  ) => void;
  onUpdateCharacterName?: (newName: string, userId?: string) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateScoringConfig?: (scoring: Partial<ScoringConfig>) => void;
  onUpdateParentPin?: (newPin: string) => void;
  onUpdateVolume?: (volume: number) => void;
  onOpenNotebook?: (materiaId?: string, cityNum?: number, houseNum?: number) => void;
  onOpenStore?: () => void;
  onAddTask?: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  onCompleteTask?: (taskId: string) => void;
  onPurchaseItem?: (item: StoreItem) => void;
  onEquipAccessory?: (accessoryKey: 'none' | 'backpack' | 'glasses' | 'medal' | 'cape') => void;
  onUpdateStoreItems?: (items: StoreItem[]) => void;
  onUpdateUserPoints?: (
    userId: string,
    updates: {
      kmGanados?: number;
      wisdomPoints?: number;
      lifePoints?: number;
      coins?: number;
    }
  ) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const ParentAdminDashboard: React.FC<ParentAdminDashboardProps> = ({
  state,
  onClose,
  onApproveTasks,
  onRejectTask,
  onExecuteWeekPass,
  onUnlockAllCities,
  onToggleCity,
  onImportText,
  onImportStructured,
  onUpdateKmSettings,
  onToggleAutoApprove,
  onRescueTask,
  onSwitchUser,
  onCreateUser,
  onUpdateUserProfile,
  onUpdateCharacterName,
  onDeleteUser,
  onUpdateScoringConfig,
  onUpdateParentPin,
  onOpenNotebook,
  onOpenStore,
  onAddTask,
  onCompleteTask,
  onPurchaseItem,
  onEquipAccessory,
  onUpdateStoreItems,
  onUpdateUserPoints,
  onDeleteTask,
}) => {
  // PIN Gate State
  const expectedPin = state.settings?.parentPin || '2026';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'users' | 'notebook' | 'store' | 'approvals' | 'scoring' | 'import' | 'cities' | 'config' | 'history'
  >('users');

  // Reward editor state
  const [editingReward, setEditingReward] = useState<StoreItem | null | undefined>(undefined); // undefined = closed, null = new

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [customStartKm, setCustomStartKm] = useState(state.profile.startKm || 0);
  const [customKmGanados, setCustomKmGanados] = useState(state.profile.kmGanados);

  const currentScoring = state.settings?.scoring || DEFAULT_SCORING_CONFIG;
  const [scoringInput, setScoringInput] = useState<ScoringConfig>({ ...currentScoring });
  const [scoringSaved, setScoringSaved] = useState(false);

  // Mass Structured Import state
  const isKinder = state.profile?.gradeLevel === 'kinder';
  const [importMateria, setImportMateria] = useState(isKinder ? KINDER_MATERIA.id : 'ciencias');
  const [importBimestre, setImportBimestre] = useState(1);
  const [importSemana, setImportSemana] = useState(1);
  const [importMode, setImportMode] = useState<'general' | 'guide'>('general');
  const [rawText, setRawText] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Parent PIN update state
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // New user modal/form state
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserAge, setNewUserAge] = useState(8);
  const [newUserGender, setNewUserGender] = useState<GenderType>('boy');
  const [newUserGrade, setNewUserGrade] = useState<GradeLevelType>('primer_grado');

  // User Profile Editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState(8);
  const [editGender, setEditGender] = useState<GenderType>('boy');
  const [editGrade, setEditGrade] = useState<GradeLevelType>('primer_grado');
  const [editKmGanados, setEditKmGanados] = useState(0);
  const [editWisdomPoints, setEditWisdomPoints] = useState(0);
  const [editLifePoints, setEditLifePoints] = useState(0);
  const [editCoins, setEditCoins] = useState(0);

  // Mission Notebook Tab state
  const [nbMateria, setNbMateria] = useState<string>(isKinder ? KINDER_MATERIA.id : 'matematicas');
  const [nbBimestre, setNbBimestre] = useState<number>(1);
  const [nbSemana, setNbSemana] = useState<number>(1);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState<number>(10);
  const [newTaskType, setNewTaskType] = useState<'sabiduria' | 'vida'>('sabiduria');

  // Submitted tasks waiting for parent approval
  const submittedTasks = state.tasks.filter(
    (t) => t.status === 'submitted' && (!t.userId || t.userId === state.activeUserId)
  );
  const overdueTasks = state.tasks.filter(
    (t) => t.status === 'expired' && (!t.userId || t.userId === state.activeUserId)
  );

  // PIN Gate keypad handlers (SILENT - NO AUDIO)
  const handlePinDigit = useCallback((digit: string) => {
    setPinInput((prev) => {
      if (prev.length >= 4) return prev;
      const nextPin = prev + digit;
      setPinError(false);

      if (nextPin.length === 4) {
        if (nextPin === expectedPin) {
          setIsAuthenticated(true);
        } else {
          setPinError(true);
        }
      }
      return nextPin;
    });
  }, [expectedPin]);

  const handlePinBackspace = useCallback(() => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(false);
  }, []);

  const handlePinClear = useCallback(() => {
    setPinInput('');
    setPinError(false);
  }, []);

  const handlePinSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === expectedPin) {
      setIsAuthenticated(true);
    } else {
      setPinError(true);
    }
  }, [pinInput, expectedPin]);

  // Physical keyboard listener for PIN gate
  useEffect(() => {
    if (isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow number keys 0-9 (standard numbers or numpad)
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        handlePinBackspace();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        handlePinClear();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handlePinSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isAuthenticated, handlePinDigit, handlePinBackspace, handlePinClear, handlePinSubmit, onClose]);

  // Approvals handlers
  const handleToggleSelectTask = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((tId) => tId !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === submittedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(submittedTasks.map((t) => t.id));
    }
  };

  const handleApproveSelected = () => {
    if (selectedTaskIds.length === 0) return;
    onApproveTasks(selectedTaskIds);
    setSelectedTaskIds([]);
  };

  // User Profile Creation / Editing Handlers
  const handleStartCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newUserName.trim();
    if (!clean) return;
    if (onCreateUser) {
      onCreateUser(clean, newUserAge, newUserGender, newUserGrade);
    }
    setNewUserName('');
    setShowCreateUserForm(false);
  };

  const handleOpenEditUser = (user: ChildProfile) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditAge(user.age || 8);
    setEditGender(user.gender || 'boy');
    setEditGrade(user.gradeLevel || 'primer_grado');
    setEditKmGanados(user.kmGanados || 0);
    setEditWisdomPoints(user.wisdomPoints || 0);
    setEditLifePoints(user.lifePoints || 0);
    setEditCoins(user.coins || 0);
  };

  const handleSaveEditUser = (userId: string) => {
    const clean = editName.trim();
    if (!clean) return;
    if (onUpdateUserProfile) {
      onUpdateUserProfile(userId, {
        name: clean,
        age: editAge,
        gender: editGender,
        gradeLevel: editGrade,
      });
    } else if (onUpdateCharacterName) {
      onUpdateCharacterName(clean, userId);
    }
    if (onUpdateUserPoints) {
      onUpdateUserPoints(userId, {
        kmGanados: editKmGanados,
        wisdomPoints: editWisdomPoints,
        lifePoints: editLifePoints,
        coins: editCoins,
      });
    }
    setEditingUserId(null);
  };

  const handleDeleteUserClick = (user: ChildProfile, index: number) => {
    if (state.profiles.length <= 1) {
      alert('Debe existir al menos un usuario en el juego.');
      return;
    }
    if (
      confirm(
        `¿Estás seguro de eliminar el perfil "${user.name}" (Usuario ${index + 1})? Esta acción no se puede deshacer.`
      )
    ) {
      if (onDeleteUser) {
        onDeleteUser(user.id);
      }
    }
  };

  // Scoring Save Handler
  const handleSaveScoring = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateScoringConfig) {
      onUpdateScoringConfig(scoringInput);
      setScoringSaved(true);
      setTimeout(() => setScoringSaved(false), 2500);
    }
  };

  // Structured Import Handler
  const handleExecuteImport = () => {
    if (!rawText.trim()) return;
    if (onImportStructured) {
      onImportStructured({
        materiaId: importMateria,
        bimestre: importBimestre,
        semana: importSemana,
        mode: importMode,
        text: rawText,
      });
    } else {
      onImportText(rawText);
    }
    setImportSuccessMsg('¡Tareas importadas exitosamente a la libreta!');
    setRawText('');
    setTimeout(() => setImportSuccessMsg(''), 3000);
  };

  // PIN update handler
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length === 4 && onUpdateParentPin) {
      onUpdateParentPin(newPinInput);
      setPinChangeMsg('¡Contraseña parental actualizada!');
      setNewPinInput('');
      setTimeout(() => setPinChangeMsg(''), 3000);
    }
  };

  // Manual task addition from parent notebook tab
  const handleCreateTaskFromNotebookTab = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTaskTitle.trim();
    if (!clean) return;
    if (onAddTask) {
      onAddTask({
        title: clean,
        materiaId: nbMateria,
        bimestre: nbBimestre,
        semana: nbSemana,
        points: newTaskPoints,
        type: newTaskType,
        userId: state.activeUserId,
      });
    }
    setNewTaskTitle('');
    setShowAddTaskForm(false);
  };

  // Grade level labels
  const gradeLabels: { [k in GradeLevelType]: string } = {
    kinder: 'Kinder / Preescolar',
    primer_grado: '1° Primer Grado',
    segundo_grado: '2° Segundo Grado',
    tercer_grado: '3° Tercer Grado',
    cuarto_grado: '4° Cuarto Grado',
    quinto_grado: '5° Quinto Grado',
    sexto_grado: '6° Sexto Grado',
  };

  // Filter tasks for the notebook management tab
  const isUserTask = (t: Task) => !t.userId || t.userId === state.activeUserId;
  const filteredNotebookTasks = state.tasks.filter(
    (t) =>
      isUserTask(t) &&
      t.materiaId === nbMateria &&
      t.bimestre === nbBimestre &&
      t.semana === nbSemana
  );

  // --- 1. PIN GATE SECURITY SCREEN (PASSWORD "2026") ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
        <div className="relative w-full max-w-sm bg-slate-900 border-3 border-amber-500/80 rounded-3xl p-6 shadow-[0_12px_50px_rgba(0,0,0,0.9)] text-white text-center flex flex-col items-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <KeyRound className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-black text-amber-300">Modo Padre / Opciones</h3>
          <p className="text-xs text-slate-300 mt-1 mb-4">
            Ingresá la contraseña parental de 4 dígitos para acceder a la gestión de tareas, premios y perfiles.
          </p>

          {/* PIN display boxes */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {[0, 1, 2, 3].map((idx) => {
              const hasDigit = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-mono font-bold transition-all ${
                    pinError
                      ? 'border-rose-500 bg-rose-950/40 text-rose-300 animate-shake'
                      : hasDigit
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300 scale-105'
                      : 'border-slate-700 bg-slate-950 text-slate-500'
                  }`}
                >
                  {hasDigit ? '●' : ''}
                </div>
              );
            })}
          </div>

          {pinError && (
            <p className="text-xs font-bold text-rose-400 mb-3 animate-fade-in">
              Contraseña incorrecta. Por favor, intentá nuevamente.
            </p>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mb-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePinDigit(digit)}
                className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-600 border border-slate-700 text-lg font-bold font-mono transition-colors cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={handlePinClear}
              className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-bold text-slate-400 transition-colors cursor-pointer"
            >
              Borrar
            </button>
            <button
              onClick={() => handlePinDigit('0')}
              className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-600 border border-slate-700 text-lg font-bold font-mono transition-colors cursor-pointer"
            >
              0
            </button>
            <button
              onClick={handlePinBackspace}
              className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-sm font-bold text-slate-300 transition-colors cursor-pointer"
            >
              ⌫
            </button>
          </div>

          <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-500">Podés usar el teclado físico o los botones</span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. AUTHENTICATED PARENT DASHBOARD ---
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in select-none">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-500/80 rounded-3xl shadow-[0_12px_50px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden font-sans">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 px-6 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-inner">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Panel de Opciones y Modo Padre
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                  Acceso Parental Verificado ✓
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestión exclusiva de libreta de tareas, tienda de premios, perfiles y configuración pedagógica.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios & Perfiles ({state.profiles?.length || 1})</span>
          </button>

          <button
            onClick={() => setActiveTab('notebook')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notebook'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Libreta de Misiones & Tareas</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'store'
                ? 'bg-amber-600 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Tienda de Premios & Avatar</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'approvals'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aprobaciones ({submittedTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scoring')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scoring'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Puntos & Baremos</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'import'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Carga Masiva (.TXT)</span>
          </button>

          <button
            onClick={() => setActiveTab('cities')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cities'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>Desbloquear Ciudades</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'config'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Ajustes & PIN</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-900/60 space-y-4">
          {/* ========================================================================= */}
          {/* TAB 1: GESTIÓN MULTI-USUARIO Y PERSONALIZACIÓN DE AVATAR */}
          {/* ========================================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-purple-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Perfiles de Estudiantes & Avatares</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Creá, editá edad, sexo (varón/niña) y nivel escolar (Kinder o Primaria).
                  </p>
                </div>

                {!showCreateUserForm && (
                  <button
                    onClick={() => setShowCreateUserForm(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Crear Nuevo Usuario</span>
                  </button>
                )}
              </div>

              {/* Form to create a new user */}
              {showCreateUserForm && (
                <form
                  onSubmit={handleStartCreateUser}
                  className="bg-slate-800/95 border-2 border-purple-500/80 rounded-2xl p-4 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" /> Nuevo Perfil de Niño / Niña
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCreateUserForm(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Nombre del Estudiante:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Sofía o Mateo"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Edad (3 a 18 años):
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="18"
                        value={newUserAge}
                        onChange={(e) => setNewUserAge(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Sexo / Avatar:
                      </label>
                      <select
                        value={newUserGender}
                        onChange={(e) => setNewUserGender(e.target.value as GenderType)}
                        className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                      >
                        <option value="boy">🧒 Varón (Sprite Prota / Cabello Negro / Celeste)</option>
                        <option value="girl">👧 Niña (Cabello largo con lazo / Rosa)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Nivel Escolar:
                      </label>
                      <select
                        value={newUserGrade}
                        onChange={(e) => setNewUserGrade(e.target.value as GradeLevelType)}
                        className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                      >
                        <option value="kinder">🎈 Kinder / Preescolar</option>
                        <option value="primer_grado">1° Primer Grado</option>
                        <option value="segundo_grado">2° Segundo Grado</option>
                        <option value="tercer_grado">3° Tercer Grado</option>
                        <option value="cuarto_grado">4° Cuarto Grado</option>
                        <option value="quinto_grado">5° Quinto Grado</option>
                        <option value="sexto_grado">6° Sexto Grado</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!newUserName.trim()}
                      className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                    >
                      Guardar y Crear Usuario
                    </button>
                  </div>
                </form>
              )}

              {/* Profiles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(state.profiles || [state.profile]).map((prof, idx) => {
                  const isActive = prof.id === state.activeUserId;
                  const isEditing = editingUserId === prof.id;

                  return (
                    <div
                      key={prof.id}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isActive
                          ? 'bg-purple-950/40 border-purple-500/90 shadow-[0_4px_20px_rgba(168,85,247,0.2)] ring-1 ring-purple-400/40'
                          : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                            <span className="text-xs font-bold text-amber-300">
                              Editando Usuario {idx + 1}
                            </span>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              Cancelar
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                Nombre:
                              </label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full text-xs p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                Edad:
                              </label>
                              <input
                                type="number"
                                min="3"
                                max="18"
                                value={editAge}
                                onChange={(e) => setEditAge(Number(e.target.value))}
                                className="w-full text-xs p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                Sexo / Avatar:
                              </label>
                              <select
                                value={editGender}
                                onChange={(e) => setEditGender(e.target.value as GenderType)}
                                className="w-full text-xs p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                              >
                                <option value="boy">👦 Varón</option>
                                <option value="girl">👧 Niña</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                                Nivel:
                              </label>
                              <select
                                value={editGrade}
                                onChange={(e) => setEditGrade(e.target.value as GradeLevelType)}
                                className="w-full text-xs p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                              >
                                <option value="kinder">🎈 Kinder</option>
                                <option value="primer_grado">1° Grado</option>
                                <option value="segundo_grado">2° Grado</option>
                                <option value="tercer_grado">3° Grado</option>
                                <option value="cuarto_grado">4° Grado</option>
                                <option value="quinto_grado">5° Grado</option>
                                <option value="sexto_grado">6° Grado</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
                            <div>
                              <label className="text-[10px] font-bold text-sky-400 block mb-1">
                                KM Ganados (0-365):
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="365"
                                value={editKmGanados}
                                onChange={(e) => setEditKmGanados(parseInt(e.target.value) || 0)}
                                className="w-full text-xs p-1.5 rounded-lg bg-slate-950 border border-sky-700 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-cyan-400 block mb-1">
                                Sabiduría (pts):
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={editWisdomPoints}
                                onChange={(e) => setEditWisdomPoints(parseInt(e.target.value) || 0)}
                                className="w-full text-xs p-1.5 rounded-lg bg-slate-950 border border-cyan-700 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-emerald-400 block mb-1">
                                Vida (pts):
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={editLifePoints}
                                onChange={(e) => setEditLifePoints(parseInt(e.target.value) || 0)}
                                className="w-full text-xs p-1.5 rounded-lg bg-slate-950 border border-emerald-700 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-amber-400 block mb-1">
                                Monedas 🪙:
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={editCoins}
                                onChange={(e) => setEditCoins(parseInt(e.target.value) || 0)}
                                className="w-full text-xs p-1.5 rounded-lg bg-slate-950 border border-amber-700 text-white"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => handleSaveEditUser(prof.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow cursor-pointer"
                            >
                              Guardar Cambios
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-purple-900/90 border border-purple-400/50 flex items-center justify-center overflow-hidden shadow p-1">
                                <PixelAvatar gender={prof.gender || 'boy'} hairColor={prof.avatar?.hairColor} size={36} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                    Usuario {idx + 1}
                                  </span>
                                  {isActive && (
                                    <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black">
                                      ACTIVO
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-base font-black text-white">{prof.name}</h4>
                                <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
                                  <span>{prof.age ? `${prof.age} años` : '8 años'}</span>
                                  <span>•</span>
                                  <span className="text-purple-300 font-bold">
                                    {gradeLabels[prof.gradeLevel || 'primer_grado']}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditUser(prof)}
                                className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                                title="Editar nombre, edad, sexo o nivel"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteUserClick(prof, idx)}
                                disabled={state.profiles.length <= 1}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  state.profiles.length <= 1
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-rose-400 hover:bg-slate-700 cursor-pointer'
                                }`}
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Stats mini bar */}
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-700/60 text-center text-xs">
                            <div className="bg-slate-900/80 rounded-xl p-1.5">
                              <span className="text-[9px] text-orange-400 block font-bold">KM Ganados</span>
                              <span className="font-black text-white">{prof.kmGanados} km</span>
                            </div>
                            <div className="bg-slate-900/80 rounded-xl p-1.5">
                              <span className="text-[9px] text-cyan-400 block font-bold">Sabiduría</span>
                              <span className="font-black text-white">{prof.wisdomPoints} pts</span>
                            </div>
                            <div className="bg-slate-900/80 rounded-xl p-1.5">
                              <span className="text-[9px] text-amber-400 block font-bold">Monedas</span>
                              <span className="font-black text-white">{prof.coins} 🪙</span>
                            </div>
                          </div>

                          {!isActive && (
                            <button
                              onClick={() => {
                                if (onSwitchUser) {
                                  onSwitchUser(prof.id);
                                }
                              }}
                              className="w-full mt-3 py-1.5 bg-slate-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              Seleccionar y Jugar con {prof.name}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: LIBRETA DE MISIONES & TAREAS (GESTIÓN EXCLUSIVA DEL ADULTO) */}
          {/* ========================================================================= */}
          {activeTab === 'notebook' && (
            <div className="space-y-4">
              <div className="bg-blue-950/40 border border-blue-500/40 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <h4 className="text-sm font-black text-blue-200">
                      Libreta Pedagógica de {state.profile.name}
                    </h4>
                  </div>
                  <p className="text-xs text-blue-300/80 mt-0.5">
                    Gestioná, creá, aprobá o eliminá tareas de todas las materias, bimestres y semanas.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenNotebook && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenNotebook(nbMateria, nbBimestre, nbSemana);
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir Libreta Visual Completa</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Nueva Tarea</span>
                  </button>
                </div>
              </div>

              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Materia:</label>
                  <select
                    value={nbMateria}
                    onChange={(e) => setNbMateria(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    {isKinder ? (
                      <option value={KINDER_MATERIA.id}>🎈 {KINDER_MATERIA.name}</option>
                    ) : (
                      MATERIAS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Bimestre / Ciudad:</label>
                  <select
                    value={nbBimestre}
                    onChange={(e) => setNbBimestre(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value={1}>Bimestre 1 (Ciudad 1)</option>
                    <option value={2}>Bimestre 2 (Ciudad 2)</option>
                    <option value={3}>Bimestre 3 (Ciudad 3)</option>
                    <option value={4}>Bimestre 4 (Ciudad 4)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Semana:</label>
                  <select
                    value={nbSemana}
                    onChange={(e) => setNbSemana(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>
                        Semana {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add task quick form */}
              {showAddTaskForm && (
                <form
                  onSubmit={handleCreateTaskFromNotebookTab}
                  className="bg-slate-800 border-2 border-emerald-500/80 rounded-2xl p-4 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="text-xs font-black text-emerald-300 uppercase">
                      + Asignar Tarea para Semana {nbSemana} de {nbMateria}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddTaskForm(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Título o Descripción de la Tarea:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Guía de lectura pág 14 o Ejercicios de sumas"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Puntos Asignados:
                      </label>
                      <select
                        value={newTaskPoints}
                        onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                      >
                        <option value={10}>10 pts (Tarea simple)</option>
                        <option value={20}>20 pts (Tarea intermedia)</option>
                        <option value={30}>30 pts (Guía completa)</option>
                        <option value={50}>50 pts (Proyecto semanal)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!newTaskTitle.trim()}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                    >
                      Guardar y Asignar a {state.profile.name}
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                  <span>
                    Tareas encontradas: {filteredNotebookTasks.length} en Semana {nbSemana}
                  </span>
                </div>

                {filteredNotebookTasks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-300">
                      No hay tareas registradas para esta semana y materia.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Hacé click en "+ Nueva Tarea" o usá la pestaña "Carga Masiva (.TXT)" para importar actividades.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredNotebookTasks.map((t) => {
                      const isCompleted = t.status === 'completed' || t.status === 'approved';
                      const isSubmitted = t.status === 'submitted';

                      return (
                        <div
                          key={t.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                            isCompleted
                              ? 'bg-emerald-950/30 border-emerald-500/40'
                              : isSubmitted
                              ? 'bg-amber-950/40 border-amber-500/60'
                              : 'bg-slate-800/80 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                                isCompleted
                                  ? 'bg-emerald-500 text-slate-950'
                                  : isSubmitted
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {isCompleted ? '✓' : isSubmitted ? '⌛' : '•'}
                            </div>
                            <div>
                              <p
                                className={`text-sm font-bold ${
                                  isCompleted ? 'text-emerald-300 line-through' : 'text-white'
                                }`}
                              >
                                {t.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                <span className="text-amber-300 font-bold">+{t.points} pts</span>
                                <span>•</span>
                                <span>
                                  Estado:{' '}
                                  <strong
                                    className={
                                      isCompleted
                                        ? 'text-emerald-400'
                                        : isSubmitted
                                        ? 'text-amber-400'
                                        : 'text-slate-300'
                                    }
                                  >
                                    {isCompleted
                                      ? 'Aprobada / Cumplida'
                                      : isSubmitted
                                      ? 'Pendiente de revisión'
                                      : 'Pendiente'}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isCompleted && onApproveTasks && (
                              <button
                                onClick={() => onApproveTasks([t.id])}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                              >
                                Aprobar Ahora
                              </button>
                            )}

                            {onRejectTask && (
                              <button
                                onClick={() => onRejectTask(t.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                                title="Eliminar tarea"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: TIENDA DE PREMIOS & AVATAR (GESTIÓN EXCLUSIVA DEL ADULTO) */}
          {/* ========================================================================= */}
          {activeTab === 'store' && (
            <div className="space-y-4">
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm font-black text-amber-200">
                      Gestión de Recompensas & Avatar de {state.profile.name}
                    </h4>
                  </div>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    Canjeá premios familiares, equipá accesorios de avatar y supervisá los puntos acumulados.
                  </p>
                </div>

                {onOpenStore && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenStore();
                    }}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Tienda Visual Completa</span>
                  </button>
                )}
              </div>

              {/* Student Balance Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/90 border border-amber-500/40 rounded-2xl p-4 text-center">
                  <span className="text-xs text-amber-300 font-bold flex items-center justify-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" /> Monedas de Oro
                  </span>
                  <p className="text-2xl font-black text-white mt-1">{state.profile.coins} 🪙</p>
                </div>

                <div className="bg-slate-800/90 border border-cyan-500/40 rounded-2xl p-4 text-center">
                  <span className="text-xs text-cyan-300 font-bold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Puntos de Sabiduría
                  </span>
                  <p className="text-2xl font-black text-white mt-1">{state.profile.wisdomPoints} pts</p>
                </div>

                <div className="bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-4 text-center">
                  <span className="text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5">
                    <Heart className="w-4 h-4 text-emerald-400" /> Puntos de Vida
                  </span>
                  <p className="text-2xl font-black text-white mt-1">{state.profile.lifePoints} pts</p>
                </div>
              </div>

              {/* Accessories Management */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <span>Equipamiento y Accesorios del Avatar Infantil</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: 'backpack', name: 'Mochila Explorador', icon: '🎒' },
                    { key: 'glasses', name: 'Gafas de Sabio', icon: '👓' },
                    { key: 'medal', name: 'Medalla de Honor', icon: '🎖️' },
                    { key: 'cape', name: 'Capa Legendaria', icon: '🦸' },
                  ].map((item) => {
                    const isUnlocked = state.profile.inventory?.includes(item.key);
                    const isEquipped = state.profile.avatar?.accessory === item.key;

                    return (
                      <div
                        key={item.key}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isEquipped
                            ? 'bg-purple-950/60 border-purple-400 shadow'
                            : isUnlocked
                            ? 'bg-slate-900 border-slate-700'
                            : 'bg-slate-950/50 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {isEquipped ? '✓ Equipado' : isUnlocked ? 'En Inventario' : 'Bloqueado'}
                        </span>

                        <div className="mt-2">
                          {isUnlocked ? (
                            <button
                              onClick={() => {
                                if (onEquipAccessory) {
                                  onEquipAccessory(isEquipped ? 'none' : (item.key as any));
                                }
                              }}
                              className={`w-full py-1 text-[11px] font-bold rounded-lg ${
                                isEquipped
                                  ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200'
                                  : 'bg-purple-600 hover:bg-purple-500 text-white'
                              }`}
                            >
                              {isEquipped ? 'Desequipar' : 'Equipar'}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (onPurchaseItem) {
                                  onPurchaseItem({
                                    id: `unlock_${item.key}`,
                                    title: item.name,
                                    cost: 0,
                                    costType: 'coins',
                                    type: 'avatar',
                                    itemKey: item.key,
                                  });
                                }
                              }}
                              className="w-full py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg cursor-pointer"
                            >
                              Desbloquear
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Family Rewards Catalog */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>Catálogo de Premios Familiares</span>
                  </h4>
                  {onUpdateStoreItems && (
                    <button
                      onClick={() => setEditingReward(null)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Crear Premio
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(state.storeItems || []).filter(i => i.type === 'real_life').map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-2xl shrink-0">{item.icon}</span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">{item.title}</span>
                            <span className="text-[11px] text-amber-400 font-bold mt-0.5 block">
                              {item.cost}{' '}
                              {item.costType === 'coins' ? '🪙 Monedas' : item.costType === 'sabiduria' ? '💙 Sabiduría' : '💚 Vida'}
                            </span>
                          </div>
                        </div>
                        {onUpdateStoreItems && (
                          <button
                            onClick={() => setEditingReward(item)}
                            className="shrink-0 p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Editar premio"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{item.description}</p>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => {
                            if (onPurchaseItem) {
                              onPurchaseItem(item);
                            }
                          }}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer shadow"
                        >
                          Canjear
                        </button>
                        {onUpdateStoreItems && (
                          <button
                            onClick={() => {
                              const items = (state.storeItems || []).filter(i => i.id !== item.id);
                              onUpdateStoreItems(items);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar premio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reward Editor Modal (inside dashboard) */}
          {editingReward !== undefined && onUpdateStoreItems && (
            <RewardEditorModal
              item={editingReward}
              onSave={(savedItem) => {
                const existing = state.storeItems || [];
                const idx = existing.findIndex(i => i.id === savedItem.id);
                let updated: StoreItem[];
                if (idx >= 0) {
                  updated = existing.map(i => i.id === savedItem.id ? savedItem : i);
                } else {
                  updated = [...existing, savedItem];
                }
                onUpdateStoreItems(updated);
                setEditingReward(undefined);
              }}
              onClose={() => setEditingReward(undefined)}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 4: APROBACIONES PENDIENTES */}
          {/* ========================================================================= */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-black text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Aprobaciones Pendientes para {state.profile.name}</span>
                  </h4>
                  <p className="text-xs text-emerald-300/80 mt-0.5">
                    Tareas completadas por el estudiante que esperan revisión y aprobación de los padres.
                  </p>
                </div>

                {submittedTasks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                    >
                      {selectedTaskIds.length === submittedTasks.length ? 'Deseleccionar' : 'Seleccionar Todo'}
                    </button>

                    <button
                      onClick={handleApproveSelected}
                      disabled={selectedTaskIds.length === 0}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black shadow cursor-pointer ${
                        selectedTaskIds.length > 0
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Aprobar Seleccionadas ({selectedTaskIds.length})
                    </button>
                  </div>
                )}
              </div>

              {submittedTasks.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">¡Al día! No hay tareas pendientes de aprobación.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Cuando {state.profile.name} marque tareas como completadas en su libreta, aparecerán acá.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {submittedTasks.map((task) => {
                    const isSelected = selectedTaskIds.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleToggleSelectTask(task.id)}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-950/60 border-amber-500/80 shadow-md'
                            : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-amber-400">
                            {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-500" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">{task.title}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span className="capitalize">{task.materiaId}</span>
                              <span>•</span>
                              <span>Bimestre {task.bimestre} - Sem {task.semana}</span>
                              <span>•</span>
                              <span className="text-amber-300 font-bold">+{task.points} pts</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onApproveTasks([task.id])}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => onRejectTask(task.id)}
                            className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-xl text-xs font-bold border border-rose-700 cursor-pointer"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: PUNTOS & BAREMOS PEDAGÓGICOS */}
          {/* ========================================================================= */}
            <form onSubmit={handleSaveScoring} className="space-y-4">
              <div className="bg-teal-950/40 border border-teal-500/40 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-teal-400" />
                    <h4 className="text-sm font-black text-teal-200">
                      Configuración de Puntajes y Baremos
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScoringInput({ ...DEFAULT_SCORING_CONFIG })}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    title="Restablecer todos los valores por defecto"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    Restablecer defecto
                  </button>
                </div>
                <p className="text-xs text-teal-300/80 mt-1">
                  Ajustá los puntos por cada tipo de tarea. Los valores por defecto se muestran en gris como referencia.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { field: 'simpleTaskPoints' as keyof ScoringConfig, label: 'Actividad Simple Estándar', desc: 'Por tarea cotidiana de la libreta.', def: DEFAULT_SCORING_CONFIG.simpleTaskPoints, min: 1, max: 100 },
                  { field: 'guideCompletePoints' as keyof ScoringConfig, label: 'Guía Completa Terminada', desc: 'Cuando se aprueba toda una guía de trabajo.', def: DEFAULT_SCORING_CONFIG.guideCompletePoints, min: 5, max: 200 },
                  { field: 'weekCompleteBonus' as keyof ScoringConfig, label: 'Semana Completa (1 Materia)', desc: 'Bonus por todas las tareas de una semana.', def: DEFAULT_SCORING_CONFIG.weekCompleteBonus, min: 10, max: 300 },
                  { field: 'week1AllSubjectsBonus' as keyof ScoringConfig, label: 'Semana 1 Todas las Materias', desc: 'Premio al completar la semana 1 en todas.', def: DEFAULT_SCORING_CONFIG.week1AllSubjectsBonus, min: 20, max: 500 },
                  { field: 'week2AllSubjectsBonus' as keyof ScoringConfig, label: 'Semana 2 Todas las Materias', desc: 'Premio al completar la semana 2 en todas.', def: DEFAULT_SCORING_CONFIG.week2AllSubjectsBonus, min: 20, max: 500 },
                  { field: 'week3AllSubjectsBonus' as keyof ScoringConfig, label: 'Semana 3 Todas las Materias', desc: 'Premio al completar la semana 3 en todas.', def: DEFAULT_SCORING_CONFIG.week3AllSubjectsBonus, min: 20, max: 500 },
                  { field: 'week4AllSubjectsBonus' as keyof ScoringConfig, label: 'Semana 4 Todas las Materias', desc: 'Premio al completar la semana 4 en todas.', def: DEFAULT_SCORING_CONFIG.week4AllSubjectsBonus, min: 20, max: 500 },
                  { field: 'bimesterSubjectBonus' as keyof ScoringConfig, label: 'Bimestre Completo (8 Semanas)', desc: 'Gran recompensa al concluir un bimestre.', def: DEFAULT_SCORING_CONFIG.bimesterSubjectBonus, min: 50, max: 1000 },
                ].map(({ field, label, desc, def, min, max }) => {
                  const val = scoringInput[field] as number;
                  const isModified = val !== def;
                  return (
                    <div key={field} className={`bg-slate-800/80 border rounded-2xl p-3.5 space-y-1 transition-colors ${isModified ? 'border-amber-500/60' : 'border-slate-700'}`}>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200">{label}</label>
                        {isModified && (
                          <button
                            type="button"
                            onClick={() => setScoringInput(prev => ({ ...prev, [field]: def }))}
                            className="text-[10px] text-amber-400 hover:underline font-bold cursor-pointer"
                          >
                            ↺ {def} (defecto)
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{desc}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={min}
                          max={max}
                          value={val}
                          onChange={(e) => setScoringInput(prev => ({ ...prev, [field]: Number(e.target.value) }))}
                          className="flex-1 text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                        />
                        <span className="text-[11px] text-slate-500 whitespace-nowrap">Def: {def}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                {scoringSaved && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> ¡Baremos y puntajes guardados correctamente!
                  </span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow ml-auto cursor-pointer"
                >
                  Guardar Baremos
                </button>
              </div>
            </form>

          {/* ========================================================================= */}
          {/* TAB 6: CARGA MASIVA (.TXT) E IMPORTACIÓN ESTRUCTURADA */}
          {/* ========================================================================= */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4">
                <h4 className="text-sm font-black text-indigo-200 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-indigo-400" />
                  <span>Importador de Texto de Tareas (.TXT o Portapapeles)</span>
                </h4>
                <p className="text-xs text-indigo-300/80 mt-1">
                  Pegá el texto de las guías o actividades para cargarlas automáticamente en la libreta.
                </p>
              </div>

              {/* Selector Bar for Structured Import */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Materia Destino:</label>
                  <select
                    value={importMateria}
                    onChange={(e) => setImportMateria(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    {isKinder ? (
                      <option value={KINDER_MATERIA.id}>🎈 {KINDER_MATERIA.name}</option>
                    ) : (
                      MATERIAS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Bimestre / Ciudad:</label>
                  <select
                    value={importBimestre}
                    onChange={(e) => setImportBimestre(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value={1}>Ciudad 1 (Bimestre 1)</option>
                    <option value={2}>Ciudad 2 (Bimestre 2)</option>
                    <option value={3}>Ciudad 3 (Bimestre 3)</option>
                    <option value={4}>Ciudad 4 (Bimestre 4)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Semana (1 a 8):</label>
                  <select
                    value={importSemana}
                    onChange={(e) => setImportSemana(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semana {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Modo de Carga:</label>
                  <select
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="general">_ General (video, cuestionario, etc)</option>
                    <option value="guide">_ Actividades de la GUIA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Pegá el texto aquí (un ítem o tarea por línea):
                </label>
                <textarea
                  rows={6}
                  placeholder={`Ejemplo:\nGuía 1: Resolver ejercicios de sumas\nCompletar lectura página 12\nActividad práctica de ciencias\nGUIA TERMINADA`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono placeholder:text-slate-600 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between">
                {importSuccessMsg && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> {importSuccessMsg}
                  </span>
                )}
                <button
                  onClick={handleExecuteImport}
                  disabled={!rawText.trim()}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow ml-auto ${
                    rawText.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Importar a la Libreta</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: DESBLOQUEO RÁPIDO DE CIUDADES */}
          {/* ========================================================================= */}
          {activeTab === 'cities' && (
            <div className="space-y-4">
              <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-black text-cyan-200 flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-cyan-400" />
                    <span>Desbloqueo Rápido de Bimestres para {state.profile.name}</span>
                  </h4>
                  <p className="text-xs text-cyan-300/80 mt-0.5">
                    Permite abrir todas las ciudades a la vez o configurar qué ciudades están accesibles.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onUnlockAllCities();
                    alert(`¡Todas las 4 ciudades de todas las materias han sido desbloqueadas para ${state.profile.name}!`);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                >
                  Desbloquear Todo el Año (1 Click)
                </button>
              </div>

              {/* Materias Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(isKinder ? [KINDER_MATERIA] : MATERIAS).map((m) => {
                  const unlockedMax = state.profile.unlockedCities[m.id] || 1;
                  return (
                    <div
                      key={m.id}
                      className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{m.name}</span>
                        <span className="text-[10px] text-amber-300 font-bold">
                          Hasta Ciudad {unlockedMax}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {BIMESTRES_INFO.map((b) => {
                          const isUnlocked = b.id <= unlockedMax;
                          return (
                            <button
                              key={b.id}
                              onClick={() => onToggleCity(m.id, b.id)}
                              className={`p-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                                isUnlocked
                                  ? 'bg-emerald-600/80 text-white border-emerald-400'
                                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600'
                              }`}
                            >
                              <div className="text-center">{b.label}</div>
                              <div className="text-[9px] opacity-80">{isUnlocked ? '✓ Abierta' : '🔒'}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: AJUSTES GENERALES, KILOMETRAJES Y CAMBIO DE PIN */}
          {/* ========================================================================= */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Actualizar Contraseña Parental */}
              <div className="bg-slate-800/80 border border-amber-500/40 rounded-2xl p-4 space-y-3">
                <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Contraseña Parental (PIN de 4 dígitos)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Contraseña actual: <strong className="text-amber-300 font-mono">{expectedPin}</strong>. Podés cambiarla a otra de 4 dígitos.
                </p>

                <form onSubmit={handleSavePin} className="flex items-center gap-3 max-w-sm">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Nuevo PIN de 4 dígitos"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-40 text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono tracking-widest text-center font-bold"
                  />
                  <button
                    type="submit"
                    disabled={newPinInput.length !== 4}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black shadow ${
                      newPinInput.length === 4
                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Actualizar PIN
                  </button>
                </form>
                {pinChangeMsg && (
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> {pinChangeMsg}
                  </p>
                )}
              </div>

              {/* Ajuste de Kilometrajes */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                <h4 className="text-sm font-black text-sky-300 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>Configuración de Kilometrajes de {state.profile.name} (0 a 365 KM)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Si el estudiante comenzó en fecha posterior, podés fijar el KM de partida o ajustar los KM Ganados.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      KM Inicial de Partida (0 a 365):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={customStartKm}
                      onChange={(e) => setCustomStartKm(parseInt(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      KM Ganados Actuales:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={customKmGanados}
                      onChange={(e) => setCustomKmGanados(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      onUpdateKmSettings(customStartKm, customKmGanados);
                      alert('¡Kilometraje actualizado correctamente!');
                    }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                  >
                    Guardar Kilometraje
                  </button>
                </div>
              </div>

              {/* Paso de Semana y Auto-Aprobación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-black text-purple-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>Cierre de Semana Pedagógica</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Verifica tareas vencidas y aplica el baremo de degradación según los días de retraso.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('¿Ejecutar el cierre y paso de semana pedagógica ahora?')) {
                        onExecuteWeekPass();
                        alert('¡Paso de semana ejecutado exitosamente!');
                      }
                    }}
                    className="w-full py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                  >
                    Ejecutar Paso de Semana
                  </button>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-black text-amber-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Aprobación Automática</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Aprobar instantáneamente cuando el niño marque la tarea en su libreta.
                  </p>
                  <button
                    onClick={() => {
                      const next = !state.settings.autoApproveInChildMode;
                      onToggleAutoApprove(next);
                    }}
                    className={`w-full py-2 text-xs font-bold rounded-xl shadow transition-colors cursor-pointer ${
                      state.settings.autoApproveInChildMode
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {state.settings.autoApproveInChildMode
                      ? '✓ Activado (Auto-aprobación)'
                      : 'Desactivado (Requiere aprobación del padre)'}
                  </button>
                </div>
              </div>

              {/* Rescate de Tareas Vencidas */}
              {overdueTasks.length > 0 && (
                <div className="bg-slate-800/80 border border-rose-800/60 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-black text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Tareas Vencidas ({overdueTasks.length}) — Rescate por Caso Especial</span>
                  </h4>
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {overdueTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-900/40 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{task.title}</p>
                          <span className="text-[10px] text-rose-400">
                            Degradada a {task.points} pts ({task.daysOverdue || 1} días tarde)
                          </span>
                        </div>
                        <button
                          onClick={() => onRescueTask(task.id)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg font-black text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Rescatar 100% Pts</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
