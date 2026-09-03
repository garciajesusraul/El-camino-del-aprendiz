import React, { useState, useEffect, useCallback } from 'react';
import { AppState, GenderType, GradeLevelType, SceneType, ScoringConfig, StoreItem, Task } from './types';
import {
  loadAppState,
  saveAppState,
  submitTaskCompletion,
  approveTasks,
  rejectTask,
  deleteTask,
  executeWeekPass,
  rescueExpiredTask,
  toggleCityUnlock,
  unlockAllCities,
  parseAndImportTasksFromText,
  importTasksStructured,
  approveWeek,
  approveBimestre,
  unapproveWeek,
  unapproveBimestre,
  configureGameStart,
  toggleMedalEnabled,
  upsertMedalDefinition,
  deleteMedalDefinition,
  setManualMedalActive,
  switchUserProfile,
  createUserProfile,
  updateUserProfile,
  updateCharacterName,
  deleteUserProfile,
  updateScoringConfig,
  updateSoundVolume,
  updateTheme,
  updateHabitBoardSize,
  toggleHabitToday,
  approveHabit,
  rejectHabit,
  upsertHabitDefinition,
  deleteHabitDefinition,
  updatePomodoroMinutes,
  updatePromises,
  incrementPlayStats,
  updateUserPoints,
  canRedeemReward,
  redeemReward,
  updateVirtualJoystick,
} from './services/storage';
import { HeaderHUD } from './components/HeaderHUD';
import { VirtualJoystick } from './components/VirtualJoystick';
import { GameCanvas } from './components/GameCanvas';
import { MissionNotebookModal } from './components/MissionNotebookModal';
import { ParentAdminDashboard } from './components/ParentAdminDashboard';
import { StoreModal } from './components/StoreModal';
import { DailyPointsModal } from './components/DailyPointsModal';
import { MedalAlbum } from './components/MedalAlbum';
import { HabitsBoard } from './components/HabitsBoard';
import { LeonPomodoro } from './components/LeonPomodoro';
import { MATERIAS, KINDER_MATERIA } from './data/constants';
import { sound } from './services/audio';
import { FamilyGate, FamilyBadge } from './components/FamilyGate';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { getFamilyCode, clearFamilyCode, getSyncIntervalMinutes, setSyncIntervalMinutes, isLeonFamily } from './services/family';
import { isSupabaseConfigured } from './services/supabase';
import { syncStateToCloud, loadStateFromCloud, schedulePeriodicSync } from './services/cloudSync';

