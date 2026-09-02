import { AppState, AvatarActive, ChildProfile, GameSettings, GenderType, GradeLevelType, HabitDefinition, HabitLog, ManualMedalOverride, MedalDefinition, ScoringConfig, StoreItem, Task, TaskStatus } from '../types';
import { DEFAULT_PROMISES, DEFAULT_SCORING_CONFIG, getDefaultHabitDefinitions, getDefaultMedalDefinitions, INITIAL_STORE_ITEMS, MATERIAS, generateSeedTasks } from '../data/constants';

const STORAGE_KEY = 'ruta_aprendiz_game_state_v1';

export function calculateRealKm(): number {
  // 0 to 365 based on day of current year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return Math.min(365, Math.max(1, dayOfYear));
}

export function createDefaultProfile(
  id: string,
  name: string,
  userIndex: number = 1,
  gender: GenderType = 'boy',
  gradeLevel: GradeLevelType = 'segundo_grado',
  age: number = 8
): ChildProfile {
  const realKm = calculateRealKm();
  const defaultUnlockedCities: Record<string, number> = {};
  const defaultUnlockedHouses: Record<string, Record<number, number>> = {};
  
  MATERIAS.forEach((m) => {
    defaultUnlockedCities[m.id] = 1; // Bimestre 1 unlocked by default
    defaultUnlockedHouses[m.id] = { 1: 8, 2: 8, 3: 8, 4: 8 };
  });

  return {
    id,
    name: name || `Usuario ${userIndex}`,
    role: 'child',
    age,
    gender,
    gradeLevel,
    kmGanados: userIndex === 1 ? 120 : 50,
    kmReales: realKm,
    startKm: 0,
    wisdomPoints: userIndex === 1 ? 85 : 40,
    lifePoints: userIndex === 1 ? 60 : 30,
    coins: userIndex === 1 ? 140 : 50,
    level: userIndex === 1 ? 4 : 1,
    currentStreak: userIndex === 1 ? 5 : 1,
    unlockedCities: defaultUnlockedCities,
    unlockedHouses: defaultUnlockedHouses,
    avatar: {
      skinTone: '#ffd1a4',
      hairColor: gender === 'girl' ? '#451a03' : '#18181b',
      hairStyle: gender === 'girl' ? 'long' : 'prota',
      outfitColor: gender === 'girl' ? '#f43f5e' : '#cbd5e1',
      pantsColor: gender === 'girl' ? '#1e3a8a' : '#334155',
      skirtColor: '#e11d48',
      accessory: 'backpack',
    },
    inventory: ['backpack'],
    pomodoroMinutes: 20,
  };
}

