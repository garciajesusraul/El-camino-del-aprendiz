export type SceneType = 'HOUSE' | 'PLAZA' | 'MATERIA_MAP' | 'CITY_MAP' | 'MISSION_MODAL';

export type TaskType = 'sabiduria' | 'vida';

export type TaskStatus = 'pending' | 'submitted' | 'approved' | 'expired';

export type GenderType = 'boy' | 'girl';

export type GradeLevelType =
  | 'kinder'
  | 'primer_grado'
  | 'segundo_grado'
  | 'tercer_grado'
  | 'cuarto_grado'
  | 'quinto_grado'
  | 'sexto_grado';

export interface Task {
  id: string;
  userId?: string; // tie task to specific child/user profile
  materiaId: string; // 'ciencias' | 'ingles' | 'historia' | 'lenguaje' | 'luces' | 'matematicas' | 'sonidos' | 'kinder_actividades'
  bimestre: number; // 1 to 4
  semana: number; // 1 to 8
  title: string;
  description?: string;
  type: TaskType; // 'sabiduria' (celeste) | 'vida' (verde)
  points: number;
  status: TaskStatus;
  isDailyHabit?: boolean;
  isGuideComplete?: boolean; // Tarea principal de guía completa
  isGuideSubtask?: boolean; // Tarea individual de una hoja/actividad de la guía
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  daysOverdue?: number;
  originalPoints?: number;
}

export interface MateriaInfo {
  id: string;
  name: string;
  shortName: string;
  iconName: string;
  color: string;
  darkColor: string;
  lightColor: string;
  bgGradient: string;
  description: string;
  pathY: number; // Y position in Plaza Central fallback
  angleDeg: number; // Radial angle in Plaza from central circle
  portalX: number; // Plaza Portal X
  portalY: number; // Plaza Portal Y
}

export interface ChildProfile {
  id: string;
  name: string;
  role: 'child' | 'admin';
  age: number;
  gender?: GenderType; // 'boy' | 'girl'
  gradeLevel?: GradeLevelType; // 'kinder' | 'primer_grado' | ...
  kmGanados: number;
  kmReales: number;
  startKm: number;
  wisdomPoints: number; // Puntos Celestes
  lifePoints: number; // Puntos Verdes
  coins: number;
  level: number;
  currentStreak: number;
  unlockedCities: Record<string, number>; // materiaId -> max unlocked city (1-4)
  unlockedHouses: Record<string, Record<number, number>>; // materiaId -> bimestre -> max unlocked house (1-8)
  avatar: {
    skinTone: string;
    hairColor: string;
    hairStyle: 'classic' | 'spiky' | 'long' | 'cap' | 'curly' | 'prota';
    outfitColor: string;
    pantsColor: string;
    skirtColor?: string;
    accessory: 'none' | 'backpack' | 'glasses' | 'medal' | 'cape' | 'lantern';
  };
  inventory: string[];
  pomodoroMinutes?: number; // minutos por defecto 20, configurable por niño
}

export type RedemptionPeriod = 'unlimited' | 'per_week' | 'per_month';
export type AvatarDuration = 'permanent' | 'limited_days';

export interface StoreItem {
  id: string;
  title: string;
  type: 'avatar' | 'real_life';
  costType: 'sabiduria' | 'vida' | 'coins';
  cost: number;
  icon: string;
  description: string;
  purchased: boolean;
  itemKey?: string;
  // Límites configurables desde Modo Padre
  redeemLimit?: number; // ej 1
  redeemPeriod?: RedemptionPeriod; // 'per_week' | 'per_month' | 'unlimited'
  // Solo avatar: duración limitada
  avatarDuration?: AvatarDuration; // 'permanent' | 'limited_days'
  avatarDurationDays?: number; // ej 7, 14, 30
  // Avatar por sexo y premio con racha
  gender?: 'boy' | 'girl' | 'unisex';
  requiredDays?: number; // 0 = sin límite, ej 7 días seguidos para habilitar canje
}

export interface RewardRedemption {
  storeItemId: string;
  userId: string;
  redeemedAt: string; // ISO
}

export interface AvatarActive {
  userId: string;
  itemKey: string;
  activatedAt: string;
  expiresAt?: string; // si es limited_days
}

export interface ScoringConfig {
  simpleTaskPoints: number; // Por actividad (simple) terminada: 10 pts
  guideCompletePoints: number; // Puntos por "GUIA COMPLETA": 30 pts
  weekCompleteBonus: number; // Por completar una semana: 50 pts
  week1AllSubjectsBonus: number; // Por completar todas las "semanas 1" de un bimestre: 150 pts
  week2AllSubjectsBonus: number; // Por completar todas las "semanas 2" de un bimestre: 150 pts
  week3AllSubjectsBonus: number; // Por completar todas las "semanas 3" de un bimestre: 150 pts
  week4AllSubjectsBonus: number; // Por completar todas las "semanas 4" de un bimestre: 150 pts
  bimesterSubjectBonus: number; // Por completar un bimestre de una materia: 300 pts
}

export type AppTheme = 'dark' | 'light' | 'semi';
export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number; // 0 to 100 (Efectos SFX)
  musicEnabled: boolean;
  musicVolume: number; // 0 to 100 (Música de fondo BGM)
  musicMode: 'procedural' | 'midi'; // computadora vs MIDI
  season: 'auto' | 'verano' | 'otono' | 'invierno' | 'primavera';
  degradationRatePerDay: number; // percentage loss per day late (e.g. 10%)
  parentPin: string; // "2026"
  autoApproveInChildMode: boolean;
  scoring: ScoringConfig;
  theme: AppTheme;
  habitBoardWidth: number;
  habitBoardHeight: number;
  virtualJoystickEnabled: boolean;
}

export type MedalCriteriaType = 'daily_activities' | 'week_complete' | 'week_complete_ontime' | 'bimestre_complete' | 'manual';

export interface MedalDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  materiaId: string | null; // null = general, o id materia
  criteriaType: MedalCriteriaType;
  criteriaParams?: { threshold?: number; semana?: number; bimestre?: number };
  enabled: boolean;
}

export interface ManualMedalOverride {
  userId: string;
  medalId: string;
  active: boolean; // fuerza activo/inactivo aunque auto diga lo contrario
  updatedAt: string;
}

export type HabitGoalType = 'daily' | 'weekly' | 'monthly';

export interface HabitDefinition {
  id: string;
  title: string;
  description?: string;
  icon: string;
  points: number; // puntos vida por cumplir
  goalType: HabitGoalType;
  goalCount: number; // veces por periodo: daily 1, weekly 3, monthly 10 etc
  enabled: boolean;
}

export interface HabitLog {
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
  approved?: boolean;
  approvedAt?: string;
}

export interface PlayStats {
  totalMinutes: number;
  activeMinutes: number;
  lastSessionAt?: string;
}

export interface AppState {
  profile: ChildProfile;
  profiles: ChildProfile[];
  activeUserId: string;
  tasks: Task[];
  storeItems: StoreItem[];
  rewardRedemptions: RewardRedemption[];
  avatarActives: AvatarActive[];
  medalDefinitions: MedalDefinition[];
  manualMedalOverrides: ManualMedalOverride[];
  habitDefinitions: HabitDefinition[];
  habitLogs: HabitLog[];
  playStats: PlayStats;
  promises: string[];
  settings: GameSettings;
  currentMateria: string | null;
  currentCity: number; // 1 to 4
  currentHouse: number; // 1 to 8
  currentScene: SceneType;
  selectedTaskFilter: 'all' | 'escuela' | 'habitos' | 'vencidas';
}
