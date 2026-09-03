import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../services/audio';

interface LeonPomodoroProps {
  pomodoroMinutes: number; // por perfil
  onComplete?: () => void;
  joystickEnabled?: boolean;
}

export const LeonPomodoro: React.FC<LeonPomodoroProps> = ({ pomodoroMinutes, onComplete, joystickEnabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [remainingSec, setRemainingSec] = useState(pomodoroMinutes * 60);
  const [running, setRunning] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const endTimeRef = useRef<number>(0);

  // sync when pomodoroMinutes changes externally and not running
  useEffect(() => {
    if (!running) setRemainingSec(pomodoroMinutes * 60);
  }, [pomodoroMinutes, running]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    // Timer preciso basado en timestamp - corrige deriva por load del GameCanvas 60fps
    endTimeRef.current = Date.now() + remainingSec * 1000;
    intervalRef.current = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setRemainingSec((prev) => {
        if (left !== prev) return left;
        return prev;
      });
      if (left <= 0) {
        if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
        setRunning(false);
        setCelebrating(true);
        sound.playSelect();
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 }, colors: ['#22c55e','#f59e0b','#38bdf8'] });
          confetti({ particleCount: 80, spread: 100, origin: { y: 0.65 } });
        } catch {}
        if (onComplete) onComplete();
        window.setTimeout(() => setCelebrating(false), 2800);
      }
    }, 250);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [running]);

  const format = (sec: number) => `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
  const progress = 1 - remainingSec / (pomodoroMinutes*60);
  const isFinished = remainingSec === 0 && !running;

  return (
    <>
      {/* LEON avatar - bottom left - 30% mas chico en celular, mas arriba si joystick transparente activo */}
      <button
        onClick={() => { setIsOpen(true); sound.playSelect(); }}
        title={`LEON 🐶 Pomodoro ${pomodoroMinutes} min - ¡Click para estudiar!`}
        className={`fixed ${joystickEnabled ? 'bottom-[145px] md:bottom-[76px]' : 'bottom-[76px]'} left-3 z-30 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 border-2 border-amber-400 shadow-[0_6px_24px_rgba(0,0,0,0.5)] flex items-center justify-center text-2xl sm:text-3xl hover:scale-105 active:scale-95 transition-transform cursor-pointer select-none scale-[0.7] md:scale-100 origin-bottom-left`}
      >
        {/* brown dog */}
        <span className="text-[28px] sm:text-[32px] leading-none">🐶</span>
        <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[8px] font-black px-1 py-0.5 rounded-full border border-amber-600">LEON</span>
        {running && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Pomodoro Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/80 rounded-3xl shadow-[0_16px_60px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-4 border-b border-amber-500/40 flex items-center justify-between">
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2"><span className="text-xl">🐶</span> LEON — Temporizador de Estudio</h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700">✕</button>
            </div>
            <div className="p-5 flex flex-col items-center gap-4">
              {/* circle timer */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="#1e293b" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="44" stroke={celebrating ? '#22c55e' : '#f59e0b'} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${44*2*Math.PI}`} strokeDashoffset={`${44*2*Math.PI*(1-progress)}`} style={{ transition: 'stroke-dashoffset 0.25s linear' }} />
                </svg>
                <div className="text-center">
                  <div className={`text-3xl font-black font-mono ${celebrating ? 'text-emerald-400 animate-pulse' : 'text-white'}`}>{format(remainingSec)}</div>
                  <div className="text-[11px] text-slate-400 font-bold">{running ? '¡Enfócate, tú puedes!' : isFinished ? '¡Completado!' : `Pomodoro ${pomodoroMinutes} min`}</div>
                  {celebrating && <div className="text-xl mt-1 animate-bounce">🎉 🦴 ✨</div>}
                </div>
              </div>

              {/* controls */}
              <div className="flex items-center gap-2 w-full">
                {!running ? (
                  <button onClick={() => { if (remainingSec===0) setRemainingSec(pomodoroMinutes*60); setRunning(true); sound.playSelect(); }} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow cursor-pointer">
                    {isFinished ? 'Reiniciar' : '▶ Iniciar'}
                  </button>
                ) : (
                  <button onClick={() => { setRunning(false); sound.playSelect(); }} className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow cursor-pointer">⏸ Pausar</button>
                )}
                <button onClick={() => { setRunning(false); setRemainingSec(pomodoroMinutes*60); setCelebrating(false); sound.playSelect(); }} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 cursor-pointer">Reiniciar</button>
              </div>

              <p className="text-[11px] text-slate-500 text-center">LEON te acompaña mientras trabajás. No interactúa, solo te motiva. Al terminar celebra contigo. Configurable en Panel de Padres por cada niño.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