export function getDefaultState(): AppState {
  const defaultProfile = createDefaultProfile('user_1', 'Mateo', 1, 'boy', 'segundo_grado', 8);

  const defaultSettings: GameSettings = {
    soundEnabled: true,
    soundVolume: 80,
    musicEnabled: true,
    musicVolume: 70,
    musicMode: 'procedural',
    season: 'auto',
    degradationRatePerDay: 10,
    parentPin: '2026',
    autoApproveInChildMode: false,
    scoring: DEFAULT_SCORING_CONFIG,
    theme: 'dark',
    habitBoardWidth: 140,
    habitBoardHeight: 72,
  };

  return {
    profile: defaultProfile,
    profiles: [defaultProfile],
    activeUserId: 'user_1',
    tasks: generateSeedTasks('user_1'),
    storeItems: INITIAL_STORE_ITEMS,
    rewardRedemptions: [],
    avatarActives: [],
    medalDefinitions: getDefaultMedalDefinitions(),
    manualMedalOverrides: [],
    habitDefinitions: getDefaultHabitDefinitions(),
    habitLogs: [],
    playStats: { totalMinutes: 0, activeMinutes: 0 },
    promises: [...DEFAULT_PROMISES],
    settings: defaultSettings,
    currentMateria: null,
    currentCity: 1,
    currentHouse: 1,
    currentScene: 'HOUSE',
    selectedTaskFilter: 'all',
  };
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultState();
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppState;
    const realKm = calculateRealKm();

    // Ensure settings has required fields
    if (!parsed.settings) {
      parsed.settings = {
        soundEnabled: true,
        soundVolume: 80,
        musicEnabled: true,
        musicVolume: 70,
        musicMode: 'procedural',
        season: 'auto',
        degradationRatePerDay: 10,
        parentPin: '2026',
        autoApproveInChildMode: false,
        scoring: DEFAULT_SCORING_CONFIG,
        theme: 'dark',
        habitBoardWidth: 140,
        habitBoardHeight: 72,
      };
    } else {
      if (!parsed.settings.parentPin) parsed.settings.parentPin = '2026';
      if (parsed.settings.soundVolume === undefined) parsed.settings.soundVolume = 80;
      if (parsed.settings.musicVolume === undefined) parsed.settings.musicVolume = 70;
      if (parsed.settings.musicEnabled === undefined) parsed.settings.musicEnabled = true;
      if ((parsed.settings as any).musicMode === undefined) (parsed.settings as any).musicMode = 'procedural';
      if (!parsed.settings.scoring) parsed.settings.scoring = DEFAULT_SCORING_CONFIG;
      if ((parsed.settings as any).theme === undefined) (parsed.settings as any).theme = 'dark';
      if ((parsed.settings as any).habitBoardWidth === undefined) (parsed.settings as any).habitBoardWidth = 140;
      if ((parsed.settings as any).habitBoardHeight === undefined) (parsed.settings as any).habitBoardHeight = 72;
    }

    // Migration for multi-profile support
    if (!parsed.profiles || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      const singleProf = parsed.profile || createDefaultProfile('user_1', 'Mateo', 1, 'boy', 'segundo_grado', 8);
      if (!singleProf.id) singleProf.id = 'user_1';
      parsed.profiles = [singleProf];
      parsed.activeUserId = singleProf.id;
    }

    if (!parsed.activeUserId) {
      parsed.activeUserId = parsed.profiles[0].id;
    }

    let activeProf = parsed.profiles.find((p) => p.id === parsed.activeUserId);
    if (!activeProf) {
      activeProf = parsed.profiles[0];
      parsed.activeUserId = activeProf.id;
    }

    // Sync pomodoroMinutes default per profile
    parsed.profiles = parsed.profiles.map((p: any) => {
      if (p.pomodoroMinutes === undefined) p.pomodoroMinutes = 20;
      return p;
    });
    if ((parsed.profile as any).pomodoroMinutes === undefined) (parsed.profile as any).pomodoroMinutes = (parsed.profiles.find((p: any)=>p.id===parsed.activeUserId) as any)?.pomodoroMinutes ?? 20;

    // Sync avatar & real KM for all profiles
    parsed.profiles = parsed.profiles.map((p) => {
      p.kmReales = realKm;
      if (!p.gender) p.gender = 'boy';
      if (!p.gradeLevel) p.gradeLevel = 'segundo_grado';
      if (!p.avatar) {
        p.avatar = {
          skinTone: '#ffd1a4',
          hairColor: p.gender === 'girl' ? '#451a03' : '#18181b',
          hairStyle: p.gender === 'girl' ? 'long' : 'prota',
          outfitColor: p.gender === 'girl' ? '#f43f5e' : '#cbd5e1',
          pantsColor: p.gender === 'girl' ? '#1e3a8a' : '#334155',
          skirtColor: '#e11d48',
          accessory: 'backpack',
        };
      } else if (p.gender === 'boy') {
        // Normalize boy avatar - respecta rulos si eligió curly (opción B)
        if (!p.avatar.hairColor || p.avatar.hairColor === '#451a03') {
          p.avatar.hairColor = '#18181b';
        }
        if (!p.avatar.outfitColor || p.avatar.outfitColor === '#ea580c' || p.avatar.outfitColor === '#3b82f6') {
          p.avatar.outfitColor = '#cbd5e1';
        }
        if (!p.avatar.pantsColor || p.avatar.pantsColor === '#1e3a8a') {
          p.avatar.pantsColor = '#334155';
        }
        if (p.avatar.hairStyle !== 'curly') {
          p.avatar.hairStyle = 'prota';
        }
      }
      return p;
    });

    parsed.profile = { ...activeProf, kmReales: realKm };

    // Ensure all tasks have a userId
    if (parsed.tasks) {
      parsed.tasks = parsed.tasks.map((t) => {
        if (!t.userId) {
          return { ...t, userId: parsed.activeUserId };
        }
        return t;
      });
    }
    if (!parsed.medalDefinitions || !Array.isArray(parsed.medalDefinitions)) parsed.medalDefinitions = getDefaultMedalDefinitions();
    if (!parsed.manualMedalOverrides) parsed.manualMedalOverrides = [];
    // Migrar medallas nuevas que no existan
    {
      const existingIds = new Set(parsed.medalDefinitions.map((m) => m.id));
      for (const def of getDefaultMedalDefinitions()) {
        if (!existingIds.has(def.id)) parsed.medalDefinitions.push(def);
      }
    }

    if (!parsed.habitDefinitions || !Array.isArray(parsed.habitDefinitions)) parsed.habitDefinitions = getDefaultHabitDefinitions();
    if (!parsed.habitLogs) parsed.habitLogs = [];
    {
      const existingHIds = new Set(parsed.habitDefinitions.map((h) => h.id));
      for (const def of getDefaultHabitDefinitions()) {
        if (!existingHIds.has(def.id)) parsed.habitDefinitions.push(def);
      }
    }

    // Migration: rebalance store costs y agregar nuevos premios diarios (helado semanal, piano, etc)
    if (!parsed.storeItems || !Array.isArray(parsed.storeItems) || parsed.storeItems.length === 0) {
      parsed.storeItems = INITIAL_STORE_ITEMS;
    } else {
      const existingById = new Map(parsed.storeItems.map((it: StoreItem) => [it.id, it]));
      const merged: StoreItem[] = INITIAL_STORE_ITEMS.map((def) => {
        const ex = existingById.get(def.id);
        if (ex) {
          return { ...ex, cost: def.cost, costType: def.costType, title: def.title, icon: def.icon, description: def.description, type: def.type, itemKey: def.itemKey, gender: (def as any).gender ?? (ex as any).gender, redeemLimit: def.redeemLimit, redeemPeriod: def.redeemPeriod, avatarDuration: def.avatarDuration, avatarDurationDays: def.avatarDurationDays, requiredDays: (def as any).requiredDays ?? (ex as any).requiredDays };
        }
        return def;
      });
      for (const ex of parsed.storeItems) {
        if (!INITIAL_STORE_ITEMS.find((d) => d.id === ex.id)) {
          merged.push(ex);
        }
      }
      parsed.storeItems = merged;
    }

    if (!parsed.rewardRedemptions) parsed.rewardRedemptions = [];
    if (!parsed.avatarActives) parsed.avatarActives = [];
    if (!parsed.playStats) parsed.playStats = { totalMinutes: 0, activeMinutes: 0 };
    if (!parsed.promises || !Array.isArray(parsed.promises)) parsed.promises = [...DEFAULT_PROMISES];
    // keep promises as string array, trim empties
    parsed.promises = parsed.promises.map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    // Expirar avatares temporales vencidos
    const nowIso = new Date().toISOString();
    parsed.avatarActives = parsed.avatarActives.filter((a) => !a.expiresAt || a.expiresAt > nowIso);
    // Si el accesorio equipado expiró, quitarlo
    const activeForProfile = parsed.avatarActives.find((a) => a.userId === parsed.activeUserId && a.itemKey === parsed.profile.avatar.accessory);
    if (parsed.profile.avatar.accessory !== 'none' && !activeForProfile) {
      // Solo quitar si era temporal y expiró; si es permanente, active no existe pero se permite
      const item = parsed.storeItems.find((s) => s.itemKey === parsed.profile.avatar.accessory);
      if (item && item.avatarDuration === 'limited_days') {
        parsed.profile.avatar.accessory = 'none';
      }
    }

    return parsed;
  } catch (e) {
    console.warn('Error reading from localStorage, using default state:', e);
    return getDefaultState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    // Keep profile and profiles synchronized before writing
    const updatedProfiles = state.profiles.map((p) => (p.id === state.activeUserId ? { ...state.profile } : p));
    const stateToSave: AppState = {
      ...state,
      profiles: updatedProfiles,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

// User & Profile Management Functions
export function switchUserProfile(state: AppState, targetUserId: string): AppState {
  if (state.activeUserId === targetUserId) return state;

  // Save current active profile back into array
  const updatedProfiles = state.profiles.map((p) => (p.id === state.activeUserId ? { ...state.profile } : p));
  const targetProfile = updatedProfiles.find((p) => p.id === targetUserId);
  if (!targetProfile) return state;

  // Check if tasks exist for this target user, if not generate seed tasks
  const hasTasks = state.tasks.some((t) => t.userId === targetUserId);
  let updatedTasks = [...state.tasks];
  if (!hasTasks) {
    const newSeed = generateSeedTasks(targetUserId);
    updatedTasks = [...updatedTasks, ...newSeed];
  }

  const newState: AppState = {
    ...state,
    profiles: updatedProfiles,
    activeUserId: targetUserId,
    profile: { ...targetProfile, kmReales: calculateRealKm() },
    tasks: updatedTasks,
    currentScene: 'HOUSE', // Return to house on user switch for a fresh start
  };
  saveAppState(newState);
  return newState;
}

export function createUserProfile(
  state: AppState,
  name: string,
  age: number = 8,
  gender: GenderType = 'boy',
  gradeLevel: GradeLevelType = 'segundo_grado'
): AppState {
  const trimmedName = name.trim() || `Usuario ${state.profiles.length + 1}`;
  const newUserId = `user_${Date.now()}`;
  const newProfile = createDefaultProfile(newUserId, trimmedName, state.profiles.length + 1, gender, gradeLevel, age);

  // Sync current profile into list first
  const currentProfiles = state.profiles.map((p) => (p.id === state.activeUserId ? { ...state.profile } : p));
  const updatedProfiles = [...currentProfiles, newProfile];

  // Seed tasks for new user
  const newTasks = generateSeedTasks(newUserId);
  const updatedTasks = [...state.tasks, ...newTasks];

  const newState: AppState = {
    ...state,
    profiles: updatedProfiles,
    activeUserId: newUserId,
    profile: newProfile,
    tasks: updatedTasks,
    currentScene: 'HOUSE',
  };
  saveAppState(newState);
  return newState;
}

export function updateUserProfile(
  state: AppState,
  targetUserId: string,
  updates: {
    name?: string;
    age?: number;
    gender?: GenderType;
    gradeLevel?: GradeLevelType;
  }
): AppState {
  const updatedProfiles = state.profiles.map((p) => {
    if (p.id === targetUserId) {
      const newGender = updates.gender ?? p.gender ?? 'boy';
      const updatedAvatar = {
        ...p.avatar,
        hairStyle: newGender === 'girl' ? ('long' as const) : ('prota' as const),
        hairColor: newGender === 'girl' ? '#451a03' : '#18181b',
        outfitColor: newGender === 'girl' ? '#f43f5e' : '#cbd5e1',
        pantsColor: newGender === 'girl' ? '#1e3a8a' : '#334155',
        skirtColor: '#e11d48',
      };

      return {
        ...p,
        name: updates.name !== undefined ? updates.name.trim() || p.name : p.name,
        age: updates.age !== undefined ? updates.age : p.age,
        gender: newGender,
        gradeLevel: updates.gradeLevel !== undefined ? updates.gradeLevel : p.gradeLevel ?? 'segundo_grado',
        avatar: updatedAvatar,
      };
    }
    return p;
  });

  const activeProf = updatedProfiles.find((p) => p.id === state.activeUserId) || state.profile;

  const newState: AppState = {
    ...state,
    profiles: updatedProfiles,
    profile: activeProf,
  };
  saveAppState(newState);
  return newState;
}

export function updateCharacterName(state: AppState, newName: string, targetUserId?: string): AppState {
  const targetId = targetUserId || state.activeUserId;
  return updateUserProfile(state, targetId, { name: newName });
}

export function deleteUserProfile(state: AppState, userIdToDelete: string): AppState {
  // Prevent deleting if only 1 profile exists
  if (state.profiles.length <= 1) {
    return state;
  }

  const remainingProfiles = state.profiles.filter((p) => p.id !== userIdToDelete);
  const remainingTasks = state.tasks.filter((t) => t.userId !== userIdToDelete);

  let newActiveUserId = state.activeUserId;
  let newActiveProfile = state.profile;

  if (state.activeUserId === userIdToDelete) {
    newActiveUserId = remainingProfiles[0].id;
    newActiveProfile = remainingProfiles[0];
  }

  const newState: AppState = {
    ...state,
    profiles: remainingProfiles,
    activeUserId: newActiveUserId,
    profile: newActiveProfile,
    tasks: remainingTasks,
  };
  saveAppState(newState);
  return newState;
}

export function updateScoringConfig(state: AppState, scoring: Partial<ScoringConfig>): AppState {
  const newScoring: ScoringConfig = {
    ...state.settings.scoring,
    ...scoring,
  };

  const newState: AppState = {
    ...state,
    settings: {
      ...state.settings,
      scoring: newScoring,
    },
  };
  saveAppState(newState);
  return newState;
}

export function updateTheme(state: AppState, theme: 'dark' | 'light' | 'semi'): AppState {
  const newState: AppState = { ...state, settings: { ...state.settings, theme } };
  saveAppState(newState);
  return newState;
}

export function updateHabitBoardSize(state: AppState, width: number, height: number): AppState {
  const w = Math.max(80, Math.min(260, Math.round(width)));
  const h = Math.max(40, Math.min(160, Math.round(height)));
  const newState: AppState = { ...state, settings: { ...state.settings, habitBoardWidth: w, habitBoardHeight: h } };
  saveAppState(newState);
  return newState;
}

export function updatePomodoroMinutes(state: AppState, userId: string, minutes: number): AppState {
  const m = Math.max(5, Math.min(60, Math.round(minutes)));
  const updatedProfiles = state.profiles.map((p) => (p.id === userId ? { ...p, pomodoroMinutes: m } : p));
  const activeProf = updatedProfiles.find((p) => p.id === state.activeUserId) || state.profile;
  const newState: AppState = { ...state, profiles: updatedProfiles, profile: { ...activeProf, pomodoroMinutes: activeProf.pomodoroMinutes ?? m } };
  saveAppState(newState);
  return newState;
}

export function updatePromises(state: AppState, promises: string[]): AppState {
  const cleaned = promises.map((s) => s.trim()).filter((s) => s.length > 0);
  const newState: AppState = { ...state, promises: cleaned };
  saveAppState(newState);
  return newState;
}

export function incrementPlayStats(state: AppState, totalInc: number = 0, activeInc: number = 0): AppState {
  const cur = state.playStats || { totalMinutes: 0, activeMinutes: 0 };
  const newState: AppState = { ...state, playStats: { totalMinutes: cur.totalMinutes + totalInc, activeMinutes: cur.activeMinutes + activeInc, lastSessionAt: new Date().toISOString() } };
  saveAppState(newState);
  return newState;
}

export function updateSoundVolume(
  state: AppState,
  sfxVolume: number,
  musicVolume?: number,
  sfxEnabled?: boolean,
  musicEnabled?: boolean
): AppState {
  const clampedSfx = Math.max(0, Math.min(100, Math.round(sfxVolume)));
  const clampedMusic =
    musicVolume !== undefined
      ? Math.max(0, Math.min(100, Math.round(musicVolume)))
      : (state.settings.musicVolume ?? 70);

  const newState: AppState = {
    ...state,
    settings: {
      ...state.settings,
      soundVolume: clampedSfx,
      musicVolume: clampedMusic,
      soundEnabled: sfxEnabled !== undefined ? sfxEnabled : state.settings.soundEnabled,
      musicEnabled: musicEnabled !== undefined ? musicEnabled : state.settings.musicEnabled,
    },
  };
  saveAppState(newState);
  return newState;
}

export function updateMusicMode(state: AppState, mode: 'procedural' | 'midi'): AppState {
  const newState: AppState = {
    ...state,
    settings: { ...state.settings, musicMode: mode },
  };
  saveAppState(newState);
  return newState;
}

// Helper methods for business logic
export function submitTaskCompletion(state: AppState, taskId: string): AppState {
  const updatedTasks: Task[] = state.tasks.map((t) => {
    if (t.id === taskId) {
      // If auto-approve is active, immediately mark approved, else submitted
      const newStatus: TaskStatus = state.settings.autoApproveInChildMode ? 'approved' : 'submitted';
      return {
        ...t,
        status: newStatus,
        submittedAt: new Date().toISOString(),
        approvedAt: newStatus === 'approved' ? new Date().toISOString() : undefined,
      };
    }
    return t;
  });

  const task = state.tasks.find((t) => t.id === taskId);
  let updatedProfile = { ...state.profile };

  if (state.settings.autoApproveInChildMode && task) {
    updatedProfile = applyTaskRewards(updatedProfile, task);
  }

  const newState: AppState = {
    ...state,
    tasks: updatedTasks,
    profile: updatedProfile,
  };
  saveAppState(newState);
  return newState;
}

export function approveTasks(state: AppState, taskIds: string[]): AppState {
  let updatedProfile = { ...state.profile };
  const updatedTasks = state.tasks.map((t) => {
    if (taskIds.includes(t.id) && t.status !== 'approved') {
      updatedProfile = applyTaskRewards(updatedProfile, t);
      return {
        ...t,
        status: 'approved' as const,
        approvedAt: new Date().toISOString(),
      };
    }
    return t;
  });

  const newState: AppState = {
    ...state,
    tasks: updatedTasks,
    profile: updatedProfile,
  };
  saveAppState(newState);
  return newState;
}

export function rejectTask(state: AppState, taskId: string): AppState {
  const updatedTasks = state.tasks.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: 'pending' as const,
        submittedAt: undefined,
      };
    }
    return t;
  });
  const newState = { ...state, tasks: updatedTasks };
  saveAppState(newState);
  return newState;
}