export default function App() {
  const [familyCode, setFamilyCodeState] = useState<string | null>(() => getFamilyCode());
  const [cloudStatus, setCloudStatus] = useState<string>('');
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [syncInterval, setSyncIntervalState] = useState<number>(() => getSyncIntervalMinutes());
  const [state, setState] = useState<AppState>(() => {
    const local = loadAppState();
    return local;
  });

  // Active Modals
  const [showNotebook, setShowNotebook] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showMedalAlbum, setShowMedalAlbum] = useState(false);
  const [showDailyPoints, setShowDailyPoints] = useState(false);
  const [showHabitsBoard, setShowHabitsBoard] = useState(false);
  const [showPromise, setShowPromise] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionSec, setSessionSec] = useState(0);
  const [activeSec, setActiveSec] = useState(0);
  const sessionStartRef = React.useRef<number>(Date.now());
  const isMovingRef = React.useRef(false);
  const lastActiveRef = React.useRef<number>(Date.now());

  const handleActivity = useCallback((moving: boolean) => {
    isMovingRef.current = moving;
    if (moving) lastActiveRef.current = Date.now();
  }, []);

  // Timer + tracking total/active con pausa e idle >4min no cuenta
  useEffect(() => {
    const id = window.setInterval(() => {
      if (isPaused) return;
      if (Date.now() - lastActiveRef.current > 240000) return;
      setSessionSec(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      if (isMovingRef.current) {
        setActiveSec((prev) => prev + 1);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPaused]);
  // Pausa BGM
  useEffect(() => {
    if (isPaused) {
      sound.stopBgm();
    } else {
      if (state.settings.musicEnabled && state.settings.musicVolume !== 0) {
        sound.startBgm();
      }
    }
  }, [isPaused, state.settings.musicEnabled, state.settings.musicVolume, state.currentScene, state.currentMateria]);
  // Actualiza lastActive en interacciones significativas (no mousemove genérico para no contar mouse quieto como activo)
  useEffect(() => {
    const bump = () => { lastActiveRef.current = Date.now(); };
    const bumpKey = (e: KeyboardEvent) => {
      // H y otras teclas de acción cuentan como actividad
      lastActiveRef.current = Date.now();
    };
    window.addEventListener('click', bump);
    window.addEventListener('keydown', bumpKey);
    window.addEventListener('touchstart', bump);
    return () => {
      window.removeEventListener('click', bump);
      window.removeEventListener('keydown', bumpKey);
      window.removeEventListener('touchstart', bump);
    };
  }, []);
  // Persist stats cada minuto (solo si no pausado y no idle)
  useEffect(() => {
    if (isPaused) return;
    if (Date.now() - lastActiveRef.current > 240000) return;
    if (sessionSec > 0 && sessionSec % 60 === 0) {
      setState((prev) => incrementPlayStats(prev, 1, Math.floor(activeSec / 60)));
      setActiveSec(0);
    }
  }, [sessionSec, activeSec, isPaused]);

  // Load from cloud on familyCode change
  useEffect(() => {
    if (!familyCode || !isSupabaseConfigured()) return;
    let cancelled = false;
    (async () => {
      setCloudStatus('Cargando nube...');
      const { state: cloudState, error } = await loadStateFromCloud();
      if (!cancelled && cloudState) {
        setState(cloudState);
        saveAppState(cloudState);
        setCloudStatus('Sincronizado ✓');
        setTimeout(() => setCloudStatus(''), 2000);
      } else if (!cancelled && error && error.includes('Could not find the table')) {
        setCloudStatus('Ejecuta supabase_schema.sql en Supabase');
      } else if (!cancelled) {
        // No cloud data yet -> push local
        const res = await syncStateToCloud(state);
        if (!cancelled) setCloudStatus(res.ok ? 'Subido a nube ✓' : `Error: ${res.error}`);
        setTimeout(() => setCloudStatus(''), 3000);
      }
    })();
    return () => { cancelled = true; };
  }, [familyCode]);

  // Periodic sync - pausado no sincroniza
  useEffect(() => {
    if (isPaused) return;
    if (!familyCode || !isSupabaseConfigured()) return;
    const cleanup = schedulePeriodicSync(() => state, (ok, msg) => {
      setCloudStatus(ok ? `Sync ${new Date().toLocaleTimeString()} ✓` : `Sync error: ${msg}`);
      setTimeout(() => setCloudStatus(''), 3000);
    });
    return cleanup;
  }, [familyCode, syncInterval, state, isPaused]);

  // Synchronize state changes to localStorage and audio volume
  useEffect(() => {
    saveAppState(state);
    // Sync SFX volume
    if (state.settings?.soundVolume !== undefined) {
      sound.setSfxVolume(state.settings.soundVolume);
    }
    // Sync BGM volume and start/stop
    if (state.settings?.musicVolume !== undefined) {
      sound.setMusicVolume(state.settings.musicVolume);
    }
    if (state.settings?.musicEnabled === false) {
      sound.stopBgm();
    } else if (state.settings?.musicEnabled !== false && state.settings?.musicVolume !== 0) {
      // Start BGM if not playing yet
      sound.startBgm();
    }
  }, [state]);

  // Handle Scene Transitions
  const handleSceneChange = useCallback(
    (newScene: SceneType, extra?: { materia?: string; city?: number; house?: number }) => {
      setState((prev) => {
        let updatedMateria = extra?.materia !== undefined ? extra.materia : prev.currentMateria;
        let updatedCity = extra?.city !== undefined ? extra.city : prev.currentCity;
        let updatedHouse = extra?.house !== undefined ? extra.house : prev.currentHouse;

        if (newScene === 'PLAZA' && !updatedMateria) {
          updatedMateria = prev.profile?.gradeLevel === 'kinder' ? KINDER_MATERIA.id : MATERIAS[0].id;
        }

        const nextState: AppState = {
          ...prev,
          currentScene: newScene,
          currentMateria: updatedMateria,
          currentCity: updatedCity || 1,
          currentHouse: updatedHouse || 1,
        };
        saveAppState(nextState);
        return nextState;
      });
    },
    []
  );

  // Open Mission Notebook for specific or current house
  const handleOpenNotebook = useCallback(
    (materiaId?: string, cityNum?: number, houseNum?: number) => {
      setState((prev) => {
        const defaultMat = prev.profile?.gradeLevel === 'kinder' ? KINDER_MATERIA.id : MATERIAS[0].id;
        const nextState: AppState = {
          ...prev,
          currentMateria: materiaId || prev.currentMateria || defaultMat,
          currentCity: cityNum || prev.currentCity || 1,
          currentHouse: houseNum || prev.currentHouse || 1,
        };
        saveAppState(nextState);
        return nextState;
      });
      setShowNotebook(true);
      sound.playSelect();
    },
    []
  );

  // Task Handlers
  const handleCompleteTask = (taskId: string) => {
    setState((prev) => submitTaskCompletion(prev, taskId));
  };

  const handleAddTask = (newTaskData: Partial<Task>) => {
    const defaultMat = state.profile?.gradeLevel === 'kinder' ? KINDER_MATERIA.id : 'matematicas';
    const task: Task = {
      id: `task-custom-${Date.now()}-${state.activeUserId}`,
      userId: state.activeUserId,
      materiaId: newTaskData.materiaId || state.currentMateria || defaultMat,
      bimestre: newTaskData.bimestre || state.currentCity || 1,
      semana: newTaskData.semana || state.currentHouse || 1,
      title: newTaskData.title || 'Nueva Tarea',
      points: newTaskData.points || 10,
      type: newTaskData.type || 'sabiduria',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setState((prev) => {
      const nextState = { ...prev, tasks: [task, ...prev.tasks] };
      saveAppState(nextState);
      return nextState;
    });
  };

  const handleRescueTask = (taskId: string) => {
    setState((prev) => rescueExpiredTask(prev, taskId));
  };

  // Parent Admin Handlers
  const handleApproveTasks = (taskIds: string[]) => {
    // Detect week_complete before/after to trigger promise
    setState((prev) => {
      const beforeWeeks = new Map<string, boolean>();
      const weekKey = (t: Task) => `${t.materiaId}|${t.bimestre}|${t.semana}`;
      for (const t of prev.tasks) {
        const k = weekKey(t);
        if (!beforeWeeks.has(k)) {
          const weekTasks = prev.tasks.filter((x) => weekKey(x) === k);
          beforeWeeks.set(k, weekTasks.length > 0 && weekTasks.every((x) => x.status === 'approved'));
        }
      }
      const next = approveTasks(prev, taskIds);
      const newlyComplete: string[] = [];
      for (const t of next.tasks) {
        const k = weekKey(t);
        if (!beforeWeeks.get(k)) {
          const weekTasks = next.tasks.filter((x) => weekKey(x) === k);
          if (weekTasks.length > 0 && weekTasks.every((x) => x.status === 'approved')) newlyComplete.push(k);
        }
      }
      if (newlyComplete.length > 0 && next.promises && next.promises.length > 0) {
        const randomPromise = next.promises[Math.floor(Math.random() * next.promises.length)];
        window.setTimeout(() => setShowPromise(randomPromise), 300);
      }
      return next;
    });
  };

  const handleRejectTask = (taskId: string) => {
    setState((prev) => rejectTask(prev, taskId));
  };

  const handleDeleteTask = (taskId: string) => {
    setState((prev) => deleteTask(prev, taskId));
  };

  const handleExecuteWeekPass = () => {
    setState((prev) => executeWeekPass(prev));
  };

  const handleApproveWeek = (materiaId: string, bimestre: number, semana: number) => {
    if (!confirm(`¿Aprobar toda la Semana ${semana} de Bimestre ${bimestre}? Se darán los puntos y premios.`)) return;
    setState((prev) => approveWeek(prev, materiaId, bimestre, semana));
  };
  const handleApproveBimestre = (materiaId: string, bimestre: number) => {
    if (!confirm(`¿Aprobar todo el Bimestre ${bimestre} (${materiaId})? Son 8 semanas. Se darán los puntos y premios.`)) return;
    setState((prev) => approveBimestre(prev, materiaId, bimestre));
  };
  const handleUnapproveWeek = (materiaId: string, bimestre: number, semana: number) => {
    if (!confirm(`¿Desmarcar la Semana ${semana}? Se quitarán los puntos dados y vuelve a pendiente. ¿Seguro?`)) return;
    setState((prev) => unapproveWeek(prev, materiaId, bimestre, semana));
  };
  const handleUnapproveBimestre = (materiaId: string, bimestre: number) => {
    if (!confirm(`¿Desmarcar todo el Bimestre ${bimestre}? Se quitarán los puntos. ¿Seguro?`)) return;
    setState((prev) => unapproveBimestre(prev, materiaId, bimestre));
  };
  const handleConfigureGameStart = (bimestre: number, semana: number, grantPoints: boolean) => {
    const puntosTxt = grantPoints ? 'SÍ se darán puntos y premios por lo anterior' : 'NO se darán puntos (arranca de cero)';
    if (!confirm(`¿Configurar inicio en Bimestre ${bimestre} Semana ${semana}? ${puntosTxt}. ¿Seguro?`)) return;
    setState((prev) => configureGameStart(prev, bimestre, semana, grantPoints));
  };

  const handleUnlockAllCities = () => {
    setState((prev) => unlockAllCities(prev));
  };

  const handleToggleCity = (materiaId: string, cityNum: number) => {
    setState((prev) => toggleCityUnlock(prev, materiaId, cityNum));
  };

  const handleImportText = (text: string) => {
    setState((prev) => {
      const { newState } = parseAndImportTasksFromText(prev, text);
      return newState;
    });
  };

  const handleImportStructured = (options: {
    materiaId: string;
    bimestre: number;
    semana: number;
    mode: 'general' | 'guide';
    text: string;
  }) => {
    setState((prev) => {
      const { newState } = importTasksStructured(prev, options);
      return newState;
    });
  };

  const handleUpdateKmSettings = (startKm: number, kmGanados: number) => {
    setState((prev) => {
      const nextState: AppState = {
        ...prev,
        profile: {
          ...prev.profile,
          startKm,
          kmGanados,
        },
      };
      saveAppState(nextState);
      return nextState;
    });
  };

  const handleToggleAutoApprove = (val: boolean) => {
    setState((prev) => {
      const nextState: AppState = {
        ...prev,
        settings: {
          ...prev.settings,
          autoApproveInChildMode: val,
        },
      };
      saveAppState(nextState);
      return nextState;
    });
  };

  const handleUpdateScoringConfig = (scoring: Partial<ScoringConfig>) => {
    setState((prev) => updateScoringConfig(prev, scoring));
  };

  const handleUpdateVolume = (sfxVol: number, musicVol?: number) => {
    sound.setSfxVolume(sfxVol);
    if (musicVol !== undefined) sound.setMusicVolume(musicVol);
    setState((prev) => updateSoundVolume(prev, sfxVol, musicVol));
  };

  // Store Item Update (add/edit/delete rewards)
  const handleUpdateStoreItems = (items: StoreItem[]) => {
    setState((prev) => {
      const nextState = { ...prev, storeItems: items };
      saveAppState(nextState);
      return nextState;
    });
  };

  // User Profile Handlers
  const handleSwitchUser = (userId: string) => {
    setState((prev) => switchUserProfile(prev, userId));
  };

  const handleCreateUser = (
    name: string,
    age?: number,
    gender?: GenderType,
    gradeLevel?: GradeLevelType
  ) => {
    setState((prev) => createUserProfile(prev, name, age, gender, gradeLevel));
  };

  const handleUpdateUserProfile = (
    userId: string,
    updates: {
      name?: string;
      age?: number;
      gender?: GenderType;
      gradeLevel?: GradeLevelType;
    }
  ) => {
    setState((prev) => updateUserProfile(prev, userId, updates));
  };

  const handleUpdateUserPoints = (
    userId: string,
    updates: {
      kmGanados?: number;
      wisdomPoints?: number;
      lifePoints?: number;
      coins?: number;
    }
  ) => {
    setState((prev) => updateUserPoints(prev, userId, updates));
  };

  const handleUpdateCharacterName = (newName: string, userId?: string) => {
    setState((prev) => updateCharacterName(prev, newName, userId));
  };

  const handleDeleteUser = (userId: string) => {
    setState((prev) => deleteUserProfile(prev, userId));
  };

  const handleUpdateTheme = (theme: 'dark' | 'light' | 'semi') => {
    setState((prev) => updateTheme(prev, theme));
  };

  const handleUpdateHabitBoardSize = (width: number, height: number) => {
    setState((prev) => updateHabitBoardSize(prev, width, height));
  };

  const handleToggleHabit = (habitId: string) => {
    setState((prev) => toggleHabitToday(prev, habitId));
  };
  const handleApproveHabit = (habitId: string, date?: string) => setState((prev) => approveHabit(prev, habitId, date));
  const handleRejectHabit = (habitId: string, date?: string) => setState((prev) => rejectHabit(prev, habitId, date));
  const handleUpsertHabit = (def: any) => setState((prev) => upsertHabitDefinition(prev, def));
  const handleDeleteHabit = (habitId: string) => setState((prev) => deleteHabitDefinition(prev, habitId));
  const handleUpdatePomodoro = (userId: string, minutes: number) => setState((prev) => updatePomodoroMinutes(prev, userId, minutes));
  const handleUpdatePromises = (promises: string[]) => setState((prev) => updatePromises(prev, promises));

  const handleUpdateParentPin = (newPin: string) => {
    setState((prev) => {
      const nextState: AppState = {
        ...prev,
        settings: {
          ...prev.settings,
          parentPin: newPin,
        },
      };
      saveAppState(nextState);
      return nextState;
    });
  };

  // Store Handlers
  const handlePurchaseItem = (item: StoreItem) => {
    setState((prev) => {
      const check = canRedeemReward(prev, item.id);
      if (!check.allowed) {
        alert(check.reason || 'Límite de canje alcanzado');
        return prev;
      }
      let newWisdom = prev.profile.wisdomPoints;
      let newLife = prev.profile.lifePoints;
      let newCoins = prev.profile.coins;
      const newInventory = [...prev.profile.inventory];

      if (item.costType === 'sabiduria' && newWisdom < item.cost) { alert('Puntos de sabiduría insuficientes'); return prev; }
      if (item.costType === 'vida' && newLife < item.cost) { alert('Puntos de vida insuficientes'); return prev; }
      if (item.costType === 'coins' && newCoins < item.cost) { alert('Monedas insuficientes'); return prev; }

      if (item.costType === 'sabiduria') newWisdom -= item.cost;
      if (item.costType === 'vida') newLife -= item.cost;
      if (item.costType === 'coins') newCoins -= item.cost;

      if (item.type === 'avatar' && item.itemKey && !newInventory.includes(item.itemKey)) {
        newInventory.push(item.itemKey);
      }

      let nextState: AppState = {
        ...prev,
        profile: {
          ...prev.profile,
          wisdomPoints: newWisdom,
          lifePoints: newLife,
          coins: newCoins,
          inventory: newInventory,
          avatar: {
            ...prev.profile.avatar,
            accessory: item.type === 'avatar' && item.itemKey ? (item.itemKey as any) : prev.profile.avatar.accessory,
          },
        },
      };
      const redeemed = redeemReward(nextState, item.id);
      if (!redeemed.ok) {
        alert(redeemed.reason);
        return prev;
      }
      nextState = redeemed.newState;
      saveAppState(nextState);
      return nextState;
    });
  };

  const handleEquipAccessory = (accessoryKey: 'none' | 'backpack' | 'glasses' | 'medal' | 'cape') => {
    setState((prev) => {
      if (accessoryKey !== 'none') {
        const active = (prev.avatarActives || []).find((a) => a.userId === prev.activeUserId && a.itemKey === accessoryKey);
        const item = prev.storeItems.find((s) => s.itemKey === accessoryKey);
        const isLimited = item && item.avatarDuration === 'limited_days';
        if (isLimited && !active) {
          alert('Este accesorio expiró. Debes canjearlo nuevamente.');
          return prev;
        }
        if (!prev.profile.inventory.includes(accessoryKey)) {
          alert('Primero debes desbloquear este accesorio en la tienda');
          return prev;
        }
      }
      const nextState: AppState = {
        ...prev,
        profile: {
          ...prev.profile,
          avatar: {
            ...prev.profile.avatar,
            accessory: accessoryKey,
          },
        },
      };
      saveAppState(nextState);
      return nextState;
    });
  };

  const handleToggleMedalEnabled = (medalId: string) => setState((prev) => toggleMedalEnabled(prev, medalId));
  const handleUpsertMedal = (def: any) => setState((prev) => upsertMedalDefinition(prev, def));
  const handleDeleteMedal = (medalId: string) => setState((prev) => deleteMedalDefinition(prev, medalId));
  const handleSetManualMedal = (medalId: string, userId: string, active: boolean) => setState((prev) => setManualMedalActive(prev, medalId, userId, active));

  const formatSession = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const themeBg = state.settings.theme === 'light' ? 'bg-stone-100 text-slate-900' : state.settings.theme === 'semi' ? 'bg-[#1c1917] text-stone-100' : 'bg-slate-950 text-slate-100';
  const themeRoot = state.settings.theme === 'light' ? 'light' : state.settings.theme === 'semi' ? 'semi' : 'dark';

  const handleFamilyEnter = (code: string) => {
    setFamilyCodeState(code);
    setCloudStatus('Familia ' + code + ' ✓');
    setTimeout(() => setCloudStatus(''), 2000);
  };
  const handleFamilySwitch = () => {
    clearFamilyCode();
    setFamilyCodeState(null);
  };
  const handleSyncNow = async () => {
    setCloudStatus('Sincronizando...');
    const res = await syncStateToCloud(state);
    setCloudStatus(res.ok ? 'Sincronizado ✓' : `Error: ${res.error}`);
    setTimeout(() => setCloudStatus(''), 3000);
  };
  const handleSyncIntervalChange = (m: number) => {
    setSyncIntervalMinutes(m);
    setSyncIntervalState(m);
    setCloudStatus(`Sync cada ${m} min`);
    setTimeout(() => setCloudStatus(''), 2000);
  };
  const handleTogglePause = () => setIsPaused((prev) => !prev);
  const handleToggleJoystick = (enabled: boolean) => setState((prev) => updateVirtualJoystick(prev, enabled));

  if (!familyCode) {
    return <FamilyGate onEnter={handleFamilyEnter} />;
  }

  return (
    <div className={`h-screen w-screen flex flex-col items-center justify-center select-none font-sans overflow-hidden relative p-0 m-0 ${themeBg}`} data-theme={themeRoot}>
      {/* Reloj, familia y sync solo en menú padre - ocultos del niño */}
      {cloudStatus && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700 rounded-full px-3 py-1 text-[11px] text-slate-300">
          {cloudStatus}
        </div>
      )}
      {/* Top Dynamic HUD with Menu, User Display and Sound Volume */}
      <HeaderHUD
        state={state}
        onSceneChange={(s) => handleSceneChange(s)}
        onOpenStore={() => setShowStore(true)}
        onOpenNotebook={() => handleOpenNotebook()}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenDailyPoints={() => setShowDailyPoints(true)}
        onOpenMedalAlbum={() => setShowMedalAlbum(true)}
        onUpdateVolume={handleUpdateVolume}
      />

      {/* Main 2D Canvas Engine - Full Viewport */}
      <main className="w-full h-full flex items-center justify-center overflow-hidden relative">
        <GameCanvas
          state={state}
          onSceneChange={handleSceneChange}
          onOpenNotebook={handleOpenNotebook}
          onOpenStore={() => setShowStore(true)}
          onOpenAdmin={() => setShowAdmin(true)}
          onUpdateVolume={handleUpdateVolume}
          onOpenHabitsBoard={() => setShowHabitsBoard(true)}
          onActivity={handleActivity}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
        />
      </main>
      {/* LEON perro marrón - bottom left, pomodoro 20 min por perfil */}
      <LeonPomodoro pomodoroMinutes={state.profile.pomodoroMinutes ?? 20} onComplete={() => { /* celebration handled inside */ }} />
      {/* Joystick virtual transparente para celular */}
      <VirtualJoystick enabled={!!state.settings.virtualJoystickEnabled} />

      {/* Pantalla 5: Libreta de Misiones Modal */}
      {showNotebook && (
        <MissionNotebookModal
          state={state}
          onClose={() => setShowNotebook(false)}
          onCompleteTask={handleCompleteTask}
          onAddTask={handleAddTask}
          onRescueTask={handleRescueTask}
        />
      )}

      {/* Panel de Modo Padre / Admin */}
      {showAdmin && (
        <ParentAdminDashboard
          state={state}
          onClose={() => setShowAdmin(false)}
          onApproveTasks={handleApproveTasks}
          onRejectTask={handleRejectTask}
          onExecuteWeekPass={handleExecuteWeekPass}
          onUnlockAllCities={handleUnlockAllCities}
          onToggleCity={handleToggleCity}
          onImportText={handleImportText}
          onImportStructured={handleImportStructured}
          onUpdateKmSettings={handleUpdateKmSettings}
          onToggleAutoApprove={handleToggleAutoApprove}
          onRescueTask={handleRescueTask}
          onSwitchUser={handleSwitchUser}
          onCreateUser={handleCreateUser}
          onUpdateUserProfile={handleUpdateUserProfile}
          onUpdateCharacterName={handleUpdateCharacterName}
          onDeleteUser={handleDeleteUser}
          onUpdateScoringConfig={handleUpdateScoringConfig}
          onUpdateParentPin={handleUpdateParentPin}
          onUpdateVolume={handleUpdateVolume}
          onUpdateTheme={handleUpdateTheme}
          onUpdateHabitBoardSize={handleUpdateHabitBoardSize}
          onToggleHabit={handleToggleHabit}
          onApproveHabit={handleApproveHabit}
          onRejectHabit={handleRejectHabit}
          onUpsertHabit={handleUpsertHabit}
          onDeleteHabit={handleDeleteHabit}
          onUpdatePomodoro={handleUpdatePomodoro}
          onUpdatePromises={handleUpdatePromises}
          familyCode={familyCode}
          syncInterval={syncInterval}
          onSyncNow={handleSyncNow}
          onSyncIntervalChange={handleSyncIntervalChange}
          onFamilySwitch={handleFamilySwitch}
          onOpenSuperAdmin={() => setShowSuperAdmin(true)}
          cloudStatus={cloudStatus}
          onToggleMedalEnabled={handleToggleMedalEnabled}
          onUpsertMedal={handleUpsertMedal}
          onDeleteMedal={handleDeleteMedal}
          onSetManualMedal={handleSetManualMedal}
          onOpenNotebook={handleOpenNotebook}
          onOpenStore={() => setShowStore(true)}
          onAddTask={handleAddTask}
          onCompleteTask={handleCompleteTask}
          onPurchaseItem={handlePurchaseItem}
          onEquipAccessory={handleEquipAccessory}
          onUpdateStoreItems={handleUpdateStoreItems}
          onUpdateUserPoints={handleUpdateUserPoints}
          onDeleteTask={handleDeleteTask}
          onApproveWeek={handleApproveWeek}
          onApproveBimestre={handleApproveBimestre}
          onUnapproveWeek={handleUnapproveWeek}
          onUnapproveBimestre={handleUnapproveBimestre}
          onToggleJoystick={handleToggleJoystick}
          onConfigureGameStart={handleConfigureGameStart}
        />
      )}

      {/* Daily Points Modal for Children */}
      {showDailyPoints && (
        <DailyPointsModal
          state={state}
          onClose={() => setShowDailyPoints(false)}
          onOpenNotebook={() => { setShowDailyPoints(false); handleOpenNotebook(); }}
        />
      )}

      {/* Modal Hábitos - interactivo desde cuadro HABITOS en Casa */}
      {showHabitsBoard && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fade-in select-none">
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-3 border-b border-emerald-500/40 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-sm">🖼️</span> Cuadro de Hábitos</h3>
            <button onClick={() => setShowHabitsBoard(false)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700">✕</button>
          </div>
          <div className="flex-1 overflow-hidden p-3 flex flex-col">
            <HabitsBoard state={state} onToggleHabit={handleToggleHabit} onClose={() => setShowHabitsBoard(false)} />
          </div>
        </div>
      )}

      {/* Cartel Promesa de Dios - al completar semana */}
      {showPromise && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-gradient-to-br from-amber-950 via-slate-900 to-indigo-950 border-2 border-amber-400 rounded-3xl shadow-[0_16px_60px_rgba(0,0,0,0.85)] p-6 text-center">
            <div className="text-4xl mb-2">📖 ✨</div>
            <h3 className="text-lg font-black text-amber-300">¡Semana completada!</h3>
            <p className="text-sm text-amber-100 mt-3 leading-relaxed font-serif italic">"{showPromise}"</p>
            <button onClick={() => setShowPromise(null)} className="mt-5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm shadow cursor-pointer">¡Amén! 🙏</button>
          </div>
        </div>
      )}

      {/* Álbum de Medallas - visible para niño */}
      {showMedalAlbum && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in select-none">
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-500/90 rounded-3xl shadow-[0_16px_60px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-4 border-b border-amber-500/40 flex items-center justify-between">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2"><span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center">🏅</span> Álbum de Medallas</h3>
              <button onClick={() => setShowMedalAlbum(false)} className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700">✕</button>
            </div>
            <div className="p-4 overflow-y-auto">
              <MedalAlbum state={state} />
            </div>
          </div>
        </div>
      )}

      {/* Tienda y Personalizador Modal */}
      {showStore && (
        <StoreModal
          state={state}
          onClose={() => setShowStore(false)}
          onPurchaseItem={handlePurchaseItem}
          onEquipAccessory={handleEquipAccessory}
        />
      )}

      {showSuperAdmin && isLeonFamily(familyCode) && (
        <SuperAdminPanel onClose={() => setShowSuperAdmin(false)} />
      )}
    </div>
  );
}
