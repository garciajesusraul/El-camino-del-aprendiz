import React, { useCallback } from 'react';

interface VirtualJoystickProps {
  enabled: boolean;
}

function dispatchKey(code: string, key: string, type: 'keydown' | 'keyup') {
  const event = new KeyboardEvent(type, { code, key, bubbles: true, cancelable: true });
  window.dispatchEvent(event);
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ enabled }) => {
  if (!enabled) return null;

  const handlePressStart = useCallback((code: string, key: string) => {
    dispatchKey(code, key, 'keydown');
    // Haptic feedback if available
    if (navigator.vibrate) navigator.vibrate(20);
  }, []);

  const handlePressEnd = useCallback((code: string, key: string) => {
    dispatchKey(code, key, 'keyup');
  }, []);

  const bind = (code: string, key: string) => ({
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); handlePressStart(code, key); },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); handlePressEnd(code, key); },
    onTouchCancel: (e: React.TouchEvent) => { e.preventDefault(); handlePressEnd(code, key); },
    onMouseDown: (e: React.MouseEvent) => { e.preventDefault(); handlePressStart(code, key); },
    onMouseUp: (e: React.MouseEvent) => { e.preventDefault(); handlePressEnd(code, key); },
    onMouseLeave: (e: React.MouseEvent) => { handlePressEnd(code, key); },
  });

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none select-none scale-[0.85] md:scale-100 origin-bottom-center">
      {/* Contenedor transparente - no tapa la pantalla, solo botones semi-transparentes */}
      <div className="flex items-end justify-between px-3 pb-3 pt-4 bg-transparent pointer-events-none">
        {/* D-PAD izquierda - flechas */}
        <div className="pointer-events-auto flex flex-col items-center gap-1.5">
          <button
            {...bind('ArrowUp', 'ArrowUp')}
            className="w-12 h-12 rounded-xl bg-slate-900/30 backdrop-blur-sm border border-white/20 text-white text-lg font-black flex items-center justify-center active:bg-slate-900/50 active:scale-95 shadow-lg"
            aria-label="Arriba"
          >
            ▲
          </button>
          <div className="flex gap-1.5">
            <button
              {...bind('ArrowLeft', 'ArrowLeft')}
              className="w-12 h-12 rounded-xl bg-slate-900/30 backdrop-blur-sm border border-white/20 text-white text-lg font-black flex items-center justify-center active:bg-slate-900/50 active:scale-95 shadow-lg"
              aria-label="Izquierda"
            >
              ◀
            </button>
            <button
              {...bind('ArrowDown', 'ArrowDown')}
              className="w-12 h-12 rounded-xl bg-slate-900/30 backdrop-blur-sm border border-white/20 text-white text-lg font-black flex items-center justify-center active:bg-slate-900/50 active:scale-95 shadow-lg"
              aria-label="Abajo"
            >
              ▼
            </button>
            <button
              {...bind('ArrowRight', 'ArrowRight')}
              className="w-12 h-12 rounded-xl bg-slate-900/30 backdrop-blur-sm border border-white/20 text-white text-lg font-black flex items-center justify-center active:bg-slate-900/50 active:scale-95 shadow-lg"
              aria-label="Derecha"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Botones acción derecha - Enter y Volver */}
        <div className="pointer-events-auto flex flex-col gap-2 items-center">
          <button
            {...bind('Enter', 'Enter')}
            className="w-16 h-16 rounded-full bg-emerald-600/40 backdrop-blur-sm border-2 border-emerald-400/50 text-white text-xs font-black flex flex-col items-center justify-center active:bg-emerald-600/60 active:scale-95 shadow-lg"
            aria-label="Entrar"
          >
            <span className="text-lg">✓</span>
            <span className="text-[9px] -mt-1">ENTER</span>
          </button>
          <button
            {...bind('Escape', 'Escape')}
            className="w-14 h-10 rounded-full bg-rose-600/30 backdrop-blur-sm border border-rose-400/40 text-white text-xs font-black flex items-center justify-center gap-1 active:bg-rose-600/50 active:scale-95 shadow-lg"
            aria-label="Volver"
          >
            ✕ <span className="text-[9px]">B</span>
          </button>
        </div>
      </div>
      {/* Texto ayuda pequeño - transparente */}
      <div className="text-center pb-1 pointer-events-none">
        <span className="text-[9px] text-white/40 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">Flechas para mover • ENTER para entrar • B para volver</span>
      </div>
    </div>
  );
};