export function deleteTask(state: AppState, taskId: string): AppState {
  const updatedTasks = state.tasks.filter((t) => t.id !== taskId);
  const newState = { ...state, tasks: updatedTasks };
  saveAppState(newState);
  return newState;
}

export function applyTaskRewards(profile: ChildProfile, task: Task): ChildProfile {
  let wisdomGain = 0;
  let lifeGain = 0;
  let coinGain = Math.max(2, Math.floor(task.points / 2));
  let kmGain = 1; // 1 KM per completed school task

  if (task.type === 'sabiduria') {
    wisdomGain = task.points;
  } else {
    lifeGain = task.points;
    kmGain = 0.5;
  }

  const newWisdom = profile.wisdomPoints + wisdomGain;
  const newLife = profile.lifePoints + lifeGain;
  const newCoins = profile.coins + coinGain;
  const newKm = Math.min(365, Number((profile.kmGanados + kmGain).toFixed(1)));
  const totalXp = newWisdom + newLife;
  const newLevel = Math.floor(totalXp / 50) + 1;

  return {
    ...profile,
    wisdomPoints: newWisdom,
    lifePoints: newLife,
    coins: newCoins,
    kmGanados: newKm,
    level: newLevel,
  };
}

export function executeWeekPass(state: AppState): AppState {
  // Move pending tasks in current week to expired with degraded points
  const updatedTasks = state.tasks.map((t) => {
    if (t.status === 'pending') {
      const daysOver = (t.daysOverdue || 0) + 7;
      const penaltyPercent = Math.min(60, daysOver * (state.settings.degradationRatePerDay / 7));
      const original = t.originalPoints || t.points;
      const degradedPoints = Math.max(2, Math.round(original * (1 - penaltyPercent / 100)));
      return {
        ...t,
        status: 'expired' as const,
        daysOverdue: daysOver,
        originalPoints: original,
        points: degradedPoints,
      };
    }
    return t;
  });

  const newState = { ...state, tasks: updatedTasks };
  saveAppState(newState);
  return newState;
}

