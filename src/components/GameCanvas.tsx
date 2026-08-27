import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, SceneType } from '../types';
import { pixelArtRenderer } from '../game/pixelArtEngine';
import { sound } from '../services/audio';
import { MATERIAS, BIMESTRES_INFO, KINDER_MATERIA } from '../data/constants';
import {
  Sparkles,
  Volume2,
  VolumeX,
  MessageSquare,
  BookOpen,
  ShoppingBag,
  ArrowRight,
  X,
  Maximize,
  Minimize,
  Gamepad2,
  ChevronDown,
  ChevronUp,
  Shield,
  Home,
  Compass,
} from 'lucide-react';

interface GameCanvasProps {
  state: AppState;
  onSceneChange: (scene: SceneType, extra?: { materia?: string; city?: number; house?: number }) => void;
  onOpenNotebook: (materiaId?: string, cityNum?: number, houseNum?: number) => void;
  onOpenStore?: () => void;
  onOpenAdmin?: () => void;
  onUpdateVolume?: (volume: number) => void;
}

interface DialogueData {
  speakerName: string;
  speakerRole: string;
  avatarEmoji: string;
  avatarBg: string;
  text: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  state,
  onSceneChange,
  onOpenNotebook,
  onOpenStore,
  onOpenAdmin,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player physics & animation state
  const [player, setPlayer] = useState({
    x: 400,
    y: 280,
    speed: 4.5,
    facing: 'down' as 'up' | 'down' | 'left' | 'right',
    isWalking: false,
    animFrame: 0,
    animTimer: 0,
  });

  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<DialogueData | null>(null);
  const [soundActive, setSoundActive] = useState(state.settings.soundEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsMenu, setShowControlsMenu] = useState(false);
  const [controlsPosition, setControlsPosition] = useState<'right' | 'left'>('right');

  // Keys ref to avoid re-render lag
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const playerRef = useRef(player);
  playerRef.current = player;
  const walkEnterFramesRef = useRef<{ key: string; frames: number } | null>(null);
  const lastWalkTriggerRef = useRef<string | null>(null);
  const walkSuppressUntilRef = useRef<number>(0);

  // Listen to browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    sound.playSelect();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Virtual Touch / Click Controls
  const handleVirtualDirDown = (code: string) => {
    keysRef.current[code] = true;
  };

  const handleVirtualDirUp = (code: string) => {
    keysRef.current[code] = false;
  };

  // Debounce para evitar doble entrada por click/walk
  const lastEnterRef = useRef<number>(0);
  const canEnter = useCallback(() => {
    const now = Date.now();
    if (now - lastEnterRef.current < 600) return false;
    lastEnterRef.current = now;
    return true;
  }, []);

