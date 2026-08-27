import React, { useState } from 'react';
import { AppState, SceneType } from '../types';
import { MATERIAS, BIMESTRES_INFO } from '../data/constants';
import { sound } from '../services/audio';
import { PixelAvatar } from './PixelAvatar';
import {
  Compass,
  Sparkles,
  Heart,
  Coins,
  Shield,
  ShoppingBag,
  BookOpen,
  Home,
  Flame,
  Volume2,
  VolumeX,
  Music,
  Music2,
  User,
  Star,
} from 'lucide-react';

interface HeaderHUDProps {
  state: AppState;
  onSceneChange: (scene: SceneType) => void;
  onOpenStore: () => void;
  onOpenNotebook: () => void;
  onOpenAdmin: () => void;
  onOpenDailyPoints?: () => void;
  onUpdateVolume?: (sfxVolume: number, musicVolume?: number) => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  state,
  onSceneChange,
  onOpenStore,
  onOpenNotebook,
  onOpenAdmin,
  onOpenDailyPoints,
  onUpdateVolume,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const { profile } = state;
  const currentMateriaObj = MATERIAS.find((m) => m.id === state.currentMateria);
  const currentBimestreObj = BIMESTRES_INFO[state.currentCity - 1];

  const getBreadcrumb = () => {
    if (state.currentScene === 'HOUSE') return '🏠 En tu Casa (Inicio del Día)';
    if (state.currentScene === 'PLAZA') return '⛲ Plaza Central';
    if (state.currentScene === 'MATERIA_MAP')
      return `🧭 ${currentMateriaObj?.name || 'Materia'} • Camino de 4 Ciudades`;
    if (state.currentScene === 'CITY_MAP')
      return `🏛️ ${currentMateriaObj?.shortName || ''} • ${currentBimestreObj?.name} • 8 Semanas`;
    return '🗺️ Mapa Pedagógico';
  };

  const kmProgressPercent = Math.min(100, (profile.kmGanados / 365) * 100);
  const kmDifference = Number((profile.kmGanados - profile.kmReales).toFixed(1));

  const activeUserIndex = state.profiles ? state.profiles.findIndex((p) => p.id === state.activeUserId) : 0;
  const activeUserNum = activeUserIndex >= 0 ? activeUserIndex + 1 : 1;

  const sfxVolume = state.settings?.soundVolume ?? 80;
  const musicVolume = state.settings?.musicVolume ?? 50;
  const sfxEnabled = state.settings?.soundEnabled !== false;
  const musicEnabled = state.settings?.musicEnabled !== false;
  const isMuted = !sfxEnabled && !musicEnabled;

  const handleSfxVolumeChange = (newVal: number) => {
    sound.setSfxVolume(newVal);
    if (onUpdateVolume) onUpdateVolume(newVal, musicVolume);
  };

  const handleMusicVolumeChange = (newVal: number) => {
    sound.setMusicVolume(newVal);
    if (onUpdateVolume) onUpdateVolume(sfxVolume, newVal);
  };

  const gradeLevelDisplay =
    profile.gradeLevel === 'kinder'
      ? 'Kinder'
      : profile.gradeLevel === 'primer_grado'
      ? '1° Grado'
      : profile.gradeLevel === 'segundo_grado'
      ? '2° Grado'
      : profile.gradeLevel === 'tercer_grado'
      ? '3° Grado'
      : profile.gradeLevel === 'cuarto_grado'
      ? '4° Grado'
      : profile.gradeLevel === 'quinto_grado'
      ? '5° Grado'
      : profile.gradeLevel === 'sexto_grado'
      ? '6° Grado'
      : 'Estudiante';