export function rescueExpiredTask(state: AppState, taskId: string): AppState {
  const updatedTasks = state.tasks.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: 'pending' as const,
        points: t.originalPoints || t.points,
        daysOverdue: 0,
      };
    }
    return t;
  });
  const newState = { ...state, tasks: updatedTasks };
  saveAppState(newState);
  return newState;
}

export function toggleCityUnlock(state: AppState, materiaId: string, cityNumber: number): AppState {
  const currentMax = state.profile.unlockedCities[materiaId] || 1;
  const newMax = currentMax >= cityNumber ? cityNumber - 1 : cityNumber;
  const clamped = Math.max(1, Math.min(4, newMax));

  const updatedProfile: ChildProfile = {
    ...state.profile,
    unlockedCities: {
      ...state.profile.unlockedCities,
      [materiaId]: clamped,
    },
  };
  const newState = { ...state, profile: updatedProfile };
  saveAppState(newState);
  return newState;
}

export function unlockAllCities(state: AppState): AppState {
  const unlocked: Record<string, number> = {};
  MATERIAS.forEach((m) => {
    unlocked[m.id] = 4;
  });
  const updatedProfile = { ...state.profile, unlockedCities: unlocked };
  const newState = { ...state, profile: updatedProfile };
  saveAppState(newState);
  return newState;
}