  // Click en el canvas -> traducir a coordenadas 800x560 y disparar entrada
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeDialogue) {
      if (activeDialogue.onPrimaryAction) activeDialogue.onPrimaryAction();
      else setActiveDialogue(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 560 / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    if (state.currentScene === 'PLAZA') {
      if (state.profile?.gradeLevel === 'kinder') {
        if (Math.hypot(cx - 400, cy - 490) < 70) {
          if (!canEnter()) return;
          sound.playSelect();
          onSceneChange('MATERIA_MAP', { materia: KINDER_MATERIA.id });
          return;
        }
      } else {
        for (const mat of MATERIAS) {
          if (Math.hypot(cx - mat.portalX, cy - mat.portalY) < 70) {
            if (!canEnter()) return;
            sound.playSelect();
            onSceneChange('MATERIA_MAP', { materia: mat.id });
            return;
          }
        }
      }
      if (Math.hypot(cx - 400, cy - 310) < 75) {
        sound.playSelect();
        setActiveDialogue({
          speakerName: 'Fuente de la Sabiduría',
          speakerRole: 'Monumento Central de la Plaza',
          avatarEmoji: '⛲',
          avatarBg: 'bg-sky-700',
          text: 'Las aguas cristalinas reflejan los 7 caminos del conocimiento. ¡Elegí un portal para viajar!',
          primaryActionLabel: 'Continuar Explorando [A]',
          onPrimaryAction: () => setActiveDialogue(null),
        });
      }
    } else if (state.currentScene === 'MATERIA_MAP') {
      const citiesX = [180, 370, 560, 720];
      const maxUnlocked = (state.currentMateria && state.profile.unlockedCities[state.currentMateria]) || 1;
      for (let idx = 0; idx < citiesX.length; idx++) {
        const cxx = citiesX[idx];
        if (cx >= cxx - 46 && cx <= cxx + 46 && cy >= 140 && cy <= 244) {
          const cityNum = idx + 1;
          if (cityNum <= maxUnlocked) {
            if (!canEnter()) return;
            sound.playSelect();
            onSceneChange('CITY_MAP', { city: cityNum });
          } else {
            sound.playStep();
            const bInfo = BIMESTRES_INFO[idx];
            setActiveDialogue({
              speakerName: `Guardia de ${bInfo.name}`,
              speakerRole: 'Ciudad Bloqueada',
              avatarEmoji: '🔒',
              avatarBg: 'bg-slate-700',
              text: `Esta ciudad es del ${bInfo.label} (${bInfo.months}). Completá la ciudad anterior para avanzar.`,
              primaryActionLabel: 'Entendido [A]',
              onPrimaryAction: () => setActiveDialogue(null),
            });
          }
          return;
        }
      }
    } else if (state.currentScene === 'CITY_MAP') {
      const street1Y = 190;
      const street2Y = 410;
      const row1X = [135, 285, 435, 585];
      for (let i = 0; i < 4; i++) {
        const hx = row1X[i];
        const houseRect = { x: hx, y: street1Y - 95, w: 78, h: 58 };
        if (cx >= houseRect.x - 6 && cx <= houseRect.x + houseRect.w + 6 && cy >= houseRect.y - 10 && cy <= houseRect.y + houseRect.h + 10) {
          sound.playSelect();
          onOpenNotebook(state.currentMateria || 'matematicas', state.currentCity, i + 1);
          lastWalkTriggerRef.current = `city:house:${i + 1}`;
          walkSuppressUntilRef.current = Date.now() + 1800;
          walkEnterFramesRef.current = null;
          return;
        }
      }
      for (let i = 0; i < 4; i++) {
        const hx = row1X[i];
        const houseRect = { x: hx, y: street2Y - 95, w: 78, h: 58 };
        if (cx >= houseRect.x - 6 && cx <= houseRect.x + houseRect.w + 6 && cy >= houseRect.y - 10 && cy <= houseRect.y + houseRect.h + 10) {
          sound.playSelect();
          onOpenNotebook(state.currentMateria || 'matematicas', state.currentCity, i + 5);
          lastWalkTriggerRef.current = `city:house:${i + 5}`;
          walkSuppressUntilRef.current = Date.now() + 1800;
          walkEnterFramesRef.current = null;
          return;
        }
      }
    } else if (state.currentScene === 'HOUSE') {
      if (cy > 430 && cx > 310 && cx < 490) {
        if (!canEnter()) return;
        sound.playDoor();
        onSceneChange('PLAZA');
      }
    }
  }, [activeDialogue, state, onSceneChange, onOpenNotebook, canEnter]);

  // Detect season
  const getEffectiveSeason = useCallback(() => {
    if (state.settings.season !== 'auto') return state.settings.season;
    const month = new Date().getMonth() + 1; // 1-12 (Southern Hemisphere / Argentina)
    if (month === 12 || month <= 2) return 'verano';
    if (month >= 3 && month <= 5) return 'otono';
    if (month >= 6 && month <= 8) return 'invierno';
    return 'primavera';
  }, [state.settings.season]);

  // Initial spawn positions per scene + Scene BGM integration
  useEffect(() => {
    setActiveDialogue(null);
    if (state.currentScene === 'HOUSE') {
      setPlayer((p) => ({ ...p, x: 400, y: 320, facing: 'down' }));
    } else if (state.currentScene === 'PLAZA') {
      const currentMat = MATERIAS.find((m) => m.id === state.currentMateria);
      if (currentMat) {
        setPlayer((p) => ({ ...p, x: currentMat.portalX, y: currentMat.portalY, facing: 'down' }));
      } else {
        setPlayer((p) => ({ ...p, x: 400, y: 150, facing: 'down' }));
      }
    } else if (state.currentScene === 'MATERIA_MAP') {
      setPlayer((p) => ({ ...p, x: 70, y: 280, facing: 'right' }));
    } else if (state.currentScene === 'CITY_MAP') {
      setPlayer((p) => ({ ...p, x: 70, y: 190, facing: 'right' }));
    }
    // --- Música ambiental por pantalla (crossfade suave) ---
    try {
      sound.setScene(state.currentScene as 'HOUSE' | 'PLAZA' | 'MATERIA_MAP' | 'CITY_MAP', state.currentMateria || undefined);
      // Si por autoplay policies no arrancó, intenta disparar ambient loop si musicEnabled
      if (state.settings.musicEnabled && !sound.getIsBgmPlaying()) {
        sound.playSceneBgm(state.currentScene as 'HOUSE' | 'PLAZA' | 'MATERIA_MAP' | 'CITY_MAP', state.currentMateria || undefined);
      }
    } catch {}
  }, [state.currentScene, state.currentMateria, state.settings.musicEnabled]);

  // Back Navigation Handler [Tecla B / Escape / Backspace]
  const handleBackNavigation = useCallback(() => {
    if (activeDialogue) {
      sound.playSelect();
      setActiveDialogue(null);
      return;
    }

    if (state.currentScene === 'CITY_MAP') {
      sound.playDoor();
      onSceneChange('MATERIA_MAP');
    } else if (state.currentScene === 'MATERIA_MAP') {
      sound.playDoor();
      onSceneChange('PLAZA');
    } else if (state.currentScene === 'PLAZA') {
      sound.playDoor();
      onSceneChange('HOUSE');
    }
  }, [activeDialogue, state.currentScene, onSceneChange]);

  // Action Key Trigger [Tecla A / Espacio / Enter]
  const checkActionTrigger = useCallback(() => {
    // If dialogue is active, trigger primary action
    if (activeDialogue) {
      if (activeDialogue.onPrimaryAction) {
        activeDialogue.onPrimaryAction();
      } else {
        setActiveDialogue(null);
      }
      return;
    }

    const p = playerRef.current;

    if (state.currentScene === 'HOUSE') {
      // Exit door at bottom
      if (p.y > 430 && p.x > 310 && p.x < 490) {
        sound.playDoor();
        onSceneChange('PLAZA');
      } else {
        // Open Dad's RPG dialogue with large font
        sound.playSelect();
        setActiveDialogue({
          speakerName: 'Papá / Guía Familiar',
          speakerRole: 'Mentor del Hogar',
          avatarEmoji: '🧔',
          avatarBg: 'bg-amber-800',
          text: `¡Hola, ${state.profile.name}! Hoy es un gran día para aprender y explorar. Tus tareas y recompensas las gestionamos juntos desde el Menú de Opciones con PIN. ¡Podés salir a la Plaza a explorar los Reinos del Saber!`,
          primaryActionLabel: 'Salir a la Plaza [A]',
          onPrimaryAction: () => {
            setActiveDialogue(null);
            sound.playDoor();
            onSceneChange('PLAZA');
          },
          secondaryActionLabel: 'Quedarme en Casa',
          onSecondaryAction: () => setActiveDialogue(null),
        });
      }
    } else if (state.currentScene === 'PLAZA') {
      // Return north to house
      if (p.y < 120 && Math.abs(p.x - 400) < 70) {
        sound.playDoor();
        onSceneChange('HOUSE');
        return;
      }

      // Check central fountain dialogue
      if (Math.hypot(p.x - 400, p.y - 310) < 75) {
        sound.playSelect();
        setActiveDialogue({
          speakerName: 'Fuente de la Sabiduría',
          speakerRole: 'Monumento Central de la Plaza',
          avatarEmoji: '⛲',
          avatarBg: 'bg-sky-700',
          text: 'Las aguas cristalinas reflejan los 7 caminos del conocimiento: Matemáticas, Lenguaje, Ciencias, Historia, Arte, Música e Inglés. ¡Elegí un portal para viajar a las Ciudades del Saber!',
          primaryActionLabel: 'Continuar Explorando [A]',
          onPrimaryAction: () => setActiveDialogue(null),
        });
        return;
      }

      // Check Market Stall (Tienda de Recompensas at x: 585, y: 120)
      if (Math.abs(p.x - 620) < 55 && Math.abs(p.y - 145) < 50) {
        sound.playSelect();
        setActiveDialogue({
          speakerName: 'Mercader Valerio',
          speakerRole: 'Tienda del Reino',
          avatarEmoji: '🛒',
          avatarBg: 'bg-amber-600',
          text: '¡Saludos, joven aventurero! Por cada misión que cumplas y tus papás aprueben en el Modo Adulto, recibirás monedas de oro y sabiduría para desbloquear accesorios y premios.',
          primaryActionLabel: '¡Genial! [A]',
          onPrimaryAction: () => setActiveDialogue(null),
        });
        return;
      }

      // Enter one of the 7 Materia radial portals (or Kinder Portal)
      if (state.profile?.gradeLevel === 'kinder') {
        const distKinder = Math.hypot(p.x - 400, p.y - 490);
        if (distKinder < 70) {
          sound.playSelect();
          onSceneChange('MATERIA_MAP', { materia: KINDER_MATERIA.id });
          return;
        }
      } else {
        for (const mat of MATERIAS) {
          const dist = Math.hypot(p.x - mat.portalX, p.y - mat.portalY);
          if (dist < 60) {
            sound.playSelect();
            onSceneChange('MATERIA_MAP', { materia: mat.id });
            return;
          }
        }
      }
    } else if (state.currentScene === 'MATERIA_MAP') {
      // Return west to Plaza
      if (p.x < 80) {
        sound.playDoor();
        onSceneChange('PLAZA');
        return;
      }
      // Enter City / Bimestre
      const citiesX = [180, 370, 560, 720];
      const maxUnlocked = (state.currentMateria && state.profile.unlockedCities[state.currentMateria]) || 1;

      for (let idx = 0; idx < citiesX.length; idx++) {
        const cx = citiesX[idx];
        const cityNum = idx + 1;
        if (Math.abs(p.x - cx) < 55 && Math.abs(p.y - 250) < 70) {
          if (cityNum <= maxUnlocked) {
            sound.playSelect();
            onSceneChange('CITY_MAP', { city: cityNum });
          } else {
            sound.playStep();
            const bInfo = BIMESTRES_INFO[idx];
            setActiveDialogue({
              speakerName: `Guardia de ${bInfo.name}`,
              speakerRole: 'Ciudad Bloqueada',
              avatarEmoji: '🔒',
              avatarBg: 'bg-slate-700',
              text: `Esta ciudad corresponde al Bimestre ${idx + 1} (${bInfo.months}). Necesitás completar las misiones de la ciudad anterior para avanzar por el camino.`,
              primaryActionLabel: 'Entendido [A]',
              onPrimaryAction: () => setActiveDialogue(null),
            });
          }
          return;
        }
      }
    } else if (state.currentScene === 'CITY_MAP') {
      // Return west to Materia Map
      if (p.x < 80) {
        sound.playDoor();
        onSceneChange('MATERIA_MAP');
        return;
      }
      // Enter House / Week
      const row1X = [135, 285, 435, 585];
      // Check Row 1 (Weeks 1 to 4)
      for (let i = 0; i < 4; i++) {
        const hx = row1X[i];
        if (Math.abs(p.x - (hx + 38)) < 45 && Math.abs(p.y - 170) < 55) {
          sound.playSelect();
          setActiveDialogue({
            speakerName: `Estación de la Semana ${i + 1}`,
            speakerRole: `Bimestre ${state.currentCity}`,
            avatarEmoji: '🏡',
            avatarBg: 'bg-indigo-700',
            text: `¡Bienvenido a la Semana ${i + 1}! Tus actividades y tareas pedagógicas se administran desde el Modo Opciones.`,
            primaryActionLabel: 'Continuar Explorando [A]',
            onPrimaryAction: () => setActiveDialogue(null),
          });
          return;
        }
      }
      // Check Row 2 (Weeks 5 to 8)
      for (let i = 0; i < 4; i++) {
        const hx = row1X[i];
        if (Math.abs(p.x - (hx + 38)) < 45 && Math.abs(p.y - 390) < 55) {
          sound.playSelect();
          setActiveDialogue({
            speakerName: `Estación de la Semana ${i + 5}`,
            speakerRole: `Bimestre ${state.currentCity}`,
            avatarEmoji: '🏡',
            avatarBg: 'bg-indigo-700',
            text: `¡Bienvenido a la Semana ${i + 5}! Tus actividades y tareas pedagógicas se administran desde el Modo Opciones.`,
            primaryActionLabel: 'Continuar Explorando [A]',
            onPrimaryAction: () => setActiveDialogue(null),
          });
          return;
        }
      }
    }
  }, [activeDialogue, state, onSceneChange]);

  // Keyboard Event Listeners for Arrow Keys + [A], [B], [C], [P], [F]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrows & space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      keysRef.current[e.code] = true;
      keysRef.current[e.key.toLowerCase()] = true;

      // [Tecla A], Espacio o Enter -> Acción Principal
      if (e.code === 'KeyA' || e.code === 'Space' || e.code === 'Enter') {
        checkActionTrigger();
      }

      // [Tecla B], Escape o Backspace -> Volver / Cancelar
      if (e.code === 'KeyB' || e.code === 'Escape' || e.code === 'Backspace') {
        handleBackNavigation();
      }

      // [Tecla C] -> Alternar Menú Desplegable de Controles
      if (e.code === 'KeyC') {
        sound.playSelect();
        setShowControlsMenu((prev) => !prev);
      }

      // [Tecla F] -> Alternar Pantalla Completa
      if (e.code === 'KeyF') {
        toggleFullscreen();
      }

      // [Tecla P] -> Modo Padres / Admin
      if (e.code === 'KeyP' && onOpenAdmin) {
        sound.playSelect();
        setActiveDialogue(null);
        onOpenAdmin();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.currentScene, state.currentMateria, state.currentCity, checkActionTrigger, handleBackNavigation, onOpenAdmin]);

  // Main Game Loop (Physics + 60fps Render)
  useEffect(() => {
    let animId: number;
    let ambientCheckCounter = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // 1. UPDATE PHYSICS (only if dialogue is not blocking)
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;
      let newFacing = playerRef.current.facing;
      let isMoving = false;

      if (!activeDialogue) {
        // Movement: Arrows or WASD (Arrow keys take priority)
        if (keys['ArrowUp'] || keys['w'] || keys['KeyW']) {
          dy -= playerRef.current.speed;
          newFacing = 'up';
          isMoving = true;
        }
        if (keys['ArrowDown'] || keys['s'] || keys['KeyS']) {
          dy += playerRef.current.speed;
          newFacing = 'down';
          isMoving = true;
        }
        if (keys['ArrowLeft'] || keys['a_move'] || keys['KeyA_off']) {
          // Handled via Left Arrow
        }
        if (keys['ArrowLeft']) {
          dx -= playerRef.current.speed;
          newFacing = 'left';
          isMoving = true;
        }
        if (keys['ArrowRight']) {
          dx += playerRef.current.speed;
          newFacing = 'right';
          isMoving = true;
        }
      }

      // Diagonal speed normalize
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      let nextX = playerRef.current.x + dx;
      let nextY = playerRef.current.y + dy;

      // Screen boundaries
      nextX = Math.max(30, Math.min(canvas.width - 30, nextX));
      nextY = Math.max(70, Math.min(canvas.height - 40, nextY));

      // Animation frame update
      let newAnimTimer = playerRef.current.animTimer;
      let newAnimFrame = playerRef.current.animFrame;
      if (isMoving) {
        newAnimTimer++;
        if (newAnimTimer > 6) {
          newAnimTimer = 0;
          newAnimFrame = (newAnimFrame + 1) % 4;
          if (newAnimFrame === 0 || newAnimFrame === 2) {
            sound.playStep();
          }
        }
      } else {
        newAnimFrame = 0;
      }

      // Mantén BGM/ambient loops por escena si no está sonando (autoplay / tab hidden)
      ambientCheckCounter++;
      if (ambientCheckCounter > 120) {
        ambientCheckCounter = 0;
        if (state.settings.musicEnabled && !sound.getIsBgmPlaying()) {
          try {
            sound.playSceneBgm(
              state.currentScene as 'HOUSE' | 'PLAZA' | 'MATERIA_MAP' | 'CITY_MAP',
              state.currentMateria || undefined
            );
          } catch {}
        }
      }

      // Check proximity prompts
      let promptText: string | null = null;
      if (!activeDialogue) {
        if (state.currentScene === 'HOUSE') {
          if (nextY > 430 && nextX > 300 && nextX < 500) {
            promptText = '🚪 Presioná [A] para salir al día';
          } else {
            promptText = '💬 Presioná [A] para hablar con Papá o [M] para Misiones';
          }
        } else if (state.currentScene === 'PLAZA') {
          if (nextY < 120 && Math.abs(nextX - 400) < 70) {
            promptText = '🏠 Presioná [A] para entrar a tu Casa';
          } else if (Math.hypot(nextX - 400, nextY - 310) < 75) {
            promptText = '⛲ Presioná [A] para examinar la Fuente';
          } else if (Math.abs(nextX - 620) < 55 && Math.abs(nextY - 145) < 50) {
            promptText = '🛒 Presioná [A] para hablar con el Mercader';
          } else if (state.profile?.gradeLevel === 'kinder') {
            const dist = Math.hypot(nextX - 400, nextY - 490);
            if (dist < 70) {
              promptText = '🎈 Presioná [A] para entrar a Aventuras de Kinder';
            }
          } else {
            for (const mat of MATERIAS) {
              const dist = Math.hypot(nextX - mat.portalX, nextY - mat.portalY);
              if (dist < 60) {
                promptText = `▶ Presioná [A] para entrar a Ciudad ${mat.shortName}`;
                break;
              }
            }
          }
        } else if (state.currentScene === 'MATERIA_MAP') {
          if (nextX < 80) {
            promptText = '◀ Presioná [B] o [A] para volver a la Plaza';
          } else {
            const citiesX = [180, 370, 560, 720];
            const maxUnlocked = (state.currentMateria && state.profile.unlockedCities[state.currentMateria]) || 1;
            citiesX.forEach((cx, idx) => {
              if (Math.abs(nextX - cx) < 55 && Math.abs(nextY - 250) < 70) {
                const bInfo = BIMESTRES_INFO[idx];
                promptText =
                  idx + 1 <= maxUnlocked
                    ? `🏛️ Presioná [A] para entrar a ${bInfo.name}`
                    : `🔒 ${bInfo.name} bloqueada [A]`;
              }
            });
          }
        } else if (state.currentScene === 'CITY_MAP') {
          if (nextX < 80) {
            promptText = '◀ Presioná [B] para volver al mapa';
          } else {
            // Detect nearest house for better prompt
            const row1X = [135, 285, 435, 585];
            let nearWeek: number | null = null;
            for (let i = 0; i < 4; i++) if (Math.abs(nextX - (row1X[i] + 39)) < 42 && Math.abs(nextY - 150) < 50) nearWeek = i + 1;
            for (let i = 0; i < 4; i++) if (Math.abs(nextX - (row1X[i] + 39)) < 42 && Math.abs(nextY - 370) < 50) nearWeek = i + 5;
            promptText = nearWeek ? `🏡 Semana ${nearWeek}: caminá a la puerta o clickeá / [A] para abrir` : '🏡 Caminá a una casa o clickeá para abrir la Libreta [M]';
          }
        }
      }
      // --- Entrada caminando: si te quedás ~180ms sobre una puerta/portal, entra solo ---
      if (!activeDialogue) {
        let walkKey: string | null = null;
        let walkAction: (() => void) | null = null;
        if (state.currentScene === 'HOUSE' && nextY > 430 && nextX > 310 && nextX < 490) {
          walkKey = 'house:exit';
          walkAction = () => { if (canEnter()) { sound.playDoor(); onSceneChange('PLAZA'); } };
          promptText = '🚪 Caminá hacia la puerta o clickeá para salir • [A]';
        } else if (state.currentScene === 'PLAZA') {
          if (nextY < 120 && Math.abs(nextX - 400) < 70) {
            walkKey = 'plaza:house';
            walkAction = () => { if (canEnter()) { sound.playDoor(); onSceneChange('HOUSE'); } };
          } else if (state.profile?.gradeLevel === 'kinder') {
            if (Math.hypot(nextX - 400, nextY - 490) < 50) {
              walkKey = 'plaza:kinder';
              walkAction = () => { if (canEnter()) { sound.playSelect(); onSceneChange('MATERIA_MAP', { materia: KINDER_MATERIA.id }); } };
            }
          } else {
            for (const mat of MATERIAS) {
              if (Math.hypot(nextX - mat.portalX, nextY - mat.portalY) < 45) {
                walkKey = `plaza:mat:${mat.id}`;
                walkAction = () => { if (canEnter()) { sound.playSelect(); onSceneChange('MATERIA_MAP', { materia: mat.id }); } };
                promptText = `▶ Caminá al portal o clickeá para entrar a ${mat.shortName} • [A]`;
                break;
              }
            }
          }
        } else if (state.currentScene === 'MATERIA_MAP') {
          const citiesX = [180, 370, 560, 720];
          const maxUnlocked = (state.currentMateria && state.profile.unlockedCities[state.currentMateria]) || 1;
          for (let idx = 0; idx < citiesX.length; idx++) {
            const cx = citiesX[idx];
            if (Math.abs(nextX - cx) < 38 && Math.abs(nextY - 238) < 48) {
              const cityNum = idx + 1;
              if (cityNum <= maxUnlocked) {
                walkKey = `materia:city:${cityNum}`;
                const cn = cityNum;
                walkAction = () => { if (canEnter()) { sound.playSelect(); onSceneChange('CITY_MAP', { city: cn }); } };
                const bInfo = BIMESTRES_INFO[idx];
                promptText = `🏛️ Entrá caminando o clickeá para ${bInfo.name} • [A]`;
              }
              break;
            }
          }
        } else if (state.currentScene === 'CITY_MAP') {
          const row1X = [135, 285, 435, 585];
          for (let i = 0; i < 4; i++) {
            const hx = row1X[i];
            if (Math.abs(nextX - (hx + 39)) < 28 && Math.abs(nextY - 150) < 36) {
              walkKey = `city:house:${i + 1}`;
              const w = i + 1;
              walkAction = () => {
                sound.playSelect();
                onOpenNotebook(state.currentMateria || 'matematicas', state.currentCity, w);
                setPlayer((prev) => ({ ...prev, y: prev.y + 18 }));
              };
              promptText = `🏡 Semana ${w}: entrá caminando o clickeá • [A]`;
              break;
            }
          }
          if (!walkKey) {
            for (let i = 0; i < 4; i++) {
              const hx = row1X[i];
              if (Math.abs(nextX - (hx + 39)) < 28 && Math.abs(nextY - 370) < 36) {
                walkKey = `city:house:${i + 5}`;
                const w = i + 5;
                walkAction = () => {
                  sound.playSelect();
                  onOpenNotebook(state.currentMateria || 'matematicas', state.currentCity, w);
                  setPlayer((prev) => ({ ...prev, y: prev.y + 18 }));
                };
                promptText = `🏡 Semana ${w}: entrá caminando o clickeá • [A]`;
                break;
              }
            }
          }
        }

        const nowMs = Date.now();
        const isCooldown = nowMs < walkSuppressUntilRef.current;
        const isSameAsLast = walkKey !== null && lastWalkTriggerRef.current === walkKey;

        if (!walkKey) {
          // Salió de la zona: libera el bloqueo de "misma puerta" pero respeta cooldown temporal
          lastWalkTriggerRef.current = null;
          walkEnterFramesRef.current = null;
        } else if (isCooldown || isSameAsLast) {
          // Bloqueado para niños: debe alejarse al menos 28px o esperar 1.4s. No cuenta frames.
          walkEnterFramesRef.current = null;
          // Si es la misma puerta, hint para que se mueva
          if (isSameAsLast && state.currentScene === 'CITY_MAP') {
            promptText = '↔️ Aleja al personaje de la puerta para volver a entrar';
          }
        } else if (walkKey && walkAction) {
          const prev = walkEnterFramesRef.current;
          if (prev && prev.key === walkKey) {
            prev.frames++;
            if (prev.frames > 11) {
              walkEnterFramesRef.current = null;
              lastWalkTriggerRef.current = walkKey;
              walkSuppressUntilRef.current = Date.now() + 1400;
              const actionToRun = walkAction;
              setTimeout(() => actionToRun(), 0);
            }
          } else {
            walkEnterFramesRef.current = { key: walkKey, frames: 1 };
          }
        } else {
          walkEnterFramesRef.current = null;
        }
      } else {
        walkEnterFramesRef.current = null;
      }
      setInteractionPrompt(promptText);

      setPlayer({
        x: nextX,
        y: nextY,
        speed: playerRef.current.speed,
        facing: newFacing,
        isWalking: isMoving,
        animFrame: newAnimFrame,
        animTimer: newAnimTimer,
      });

      // Update particles
      const season = getEffectiveSeason();
      pixelArtRenderer.addSeasonalParticles(canvas.width, canvas.height, season);
      pixelArtRenderer.updateParticles();

      // 2. RENDER GRAPHICS (GBA Minish Cap Pixel Art)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (state.currentScene === 'HOUSE') {
        pixelArtRenderer.renderHouseInterior(ctx, canvas.width, canvas.height, state.profile);
      } else if (state.currentScene === 'PLAZA') {
        pixelArtRenderer.renderPlazaScene(ctx, canvas.width, canvas.height, season, state.profile);
      } else if (state.currentScene === 'MATERIA_MAP') {
        const maxCity = (state.currentMateria && state.profile.unlockedCities[state.currentMateria]) || 1;
        pixelArtRenderer.renderMateriaMapScene(
          ctx,
          canvas.width,
          canvas.height,
          state.currentMateria || 'matematicas',
          maxCity,
          season
        );
      } else if (state.currentScene === 'CITY_MAP') {
        pixelArtRenderer.renderCityMapScene(
          ctx,
          canvas.width,
          canvas.height,
          state.currentMateria || 'matematicas',
          state.currentCity,
          season
        );
      }

      // Render Player Avatar (Zelda GBA Hero Style)
      pixelArtRenderer.renderPlayer(
        ctx,
        nextX,
        nextY,
        newFacing,
        isMoving,
        newAnimFrame,
        state.profile
      );

      // Render Floating Atmospheric Particles (leaves, sparkles, snow, smoke)
      pixelArtRenderer.renderParticles(ctx);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [state, activeDialogue, getEffectiveSeason]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden bg-slate-950">
      {/* Canvas Viewport scaled cleanly to fill entire screen */}
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          id="gameCanvas"
          width={800}
          height={560}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain block select-none max-w-full max-h-full cursor-pointer"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* --- CLASSIC RPG PARCHMENT SCROLL DIALOGUE BOX (FONT.PNG / RETRO RPG STYLE) --- */}
        {activeDialogue && (
          <div className="absolute inset-x-3 bottom-3 z-40 animate-fade-in max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 border-4 border-amber-900/80 rounded-2xl p-4 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-slate-900 flex flex-col md:flex-row gap-4 items-start md:items-center ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-950">
              {/* Corner Gold Studs */}
              <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-amber-600 border border-amber-800 shadow-sm" />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-600 border border-amber-800 shadow-sm" />
              <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-amber-600 border border-amber-800 shadow-sm" />
              <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-600 border border-amber-800 shadow-sm" />

              {/* Speaker Character Avatar Portrait */}
              <div className="flex-shrink-0 flex items-center gap-3 md:flex-col md:items-center">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${activeDialogue.avatarBg} border-3 border-amber-800 shadow-lg flex items-center justify-center text-3xl md:text-4xl transform hover:scale-105 transition-transform text-white`}>
                  {activeDialogue.avatarEmoji}
                </div>
                <div className="text-left md:text-center">
                  <div className="font-black text-amber-950 text-base md:text-lg leading-tight tracking-tight">
                    {activeDialogue.speakerName}
                  </div>
                  <div className="text-xs md:text-sm text-amber-800 font-bold">
                    {activeDialogue.speakerRole}
                  </div>
                </div>
              </div>

              {/* Dialogue Text Content (Large 18px-22px High Contrast Dark Ink Typography) */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-relaxed font-serif tracking-normal">
                  "{activeDialogue.text}"
                </p>

                {/* Interactive Action Buttons */}
                <div className="mt-4 flex items-center gap-2.5 flex-wrap">
                  {activeDialogue.primaryActionLabel && (
                    <button
                      onClick={() => {
                        sound.playSelect();
                        if (activeDialogue.onPrimaryAction) activeDialogue.onPrimaryAction();
                      }}
                      className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-50 font-black text-base md:text-lg px-5 py-2.5 rounded-xl shadow-md border-2 border-amber-900 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>{activeDialogue.primaryActionLabel}</span>
                    </button>
                  )}

                  {activeDialogue.secondaryActionLabel && (
                    <button
                      onClick={() => {
                        sound.playSelect();
                        if (activeDialogue.onSecondaryAction) activeDialogue.onSecondaryAction();
                      }}
                      className="bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-sm md:text-base px-4 py-2.5 rounded-xl border-2 border-amber-700/60 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4 text-amber-800" />
                      <span>{activeDialogue.secondaryActionLabel}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sound.playSelect();
                      setActiveDialogue(null);
                    }}
                    className="bg-amber-900/10 hover:bg-amber-900/20 text-amber-950 font-bold text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-amber-900/30 ml-auto flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Cerrar [B]</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Contextual Action Prompt (Positioned lower, more to the left, and slightly smaller) */}
        {!activeDialogue && interactionPrompt && (
          <div className="absolute bottom-2.5 sm:bottom-3.5 left-4 sm:left-6 bg-slate-950/95 text-amber-300 font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm border border-amber-400/90 shadow-2xl backdrop-blur flex items-center gap-2 animate-bounce z-20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="tracking-wide">{interactionPrompt}</span>
          </div>
        )}

        {/* Top-Right Quick Tool Bar: Fullscreen */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
          <button
            onClick={toggleFullscreen}
            className="w-11 h-11 bg-slate-950/85 hover:bg-slate-900 text-white rounded-xl border-2 border-amber-500/70 backdrop-blur-md shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title={isFullscreen ? 'Salir de Pantalla Completa [F]' : 'Pantalla Completa [F]'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-amber-300" />
            ) : (
              <Maximize className="w-5 h-5 text-amber-300" />
            )}
          </button>
        </div>
      </div>

      {/* --- BOTTOM COLLAPSIBLE TRANSPARENT CONTROLS MENU (RIGHT OR LEFT) --- */}
      <div
        className={`absolute bottom-3 ${
          controlsPosition === 'right' ? 'right-3' : 'left-3'
        } z-40 select-none`}
      >
        {/* Collapsed Trigger Button */}
        {!showControlsMenu && (
          <button
            id="btn-toggle-controls"
            onClick={() => {
              sound.playSelect();
              setShowControlsMenu(true);
            }}
            className="flex items-center gap-2 bg-slate-950/75 hover:bg-slate-900/90 border border-amber-500/60 hover:border-amber-400 shadow-2xl px-3.5 py-2 rounded-2xl text-amber-300 backdrop-blur-md transition-all active:scale-95 cursor-pointer group"
          >
            <Gamepad2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold tracking-wide text-slate-200">Controles</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">[C]</span>
          </button>
        )}

        {/* Expanded Transparent Controls Dropdown Menu */}
        {showControlsMenu && (
          <div
            id="panel-controls-dropdown"
            className="bg-slate-950/85 border-2 border-amber-500/80 rounded-3xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl text-white w-[310px] sm:w-[350px] animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {/* Header with Switch Side & Close */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Controles del Juego
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Switch left / right position */}
                <button
                  onClick={() => setControlsPosition((prev) => (prev === 'right' ? 'left' : 'right'))}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-600 transition-colors cursor-pointer"
                  title="Cambiar lado (Izquierda / Derecha)"
                >
                  {controlsPosition === 'right' ? '◀ A la Izquierda' : 'A la Derecha ▶'}
                </button>

                <button
                  onClick={() => setShowControlsMenu(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Virtual On-Screen Gamepad for Touch or Quick Clicks */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-3">
              <div className="flex items-center justify-between">
                {/* Virtual D-Pad */}
                <div className="flex flex-col items-center">
                  <button
                    onPointerDown={() => handleVirtualDirDown('ArrowUp')}
                    onPointerUp={() => handleVirtualDirUp('ArrowUp')}
                    onPointerLeave={() => handleVirtualDirUp('ArrowUp')}
                    className="w-9 h-9 bg-slate-800 active:bg-amber-600 hover:bg-slate-700 text-amber-300 font-bold rounded-lg border border-slate-600 flex items-center justify-center transition-transform active:scale-90 touch-none select-none cursor-pointer"
                  >
                    ▲
                  </button>
                  <div className="flex items-center gap-1 my-1">
                    <button
                      onPointerDown={() => handleVirtualDirDown('ArrowLeft')}
                      onPointerUp={() => handleVirtualDirUp('ArrowLeft')}
                      onPointerLeave={() => handleVirtualDirUp('ArrowLeft')}
                      className="w-9 h-9 bg-slate-800 active:bg-amber-600 hover:bg-slate-700 text-amber-300 font-bold rounded-lg border border-slate-600 flex items-center justify-center transition-transform active:scale-90 touch-none select-none cursor-pointer"
                    >
                      ◀
                    </button>
                    <div className="w-9 h-9 bg-slate-950 rounded-lg flex items-center justify-center text-slate-600 text-xs font-mono">
                      +
                    </div>
                    <button
                      onPointerDown={() => handleVirtualDirDown('ArrowRight')}
                      onPointerUp={() => handleVirtualDirUp('ArrowRight')}
                      onPointerLeave={() => handleVirtualDirUp('ArrowRight')}
                      className="w-9 h-9 bg-slate-800 active:bg-amber-600 hover:bg-slate-700 text-amber-300 font-bold rounded-lg border border-slate-600 flex items-center justify-center transition-transform active:scale-90 touch-none select-none cursor-pointer"
                    >
                      ▶
                    </button>
                  </div>
                  <button
                    onPointerDown={() => handleVirtualDirDown('ArrowDown')}
                    onPointerUp={() => handleVirtualDirUp('ArrowDown')}
                    onPointerLeave={() => handleVirtualDirUp('ArrowDown')}
                    className="w-9 h-9 bg-slate-800 active:bg-amber-600 hover:bg-slate-700 text-amber-300 font-bold rounded-lg border border-slate-600 flex items-center justify-center transition-transform active:scale-90 touch-none select-none cursor-pointer"
                  >
                    ▼
                  </button>
                </div>

                {/* Virtual Action Buttons A & B */}
                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => {
                        sound.playSelect();
                        handleBackNavigation();
                      }}
                      className="w-11 h-11 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-sm rounded-2xl border-2 border-rose-300 shadow flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                    >
                      B
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold">Volver</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => {
                        sound.playSelect();
                        checkActionTrigger();
                      }}
                      className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-base rounded-2xl border-2 border-emerald-300 shadow flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                    >
                      A
                    </button>
                    <span className="text-[10px] text-emerald-300 font-bold">Entrar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Cheat-Sheet */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 py-0.5">
                <span className="text-slate-400">Mover personaje:</span>
                <span className="font-mono text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Flechas / WASD
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 py-0.5">
                <span className="text-slate-400">Interactuar / Entrar:</span>
                <span className="font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold">
                  [A] / Espacio / Enter
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 py-0.5">
                <span className="text-slate-400">Volver / Cerrar:</span>
                <span className="font-mono text-rose-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold">
                  [B] / Esc
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 py-0.5">
                <span className="text-slate-400">Modo Padre (PIN):</span>
                <span className="font-mono text-purple-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold">
                  [P]
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 py-0.5">
                <span className="text-slate-400">Pantalla Completa:</span>
                <span className="font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold">
                  [F]
                </span>
              </div>
            </div>

            {/* Quick Action Shortcuts inside controls */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  sound.playSelect();
                  onSceneChange('HOUSE');
                }}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🏠 Ir a Casa</span>
              </button>

              <button
                onClick={() => {
                  sound.playSelect();
                  onSceneChange('PLAZA');
                }}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>⛲ Ir a Plaza</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