  return (
    <>
      {/* Top Left: Menu Button & Compact Active Student Badge */}
      <div className="absolute top-3 left-3 z-40 select-none flex items-center gap-2">
        {/* 1. Main Menu Dropdown Button */}
        <div className="relative">
          <button
            id="hud-dropdown-trigger"
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border-2 border-amber-500/90 shadow-2xl flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-95 group relative ring-2 ring-amber-500/30 hover:ring-amber-400 cursor-pointer"
            title="Abrir Menú Principal, Opciones y Estadísticas"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center shadow-inner border border-amber-300 transform group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-slate-950" />
            </div>

            {/* Mini Level Badge in corner */}
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full border border-amber-200 shadow-sm leading-tight">
              N{profile.level || 1}
            </span>
          </button>

          {/* Expanded Dropdown Panel */}
          {isOpen && (
            <>
              {/* Backdrop to dismiss on click outside */}
              <div
                className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs"
                onClick={() => setIsOpen(false)}
              />

              <div
                id="hud-dropdown-panel"
                className="relative z-40 mt-2 w-[320px] sm:w-[360px] bg-slate-950/95 border-2 border-amber-500/90 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl text-white animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* Header & Location */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Ubicación Actual
                    </span>
                    <p className="text-xs font-semibold text-slate-200">{getBreadcrumb()}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-900/80 text-purple-200 border border-purple-500/50 font-black">
                    {profile.name}
                  </span>
                </div>

                {/* KM Progress Bar (0 to 365 KM) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 mb-3">
                  <div className="flex justify-between items-center text-xs mb-1 font-bold">
                    <span className="text-amber-300 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" /> KM Ganados: {profile.kmGanados} km
                    </span>
                    <span className="text-slate-400">Objetivo: 365 km</span>
                  </div>

                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 relative">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${kmProgressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
                    <span>KM Reales (Días del año): {profile.kmReales} km</span>
                    <span
                      className={`font-bold ${
                        kmDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {kmDifference >= 0 ? `+${kmDifference} km adelanto` : `${kmDifference} km retraso`}
                    </span>
                  </div>
                </div>

                {/* Stats Badges */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center">
                    <span className="text-[10px] text-cyan-400 font-bold flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" /> Sabiduría
                    </span>
                    <p className="text-sm font-black text-white">{profile.wisdomPoints || 0}</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center">
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <Heart className="w-3 h-3" /> Vida
                    </span>
                    <p className="text-sm font-black text-white">{profile.lifePoints || 0}</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center">
                    <span className="text-[10px] text-amber-400 font-bold flex items-center justify-center gap-1">
                      <Coins className="w-3 h-3" /> Monedas
                    </span>
                    <p className="text-sm font-black text-white">{profile.coins || 0}</p>
                  </div>
                </div>

                {/* Puntos del Día Button (Child visible) */}
                {onOpenDailyPoints && (
                  <div className="mb-2">
                    <button
                      id="hud-btn-daily-points"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenDailyPoints();
                      }}
                      className="w-full px-3 py-2.5 bg-gradient-to-r from-amber-950/80 to-orange-950/80 hover:from-amber-900/80 hover:to-orange-900/80 text-amber-200 rounded-xl text-xs font-bold flex items-center justify-between border border-amber-500/50 shadow transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span>⭐ Mis Puntos del Día</span>
                      </div>
                      <span className="text-[10px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-700/50">Ver resumen</span>
                    </button>
                  </div>
                )}

                {/* Quick Action Navigation Buttons */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      id="hud-btn-house"
                      onClick={() => {
                        setIsOpen(false);
                        onSceneChange('HOUSE');
                      }}
                      className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ir a Casa</span>
                    </button>

                    <button
                      id="hud-btn-plaza"
                      onClick={() => {
                        setIsOpen(false);
                        onSceneChange('PLAZA');
                      }}
                      className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ir a Plaza</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      id="hud-btn-admin"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full px-3 py-2.5 bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 text-purple-200 rounded-xl text-xs font-bold flex items-center justify-between border border-purple-600/60 shadow transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span>Modo Padre / Opciones</span>
                      </div>
                      <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded font-mono">[P]</span>
                    </button>
                  </div>
                </div>

                {/* Close Hint */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Presioná [B] o click fuera para cerrar</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-amber-400 hover:underline font-bold cursor-pointer"
                  >
                    Cerrar Menú
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. COMPACT USER BUTTON: ONLY HEAD ICON AND NAME */}
        <div
          id="hud-active-user-badge"
          onClick={() => onOpenAdmin()}
          className="h-12 px-3 bg-slate-950/90 hover:bg-slate-900/95 border-2 border-amber-500/80 shadow-2xl rounded-2xl flex items-center gap-2.5 text-white backdrop-blur-md cursor-pointer transition-all hover:border-amber-400 active:scale-95 group"
          title={`Estudiante: ${profile.name} - Click para abrir opciones`}
        >
          <div className="w-8 h-8 rounded-xl bg-purple-900/80 border border-purple-400/50 flex items-center justify-center overflow-hidden shadow-inner p-0.5">
            <PixelAvatar gender={profile.gender || 'boy'} hairColor={profile.avatar?.hairColor} size={28} />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-amber-200 transition-colors pr-1">
            {profile.name}
          </span>
        </div>
      </div>

      {/* Top Right: Dual Audio Volume Control Popup */}
      <div className="absolute top-3 right-16 z-40 select-none">
        <div className="relative">
          <button
            id="hud-volume-btn"
            onClick={() => setShowVolumePopup(!showVolumePopup)}
            className="h-11 px-3 bg-slate-950/85 hover:bg-slate-900 border-2 border-slate-700/80 hover:border-slate-500 shadow-xl rounded-xl flex items-center justify-center gap-1.5 text-slate-200 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            title={`Efectos: ${sfxVolume}% | Música: ${musicVolume}% - Click para ajustar`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
            <span className="text-[11px] font-black font-mono">{sfxVolume}%</span>
            <Music className="w-3 h-3 text-amber-400 opacity-75" />
            <span className="text-[11px] font-black font-mono text-amber-300">{musicVolume}%</span>
          </button>

          {showVolumePopup && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowVolumePopup(false)}
              />
              <div className="absolute top-13 right-0 z-40 w-60 bg-slate-950/96 border-2 border-amber-500/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150 space-y-3">
                <div className="text-xs font-black text-amber-300 border-b border-slate-800 pb-2 mb-1">
                  🎵 Control de Audio
                </div>

                {/* SFX Volume */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      Efectos (SFX)
                    </span>
                    <span className="text-emerald-400 font-mono">{sfxVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sfxVolume}
                    onChange={(e) => handleSfxVolumeChange(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <button onClick={() => handleSfxVolumeChange(0)} className="hover:text-rose-400 cursor-pointer">0%</button>
                    <button onClick={() => handleSfxVolumeChange(50)} className="hover:text-white cursor-pointer">50%</button>
                    <button onClick={() => handleSfxVolumeChange(100)} className="hover:text-emerald-400 cursor-pointer">100%</button>
                  </div>
                </div>

                {/* BGM Volume */}
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      Música de Fondo
                    </span>
                    <span className="text-amber-400 font-mono">{musicVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(e) => handleMusicVolumeChange(Number(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <button onClick={() => handleMusicVolumeChange(0)} className="hover:text-rose-400 cursor-pointer">Silencio</button>
                    <button onClick={() => handleMusicVolumeChange(30)} className="hover:text-white cursor-pointer">Suave</button>
                    <button onClick={() => handleMusicVolumeChange(70)} className="hover:text-amber-400 cursor-pointer">Alto</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