// Structured bulk task importer (Materia -> Bimestre -> Semana -> Modo General / Guia)
export function importTasksStructured(
  state: AppState,
  options: {
    materiaId: string;
    bimestre: number;
    semana: number;
    mode: 'general' | 'guide';
    text: string;
  }
): { newState: AppState; importedCount: number } {
  const lines = options.text.split('\n');
  const newTasks: Task[] = [];
  const defaultSimplePts = state.settings.scoring?.simpleTaskPoints ?? 10;
  const defaultGuidePts = state.settings.scoring?.guideCompletePoints ?? 30;

  lines.forEach((rawLine, idx) => {
    let line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) return;

    // Clean index prefixes like "1. ", "2) ", "a. ", "b) ", "- "
    line = line.replace(/^([0-9]+|[a-zA-Z]+)[\.\)\-\:]\s*/, '').trim();
    if (!line) return;

    if (options.mode === 'general') {
      const isGuide = /gu[ií]a/i.test(line);
      let title = line;
      let points = defaultSimplePts;
      let isGuideComplete = false;

      if (isGuide) {
        isGuideComplete = true;
        points = defaultGuidePts;
        if (!/^GUIA TERMINADA:/i.test(title)) {
          title = `GUIA TERMINADA: ${title}`;
        }
      }

      newTasks.push({
        id: `task-imported-${Date.now()}-${idx}-${state.activeUserId}`,
        userId: state.activeUserId,
        materiaId: options.materiaId,
        bimestre: options.bimestre,
        semana: options.semana,
        title,
        points,
        type: 'sabiduria',
        status: 'pending',
        isGuideComplete,
        createdAt: new Date().toISOString(),
      });
    } else {
      // mode === 'guide' (Sub-actividades u hojas de la guía)
      // Extract custom points if line contains "| 5 Pts", "| 10", "[25 pts]", etc.
      let points = 10;
      let cleanTitle = line;

      const pipeMatch = line.match(/\|\s*(\d+)\s*(pts|puntos)?/i);
      const bracketMatch = line.match(/\[\s*(\d+)\s*(pts|puntos)?\s*\]/i);
      const parenMatch = line.match(/\(\s*(\d+)\s*(pts|puntos)\s*\)/i);

      if (pipeMatch) {
        points = parseInt(pipeMatch[1], 10) || 10;
        cleanTitle = line.replace(pipeMatch[0], '').trim();
      } else if (bracketMatch) {
        points = parseInt(bracketMatch[1], 10) || 10;
        cleanTitle = line.replace(bracketMatch[0], '').trim();
      } else if (parenMatch) {
        points = parseInt(parenMatch[1], 10) || 10;
        cleanTitle = line.replace(parenMatch[0], '').trim();
      }

      newTasks.push({
        id: `task-guide-sub-${Date.now()}-${idx}-${state.activeUserId}`,
        userId: state.activeUserId,
        materiaId: options.materiaId,
        bimestre: options.bimestre,
        semana: options.semana,
        title: cleanTitle,
        points,
        type: 'sabiduria',
        status: 'pending',
        isGuideSubtask: true,
        createdAt: new Date().toISOString(),
      });
    }
  });

  const updatedTasks = [...state.tasks, ...newTasks];
  const newState = { ...state, tasks: updatedTasks };
  saveAppState(newState);
  return { newState, importedCount: newTasks.length };
}

