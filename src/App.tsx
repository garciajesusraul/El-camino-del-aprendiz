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
  updateUserPoints,
  canRedeemReward,
  redeemReward,
} from './services/storage';
import { HeaderHUD } from './components/HeaderHUD';
import { GameCanvas } from './components/GameCanvas';
import { MissionNotebookModal } from './components/MissionNotebookModal';
import { ParentAdminDashboard } from './components/ParentAdminDashboard';
import { StoreModal } from './components/StoreModal';
import { DailyPointsModal } from './components/DailyPointsModal';
import { MedalAlbum } from './components/MedalAlbum';
import { MATERIAS, KINDER_MATERIA } from './data/constants';
import { sound } from './services/audio';

export default function App() {
  const [state, setState] = useState<AppState>(loadAppState);

  // Active Modals
  const [showNotebook, setShowNotebook] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showMedalAlbum, setShowMedalAlbum] = useState(false);
  const [showDailyPoints, setShowDailyPoints] = useState(false);

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
    setState((prev) => approveTasks(prev, taskIds));
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

  const themeBg = state.settings.theme === 'light' ? 'bg-stone-100 text-slate-900' : state.settings.theme === 'semi' ? 'bg-[#1c1917] text-stone-100' : 'bg-slate-950 text-slate-100';
  const themeRoot = state.settings.theme === 'light' ? 'light' : state.settings.theme === 'semi' ? 'semi' : 'dark';
  return (
    <div className={`h-screen w-screen flex flex-col items-center justify-center select-none font-sans overflow-hidden relative p-0 m-0 ${themeBg}`} data-theme={themeRoot}>
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
        />
      </main>

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
    </div>
  );
}