// Fallback legacy bulk text importer for backwards compatibility
export function parseAndImportTasksFromText(state: AppState, text: string): { newState: AppState; importedCount: number } {
  return importTasksStructured(state, {
    materiaId: state.currentMateria || 'matematicas',
    bimestre: state.currentCity || 1,
    semana: state.currentHouse || 1,
    mode: 'general',
    text,
  });
}

export function updateUserPoints(
  state: AppState,
  targetUserId: string,
  updates: {
    kmGanados?: number;
    wisdomPoints?: number;
    lifePoints?: number;
    coins?: number;
  }
): AppState {
  const updatedProfiles = state.profiles.map((p) => {
    if (p.id === targetUserId) {
      return {
        ...p,
        kmGanados: updates.kmGanados !== undefined ? Math.max(0, Math.min(365, updates.kmGanados)) : p.kmGanados,
        wisdomPoints: updates.wisdomPoints !== undefined ? Math.max(0, updates.wisdomPoints) : p.wisdomPoints,
        lifePoints: updates.lifePoints !== undefined ? Math.max(0, updates.lifePoints) : p.lifePoints,
        coins: updates.coins !== undefined ? Math.max(0, updates.coins) : p.coins,
      };
    }
    return p;
  });

  const activeProf = updatedProfiles.find((p) => p.id === state.activeUserId) || state.profile;

  const newState: AppState = {
    ...state,
    profiles: updatedProfiles,
    profile: activeProf,
  };
  saveAppState(newState);
  return newState;
}

function isRedemptionAllowed(state: AppState, item: StoreItem, userId: string): { allowed: boolean; reason?: string } {
  if (!item.redeemLimit || !item.redeemPeriod || item.redeemPeriod === 'unlimited' || item.redeemLimit <= 0) return { allowed: true };
  const now = new Date();
  const reds = (state.rewardRedemptions || []).filter((r) => r.storeItemId === item.id && r.userId === userId);
  let count = 0;
  if (item.redeemPeriod === 'per_week') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    count = reds.filter((r) => new Date(r.redeemedAt) >= weekStart).length;
  } else if (item.redeemPeriod === 'per_month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    count = reds.filter((r) => new Date(r.redeemedAt) >= monthStart).length;
  }
  if (count >= item.redeemLimit) {
    return { allowed: false, reason: 'L�mite alcanzado: ' + item.redeemLimit + ' por ' + (item.redeemPeriod === 'per_week' ? 'semana' : 'mes') };
  }
  return { allowed: true };
}

export function canRedeemReward(state: AppState, itemId: string, userId?: string): { allowed: boolean; reason?: string } {
  const uid = userId || state.activeUserId;
  const item = state.storeItems.find((s) => s.id === itemId);
  if (!item) return { allowed: false, reason: 'Premio no encontrado' };
  return isRedemptionAllowed(state, item, uid);
}

export function redeemReward(state: AppState, itemId: string): { newState: AppState; ok: boolean; reason?: string } {
  const item = state.storeItems.find((s) => s.id === itemId);
  if (!item) return { newState: state, ok: false, reason: 'Premio no encontrado' };
  const check = isRedemptionAllowed(state, item, state.activeUserId);
  if (!check.allowed) return { newState: state, ok: false, reason: check.reason };
  const redemption = { storeItemId: itemId, userId: state.activeUserId, redeemedAt: new Date().toISOString() };
  let avatarActives: AvatarActive[] = state.avatarActives || [];
  if (item.type === 'avatar' && item.itemKey) {
    const isPermanent = !item.avatarDuration || item.avatarDuration === 'permanent';
    const expiresAt = !isPermanent && item.avatarDurationDays ? new Date(Date.now() + item.avatarDurationDays * 86400000).toISOString() : undefined;
    avatarActives = avatarActives.filter((a) => !(a.userId === state.activeUserId && a.itemKey === item.itemKey));
    avatarActives.push({ userId: state.activeUserId, itemKey: item.itemKey, activatedAt: new Date().toISOString(), expiresAt });
  }
  const newState: AppState = { ...state, rewardRedemptions: [...(state.rewardRedemptions || []), redemption], avatarActives };
  saveAppState(newState);
  return { newState, ok: true };
}

// --- Medallas ---
export function isMedalEarned(state: AppState, def: MedalDefinition, userId?: string): boolean {
  const uid = userId || state.activeUserId;
  const override = (state.manualMedalOverrides || []).find(o => o.userId===uid && o.medalId===def.id);
  if (override) return override.active;
  if (!def.enabled) return false;
  const tasks = (state.tasks || []).filter(t => !t.userId || t.userId===uid);
  const isApproved = (t: any) => t.status==='approved';
  switch(def.criteriaType){
    case 'manual': return false;
    case 'daily_activities': {
      const thr = def.criteriaParams?.threshold ?? 5;
      const byDay = new Map<string, number>();
      for(const t of tasks) if(isApproved(t) && t.approvedAt){ const d=t.approvedAt.slice(0,10); byDay.set(d,(byDay.get(d)||0)+1); }
      for(const c of byDay.values()) if(c>=thr) return true;
      return false;
    }
    case 'week_complete': {
      const s=def.criteriaParams?.semana ?? 1; const b=def.criteriaParams?.bimestre ?? 1;
      const weekTasks = tasks.filter(t=> t.bimestre===b && t.semana===s && (def.materiaId ? t.materiaId===def.materiaId : true));
      if(weekTasks.length===0) return false;
      return weekTasks.every(isApproved);
    }
    case 'week_complete_ontime': {
      const s=def.criteriaParams?.semana ?? 1; const b=def.criteriaParams?.bimestre ?? 1;
      const weekTasks = tasks.filter(t=> t.bimestre===b && t.semana===s && (def.materiaId ? t.materiaId===def.materiaId : true));
      if(weekTasks.length===0) return false;
      return weekTasks.every(t=> isApproved(t) && !t.daysOverdue);
    }
    case 'bimestre_complete': {
      const b=def.criteriaParams?.bimestre ?? 1;
      const bimTasks = tasks.filter(t=> t.bimestre===b && (def.materiaId ? t.materiaId===def.materiaId : true));
      if(bimTasks.length===0) return false;
      return bimTasks.every(isApproved);
    }
    default: return false;
  }
}

export function toggleMedalEnabled(state: AppState, medalId: string): AppState {
  const defs = state.medalDefinitions.map(d=> d.id===medalId ? {...d, enabled: !d.enabled} : d);
  const ns={...state, medalDefinitions: defs}; saveAppState(ns); return ns;
}

export function upsertMedalDefinition(state: AppState, def: MedalDefinition): AppState {
  const exists = state.medalDefinitions.find(d=> d.id===def.id);
  const defs = exists ? state.medalDefinitions.map(d=> d.id===def.id ? def : d) : [...state.medalDefinitions, def];
  const ns={...state, medalDefinitions: defs}; saveAppState(ns); return ns;
}

export function deleteMedalDefinition(state: AppState, medalId: string): AppState {
  const defs = state.medalDefinitions.filter(d=> d.id!==medalId);
  const overrides = (state.manualMedalOverrides||[]).filter(o=> o.medalId!==medalId);
  const ns={...state, medalDefinitions: defs, manualMedalOverrides: overrides}; saveAppState(ns); return ns;
}

export function setManualMedalActive(state: AppState, medalId: string, userId: string, active: boolean): AppState {
  const overrides = (state.manualMedalOverrides||[]).filter(o=> !(o.userId===userId && o.medalId===medalId));
  overrides.push({ userId, medalId, active, updatedAt: new Date().toISOString() });
  const ns={...state, manualMedalOverrides: overrides}; saveAppState(ns); return ns;
}
export function getHabitCompliance(state: AppState, habitId: string, userId?: string): number {
  const uid = userId || state.activeUserId;
  const logs = (state.habitLogs || []).filter(l => l.habitId===habitId && l.userId===uid);
  if (logs.length===0) return 0;
  const total = logs.length;
  // Solo cuenta como cumplido si está completado y aprobado (evita 100% con pendiente)
  const completed = logs.filter(l=>l.completed && l.approved).length;
  return Math.round((completed/total)*100);
}

export function toggleHabitToday(state: AppState, habitId: string): AppState {
  const uid = state.activeUserId;
  const today = new Date().toISOString().slice(0,10);
  const existingIdx = (state.habitLogs || []).findIndex(l => l.habitId===habitId && l.userId===uid && l.date===today);
  let logs = [...(state.habitLogs||[])];
  const habit = state.habitDefinitions.find(h=>h.id===habitId);
  if (!habit) return state;
  if (existingIdx>=0) {
    const cur = logs[existingIdx];
    const newCompleted = !cur.completed;
    logs[existingIdx] = { ...cur, completed: newCompleted, approved: newCompleted ? false : undefined, approvedAt: undefined };
  } else {
    logs.push({ habitId, userId: uid, date: today, completed: true, approved: false, createdAt: new Date().toISOString() });
  }
  // No otorga puntos aquí: queda pendiente de aprobación en APROBACIONES (niño tilda como lista, adulto confirma)
  const newState: AppState = { ...state, habitLogs: logs };
  saveAppState(newState);
  return newState;
}

export function upsertHabitDefinition(state: AppState, def: HabitDefinition): AppState {
  const exists = state.habitDefinitions.find(d=>d.id===def.id);
  const defs = exists ? state.habitDefinitions.map(d=> d.id===def.id ? def : d) : [...state.habitDefinitions, def];
  const ns={...state, habitDefinitions: defs}; saveAppState(ns); return ns;
}

export function deleteHabitDefinition(state: AppState, habitId: string): AppState {
  const defs = state.habitDefinitions.filter(d=> d.id!==habitId);
  const logs = (state.habitLogs||[]).filter(l=> l.habitId!==habitId);
  const ns={...state, habitDefinitions: defs, habitLogs: logs}; saveAppState(ns); return ns;
}

export function approveHabit(state: AppState, habitId: string, date?: string): AppState {
  const uid = state.activeUserId;
  const targetDate = date || new Date().toISOString().slice(0,10);
  const idx = (state.habitLogs||[]).findIndex(l=> l.habitId===habitId && l.userId===uid && l.date===targetDate);
  if (idx<0) return state;
  const log = state.habitLogs[idx];
  if (log.approved) return state;
  const habit = state.habitDefinitions.find(h=>h.id===habitId);
  const logs = [...state.habitLogs];
  logs[idx] = { ...log, approved: true, approvedAt: new Date().toISOString() };
  let profile = state.profile;
  if (habit) profile = { ...profile, lifePoints: profile.lifePoints + (habit.points||5) };
  const newState: AppState = { ...state, habitLogs: logs, profile };
  saveAppState(newState);
  return newState;
}

export function rejectHabit(state: AppState, habitId: string, date?: string): AppState {
  const uid = state.activeUserId;
  const targetDate = date || new Date().toISOString().slice(0,10);
  const idx = (state.habitLogs||[]).findIndex(l=> l.habitId===habitId && l.userId===uid && l.date===targetDate);
  if (idx<0) return state;
  const logs = [...state.habitLogs];
  logs[idx] = { ...logs[idx], completed: false, approved: false, approvedAt: undefined };
  const newState: AppState = { ...state, habitLogs: logs };
  saveAppState(newState);
  return newState;
}

export function canRedeemHabitReward(state: AppState, item: StoreItem, userId?: string): { allowed: boolean; reason?: string } {
  const req = item.requiredDays ?? 0;
  if (!req || req <= 0) return { allowed: true };
  const uid = userId || state.activeUserId;
  const logs = (state.habitLogs || []).filter((l) => l.userId === uid && l.completed);
  const hasForDate = (ls: HabitLog[], ds: string) => ls.some((l) => l.date === ds);
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (hasForDate(logs, ds)) streak++;
    else break;
  }
  if (streak < req) return { allowed: false, reason: `Necesitás ${req} días seguidos (llevás ${streak})` };
  return { allowed: true };
}
