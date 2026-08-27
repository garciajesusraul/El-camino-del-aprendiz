// Web Audio API procedural sound synthesizer & RPG background music (100% Offline, no external mp3 assets needed)
// Multi-scene BGM with crossfade + ambient nature layers

export type SceneBgmType = 'HOUSE' | 'PLAZA' | 'MATERIA_MAP' | 'CITY_MAP';

type BgmNote = { note: number; dur: number; bass: number; chord: number[] };

class SoundFX {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private sfxVolume: number = 0.8; // 0 to 1.0
  private bgmVolume: number = 0.5; // 0 to 1.0

  // BGM playback nodes & timer
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmLoopTimer: number | null = null;
  private currentNoteIndex: number = 0;

  // Scene-aware BGM state
  private currentScene: SceneBgmType = 'HOUSE';
  private currentMateriaId: string | null = null;
  private sceneTransitionTimer: number | null = null;
  private birdTimer: number | null = null;
  private ambientTimers: number[] = [];
  private windNodes: { src: AudioBufferSourceNode; gain: GainNode; filter: BiquadFilterNode } | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (!this.sfxGain) {
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);
      }
      if (!this.bgmGain) {
        this.bgmGain = this.ctx.createGain();
        const effectiveBgm = this.musicEnabled ? this.bgmVolume * 0.35 : 0;
        this.bgmGain.gain.setValueAtTime(effectiveBgm, this.ctx.currentTime);
        this.bgmGain.connect(this.ctx.destination);
      }
    }
  }

  // --- VOLUME & ENABLE CONTROLS ---

  public setSfxEnabled(val: boolean) {
    this.sfxEnabled = val;
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setMusicEnabled(val: boolean) {
    this.musicEnabled = val;
    this.updateBgmGain(true);
    if (val && !this.isBgmPlaying) {
      this.startBgm();
    } else if (!val && this.isBgmPlaying) {
      this.stopBgm();
    }
    if (!val) this.clearAmbient();
    else if (this.isBgmPlaying) this.startAmbientForScene();
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public setEnabled(val: boolean) {
    this.setSfxEnabled(val);
    this.setMusicEnabled(val);
  }

  public isEnabled(): boolean {
    return this.sfxEnabled || this.musicEnabled;
  }

  public setVolume(val: number) {
    this.setSfxVolume(val);
  }

  public getVolume(): number {
    return Math.round(this.sfxVolume * 100);
  }

  public setSfxVolume(val: number) {
    if (val > 1) {
      this.sfxVolume = Math.max(0, Math.min(1, val / 100));
    } else {
      this.sfxVolume = Math.max(0, Math.min(1, val));
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public getSfxVolume(): number {
    return Math.round(this.sfxVolume * 100);
  }

  public setMusicVolume(val: number) {
    if (val > 1) {
      this.bgmVolume = Math.max(0, Math.min(1, val / 100));
    } else {
      this.bgmVolume = Math.max(0, Math.min(1, val));
    }
    this.updateBgmGain(true);
    if (this.bgmVolume > 0 && !this.isBgmPlaying && this.musicEnabled) {
      this.startBgm();
    } else if (this.bgmVolume === 0 && this.isBgmPlaying) {
      this.updateBgmGain(true);
    }
  }

  public getMusicVolume(): number {
    return Math.round(this.bgmVolume * 100);
  }

  public getIsBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public getCurrentScene(): SceneBgmType {
    return this.currentScene;
  }

  public getCurrentMateriaId(): string | null {
    return this.currentMateriaId;
  }

  private updateBgmGain(withRamp: boolean = true) {
    if (this.bgmGain && this.ctx) {
      const targetGain = this.musicEnabled ? this.bgmVolume * 0.35 : 0;
      const now = this.ctx.currentTime;
      try {
        if (withRamp) {
          const cur = this.bgmGain.gain.value;
          this.bgmGain.gain.cancelScheduledValues(now);
          this.bgmGain.gain.setValueAtTime(Math.max(0.0001, cur), now);
          this.bgmGain.gain.linearRampToValueAtTime(targetGain, now + 0.8);
        } else {
          this.bgmGain.gain.cancelScheduledValues(now);
          this.bgmGain.gain.setValueAtTime(targetGain, now);
        }
      } catch {
        try {
          this.bgmGain.gain.setValueAtTime(targetGain, now);
        } catch {}
      }
    }
  }

  // --- SCENE BGM API ---

  /**
   * Cambia la escena BGM. Soporta crossfade suave.
   * Mantiene compatibilidad con startBgm/stopBgm existentes.
   */
  public setScene(scene: SceneBgmType, materiaId?: string) {
    const normMateria = materiaId || null;
    const sceneChanged = this.currentScene !== scene || this.currentMateriaId !== normMateria;
    if (!sceneChanged) {
      // Si no estaba sonando y ahora debería sonar, asegúrate de arrancar
      if (this.musicEnabled && this.bgmVolume > 0 && !this.isBgmPlaying) {
        this.startBgm();
      }
      return;
    }
    this.currentScene = scene;
    this.currentMateriaId = normMateria;

    if (!this.musicEnabled || this.bgmVolume <= 0) {
      // Solo actualiza state, sin reproducir
      this.clearAmbient();
      return;
    }

    if (!this.isBgmPlaying) {
      this.currentNoteIndex = 0;
      this.startBgm();
      return;
    }

    // Crossfade suave: fade-out parcial, luego reset y fade-in
    this.crossfadeToScene();
  }

  /**
   * Alias explícito pedido por la tarea. Inicia BGM de la escena indicada.
   */
  public playSceneBgm(scene: SceneBgmType, materiaId?: string) {
    // Actualiza estado y fuerza inicio si no estaba sonando
    this.currentScene = scene;
    this.currentMateriaId = materiaId || null;
    if (!this.musicEnabled || this.bgmVolume <= 0) return;
    if (this.isBgmPlaying) {
      this.crossfadeToScene();
    } else {
      this.currentNoteIndex = 0;
      this.startBgm();
    }
  }

  private crossfadeToScene() {
    this.initCtx();
    if (!this.ctx || !this.bgmGain) {
      this.currentNoteIndex = 0;
      this.scheduleNextBgmPhrase();
      return;
    }
    const now = this.ctx.currentTime;
    try {
      const cur = this.bgmGain.gain.value;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(Math.max(0.0001, cur), now);
      this.bgmGain.gain.linearRampToValueAtTime(0.001, now + 0.45);
    } catch {}

    this.clearAmbient(false);

    if (this.sceneTransitionTimer !== null) {
      window.clearTimeout(this.sceneTransitionTimer);
      this.sceneTransitionTimer = null;
    }
    if (this.bgmLoopTimer !== null) {
      window.clearTimeout(this.bgmLoopTimer);
      this.bgmLoopTimer = null;
    }

    this.sceneTransitionTimer = window.setTimeout(() => {
      this.sceneTransitionTimer = null;
      this.currentNoteIndex = 0;
      // Fade-in hacia el target normal
      this.updateBgmGain(true);
      this.startAmbientForScene();
      // Continuar loop (scheduleNext se encarga de reprogramar)
      if (this.isBgmPlaying) {
        this.scheduleNextBgmPhrase();
      } else {
        this.isBgmPlaying = true;
        this.scheduleNextBgmPhrase();
      }
    }, 480);
  }

  // --- AMBIENT LAYERS ---
  private clearAmbient(clearWind: boolean = true) {
    if (this.birdTimer !== null) {
      window.clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }
    this.ambientTimers.forEach((t) => window.clearTimeout(t));
    this.ambientTimers = [];
    if (clearWind && this.windNodes) {
      try {
        this.windNodes.gain.gain.cancelScheduledValues(this.ctx?.currentTime || 0);
        this.windNodes.gain.gain.linearRampToValueAtTime(0.001, (this.ctx?.currentTime || 0) + 0.3);
      } catch {}
      window.setTimeout(() => {
        try {
          this.windNodes?.src.stop();
        } catch {}
        try {
          this.windNodes?.src.disconnect();
          this.windNodes?.gain.disconnect();
          this.windNodes?.filter.disconnect();
        } catch {}
        this.windNodes = null;
      }, 350);
    } else if (!clearWind && this.windNodes) {
      // En crossfade mantenemos viento pero lo atenuamos para luego re-crearlo
      try {
        this.windNodes.src.stop();
      } catch {}
      try {
        this.windNodes.src.disconnect();
        this.windNodes.gain.disconnect();
        this.windNodes.filter.disconnect();
      } catch {}
      this.windNodes = null;
    }
  }

  private startAmbientForScene() {
    this.clearAmbient(true);
    if (!this.musicEnabled || this.bgmVolume <= 0) return;
    if (this.currentScene === 'PLAZA') {
      this.startWindLoop();
      this.scheduleNextBirdChirp();
    } else if (this.currentScene === 'MATERIA_MAP' || this.currentScene === 'CITY_MAP') {
      // Para ciencias: viento suave adicional si es ciencias
      if (this.currentMateriaId === 'ciencias') {
        this.startWindLoop(0.012, 500);
      }
    }
  }

  private startWindLoop(baseGain: number = 0.018, cutoff: number = 700) {
    if (!this.ctx || !this.bgmGain || !this.musicEnabled) return;
    try {
      const ctx = this.ctx;
      const bufferSize = Math.floor(ctx.sampleRate * 1.8);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // viento rosado filtrado suave: noise + interpolación
        data[i] = (Math.random() * 2 - 1) * 0.5;
        if (i > 0) data[i] = (data[i] + data[i - 1]) * 0.5;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, ctx.currentTime);
      filter.Q.setValueAtTime(0.7, ctx.currentTime);

      const gain = ctx.createGain();
      const targetVol = baseGain * (this.bgmVolume * 0.9 + 0.1);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 1.2);

      // Leve modulación de frecuencia para sensación de ráfaga
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.07 + Math.random() * 0.05, ctx.currentTime);
      lfoGain.gain.setValueAtTime(120, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);
      src.start();

      // Guarda para cleanup; detén lfo al limpiar (no hace falta retener)
      this.windNodes = { src, gain, filter };

      // Modulación sutil de ganancia como ráfagas
      const gust = () => {
        if (!this.ctx || !this.windNodes || this.currentScene !== 'PLAZA' && this.currentMateriaId !== 'ciencias') return;
        try {
          const now = this.ctx.currentTime;
          const cur = this.windNodes.gain.gain.value;
          const next = targetVol * (0.7 + Math.random() * 0.6);
          this.windNodes.gain.gain.cancelScheduledValues(now);
          this.windNodes.gain.gain.setValueAtTime(cur, now);
          this.windNodes.gain.gain.linearRampToValueAtTime(next, now + 2.5 + Math.random() * 2);
        } catch {}
        const t = window.setTimeout(gust, 3000 + Math.random() * 4000);
        this.ambientTimers.push(t);
      };
      const firstGust = window.setTimeout(gust, 3500);
      this.ambientTimers.push(firstGust);
    } catch {}
  }

  private scheduleNextBirdChirp() {
    if (this.currentScene !== 'PLAZA') return;
    if (!this.musicEnabled || this.bgmVolume <= 0) return;
    const delay = 1400 + Math.random() * 2800;
    this.birdTimer = window.setTimeout(() => {
      this.playBirdChirp();
      // Doble pío ocasional
      if (Math.random() < 0.35) {
        const t = window.setTimeout(() => this.playBirdChirp(), 180 + Math.random() * 120);
        this.ambientTimers.push(t);
      }
      this.scheduleNextBirdChirp();
    }, delay);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.bgmGain || !this.musicEnabled || this.bgmVolume <= 0) return;
    if (this.currentScene !== 'PLAZA') return;
    try {
      const now = this.ctx.currentTime;
      const base = 1800 + Math.random() * 700; // 1800-2500hz píos
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(base, now);
      filter.Q.setValueAtTime(1.2, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(base, now);
      // trino ascendente-descendente
      osc.frequency.linearRampToValueAtTime(base + 250 + Math.random() * 300, now + 0.06);
      osc.frequency.linearRampToValueAtTime(base - 120, now + 0.12);

      const peak = 0.055 * (this.bgmVolume * 0.8 + 0.2);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(now);
      osc.stop(now + 0.18);

      // cola de reverberito corta con segundo oscilador una octava abajo muy suave
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(base * 0.5, now);
      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.linearRampToValueAtTime(peak * 0.18, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(this.bgmGain);
      osc2.start(now + 0.01);
      osc2.stop(now + 0.23);
    } catch {}
  }

  // --- PROCEDURAL RPG BACKGROUND MUSIC (multi-scene) ---

  public startBgm() {
    if (typeof window === 'undefined') return;
    this.initCtx();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    // No reseteamos índice si venimos de crossfade externo; si es primera vez, 0
    if (this.currentNoteIndex >= 999) this.currentNoteIndex = 0;
    this.updateBgmGain(true);
    this.startAmbientForScene();
    this.scheduleNextBgmPhrase();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmLoopTimer !== null) {
      window.clearTimeout(this.bgmLoopTimer);
      this.bgmLoopTimer = null;
    }
    if (this.sceneTransitionTimer !== null) {
      window.clearTimeout(this.sceneTransitionTimer);
      this.sceneTransitionTimer = null;
    }
    this.clearAmbient(true);
    // fade out
    if (this.bgmGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        const cur = this.bgmGain.gain.value;
        this.bgmGain.gain.cancelScheduledValues(now);
        this.bgmGain.gain.setValueAtTime(cur, now);
        this.bgmGain.gain.linearRampToValueAtTime(0, now + 0.5);
      } catch {}
    }
  }

  private getMelodyForCurrentScene(): { track: BgmNote[]; tempoFactor: number; color: string } {
    const isCity = this.currentScene === 'CITY_MAP';
    const materia = this.currentMateriaId || 'matematicas';

    // HOUSE: lullaby acogedor piano triangulo 220-440hz lento
    if (this.currentScene === 'HOUSE') {
      const track: BgmNote[] = [
        { note: 261.63, dur: 1.0, bass: 130.81, chord: [196.0, 261.63] }, // C4
        { note: 329.63, dur: 1.0, bass: 146.83, chord: [] }, // E4
        { note: 392.0, dur: 1.0, bass: 196.0, chord: [261.63, 329.63] }, // G4
        { note: 440.0, dur: 0.9, bass: 220.0, chord: [] }, // A4
        { note: 392.0, dur: 1.2, bass: 196.0, chord: [246.94, 311.13] },
        { note: 349.23, dur: 0.9, bass: 174.61, chord: [] }, // F4
        { note: 329.63, dur: 1.0, bass: 164.81, chord: [220.0, 261.63] },
        { note: 293.66, dur: 1.4, bass: 146.83, chord: [196.0, 246.94] }, // D4 larga resol.
        { note: 0, dur: 0.6, bass: 0, chord: [] },
        { note: 246.94, dur: 0.8, bass: 130.81, chord: [196.0, 246.94] }, // B3
        { note: 261.63, dur: 0.8, bass: 130.81, chord: [] },
        { note: 329.63, dur: 1.2, bass: 164.81, chord: [261.63, 329.63, 392.0] },
        { note: 392.0, dur: 1.4, bass: 196.0, chord: [] },
        { note: 0, dur: 0.5, bass: 0, chord: [] },
      ];
      return { track, tempoFactor: 1.35, color: 'house' };
    }

    // PLAZA: ambient naturaleza + melodía tranquila tipo bosque
    if (this.currentScene === 'PLAZA') {
      const track: BgmNote[] = [
        { note: 392.0, dur: 0.7, bass: 98.0, chord: [246.94, 311.13, 392.0] },
        { note: 440.0, dur: 0.7, bass: 98.0, chord: [] },
        { note: 493.88, dur: 1.0, bass: 123.47, chord: [293.66, 369.99, 440.0] },
        { note: 523.25, dur: 0.9, bass: 130.81, chord: [] },
        { note: 493.88, dur: 0.7, bass: 123.47, chord: [] },
        { note: 440.0, dur: 1.2, bass: 110.0, chord: [220.0, 277.18, 329.63] },
        { note: 392.0, dur: 1.0, bass: 98.0, chord: [] },
        { note: 329.63, dur: 0.7, bass: 82.41, chord: [196.0, 246.94] },
        { note: 349.23, dur: 0.7, bass: 87.31, chord: [] },
        { note: 392.0, dur: 1.3, bass: 98.0, chord: [246.94, 311.13, 392.0] },
        { note: 0, dur: 0.5, bass: 0, chord: [] },
        { note: 440.0, dur: 0.6, bass: 110.0, chord: [261.63, 329.63] },
        { note: 493.88, dur: 0.6, bass: 123.47, chord: [] },
        { note: 587.33, dur: 1.1, bass: 130.81, chord: [311.13, 392.0, 493.88] },
        { note: 523.25, dur: 0.9, bass: 130.81, chord: [] },
        { note: 0, dur: 0.4, bass: 0, chord: [] },
      ];
      return { track, tempoFactor: 1.0, color: 'plaza' };
    }

    // MATERIA_MAP / CITY_MAP: 7 variaciones por materia
    const materiaTrack = this.getMateriaTrack(materia, isCity);
    return materiaTrack;
  }

  private getMateriaTrack(
    materiaId: string,
    isCity: boolean
  ): { track: BgmNote[]; tempoFactor: number; color: string } {
    // Factor de intensidad para CITY_MAP (más intenso: más rápido y un poco más fuerte)
    const intensity = isCity ? 0.78 : 1.0;
    switch (materiaId) {
      case 'matematicas': {
        // arpegios lógicos/cristalinos 300-600hz - triangle cristal
        const base: BgmNote[] = [
          { note: 329.63, dur: 0.35, bass: 164.81, chord: [] },
          { note: 440.0, dur: 0.35, bass: 164.81, chord: [] },
          { note: 523.25, dur: 0.35, bass: 164.81, chord: [329.63, 440.0] },
          { note: 659.25, dur: 0.55, bass: 130.81, chord: [] },
          { note: 523.25, dur: 0.35, bass: 130.81, chord: [] },
          { note: 440.0, dur: 0.35, bass: 164.81, chord: [] },
          { note: 392.0, dur: 0.45, bass: 196.0, chord: [246.94, 311.13] },
          { note: 329.63, dur: 0.55, bass: 164.81, chord: [] },
          { note: 0, dur: 0.25, bass: 0, chord: [] },
          { note: 349.23, dur: 0.35, bass: 174.61, chord: [] },
          { note: 466.16, dur: 0.35, bass: 174.61, chord: [] },
          { note: 587.33, dur: 0.35, bass: 174.61, chord: [349.23, 466.16] },
          { note: 659.25, dur: 0.6, bass: 146.83, chord: [] },
          { note: 0, dur: 0.3, bass: 0, chord: [] },
        ];
        return { track: base, tempoFactor: 0.95 * intensity, color: 'matematicas' };
      }
      case 'lenguaje': {
        // cuerdas suaves - legato sine+triangle 250-450hz
        const base: BgmNote[] = [
          { note: 293.66, dur: 1.1, bass: 146.83, chord: [233.08, 293.66, 369.99] },
          { note: 329.63, dur: 0.9, bass: 146.83, chord: [] },
          { note: 349.23, dur: 1.1, bass: 174.61, chord: [261.63, 329.63, 415.3] },
          { note: 392.0, dur: 1.0, bass: 196.0, chord: [] },
          { note: 440.0, dur: 0.9, bass: 220.0, chord: [329.63, 440.0] },
          { note: 392.0, dur: 1.2, bass: 196.0, chord: [246.94, 311.13, 392.0] },
          { note: 329.63, dur: 0.9, bass: 164.81, chord: [] },
          { note: 293.66, dur: 1.3, bass: 146.83, chord: [233.08, 293.66] },
          { note: 0, dur: 0.5, bass: 0, chord: [] },
        ];
        return { track: base, tempoFactor: 1.15 * intensity, color: 'lenguaje' };
      }
      case 'ciencias': {
        // pad verde bosque - sustained pad largo, raíces graves 130-300hz
        const base: BgmNote[] = [
          { note: 196.0, dur: 1.4, bass: 98.0, chord: [146.83, 196.0, 246.94] },
          { note: 220.0, dur: 1.2, bass: 110.0, chord: [] },
          { note: 246.94, dur: 1.4, bass: 123.47, chord: [174.61, 220.0, 293.66] },
          { note: 293.66, dur: 1.2, bass: 146.83, chord: [] },
          { note: 329.63, dur: 1.0, bass: 164.81, chord: [196.0, 246.94, 329.63] },
          { note: 293.66, dur: 1.3, bass: 146.83, chord: [] },
          { note: 246.94, dur: 1.4, bass: 123.47, chord: [146.83, 196.0] },
          { note: 220.0, dur: 1.6, bass: 110.0, chord: [164.81, 220.0, 261.63] },
          { note: 0, dur: 0.6, bass: 0, chord: [] },
        ];
        return { track: base, tempoFactor: 1.4 * intensity, color: 'ciencias' };
      }
      case 'historia': {
        // fanfarria épica leve - sawtooth brillante 180-450hz
        const base: BgmNote[] = [
          { note: 196.0, dur: 0.55, bass: 98.0, chord: [146.83, 196.0, 246.94] },
          { note: 246.94, dur: 0.55, bass: 98.0, chord: [] },
          { note: 293.66, dur: 0.55, bass: 130.81, chord: [196.0, 246.94, 293.66] },
          { note: 392.0, dur: 0.9, bass: 98.0, chord: [] },
          { note: 349.23, dur: 0.55, bass: 110.0, chord: [] },
          { note: 329.63, dur: 0.55, bass: 110.0, chord: [164.81, 220.0, 261.63] },
          { note: 293.66, dur: 1.1, bass: 146.83, chord: [220.0, 277.18, 329.63] },
          { note: 220.0, dur: 0.55, bass: 110.0, chord: [] },
          { note: 246.94, dur: 0.55, bass: 110.0, chord: [] },
          { note: 293.66, dur: 0.9, bass: 146.83, chord: [196.0, 293.66, 349.23] },
          { note: 392.0, dur: 1.3, bass: 98.0, chord: [] },
          { note: 0, dur: 0.4, bass: 0, chord: [] },
        ];
        return { track: base, tempoFactor: 0.92 * intensity, color: 'historia' };
      }
      case 'luces':
      case 'arte': {
        // arpegio colorido - cromático rápido 350-800hz
        const base: BgmNote[] = [
          { note: 392.0, dur: 0.28, bass: 196.0, chord: [] },
          { note: 493.88, dur: 0.28, bass: 196.0, chord: [] },
          { note: 587.33, dur: 0.28, bass: 220.0, chord: [392.0, 493.88] },
          { note: 659.25, dur: 0.4, bass: 220.0, chord: [] },
          { note: 783.99, dur: 0.45, bass: 246.94, chord: [] },
          { note: 659.25, dur: 0.28, bass: 220.0, chord: [] },
          { note: 587.33, dur: 0.28, bass: 196.0, chord: [] },
          { note: 493.88, dur: 0.28, bass: 196.0, chord: [246.94, 329.63] },
          { note: 440.0, dur: 0.3, bass: 220.0, chord: [] },
          { note: 523.25, dur: 0.28, bass: 220.0, chord: [] },
          { note: 659.25, dur: 0.28, bass: 246.94, chord: [415.3, 523.25] },
          { note: 783.99, dur: 0.5, bass: 196.0, chord: [] },
          { note: 0, dur: 0.25, bass: 0, chord: [] },
          { note: 349.23, dur: 0.28, bass: 174.61, chord: [] },
          { note: 440.0, dur: 0.28, bass: 174.61, chord: [] },
          { note: 554.37, dur: 0.5, bass: 174.61, chord: [349.23, 440.0, 554.37] },
        ];
        return { track: base, tempoFactor: 0.85 * intensity, color: 'luces' };
      }
      case 'sonidos':
      case 'musica': {
        // ritmo jazz - swing 7ths, sincopa
        const base: BgmNote[] = [
          { note: 261.63, dur: 0.5, bass: 130.81, chord: [196.0, 261.63, 311.13, 392.0] },
          { note: 329.63, dur: 0.3, bass: 130.81, chord: [] },
          { note: 349.23, dur: 0.5, bass: 130.81, chord: [] },
          { note: 392.0, dur: 0.7, bass: 146.83, chord: [220.0, 277.18, 329.63, 392.0] },
          { note: 440.0, dur: 0.3, bass: 146.83, chord: [] },
          { note: 466.16, dur: 0.5, bass: 146.83, chord: [] },
          { note: 392.0, dur: 0.5, bass: 130.81, chord: [196.0, 261.63, 311.13] },
          { note: 329.63, dur: 0.5, bass: 130.81, chord: [] },
          { note: 311.13, dur: 0.3, bass: 123.47, chord: [] },
          { note: 293.66, dur: 0.7, bass: 123.47, chord: [233.08, 293.66, 349.23, 415.3] },
          { note: 349.23, dur: 0.5, bass: 130.81, chord: [] },
          { note: 392.0, dur: 0.9, bass: 130.81, chord: [261.63, 329.63, 392.0, 466.16] },
          { note: 0, dur: 0.35, bass: 0, chord: [] },
        ];
        return { track: base, tempoFactor: 0.88 * intensity, color: 'sonidos' };
      }
      case 'ingles': {
        // british clock tintineo - bell sine agudo 800-1400hz + ticks
        const base: BgmNote[] = [
          { note: 1046.5, dur: 0.45, bass: 130.81, chord: [523.25, 659.25] }, // C6 bell
          { note: 0, dur: 0.2, bass: 65.41, chord: [] }, // tick grave
          { note: 1318.51, dur: 0.45, bass: 130.81, chord: [] }, // E6
          { note: 0, dur: 0.15, bass: 65.41, chord: [] },
          { note: 1174.66, dur: 0.5, bass: 146.83, chord: [587.33, 739.99] }, // D6
          { note: 1046.5, dur: 0.6, bass: 130.81, chord: [] },
          { note: 0, dur: 0.25, bass: 65.41, chord: [] },
          { note: 987.77, dur: 0.45, bass: 123.47, chord: [493.88, 622.25] },
          { note: 1046.5, dur: 0.45, bass: 130.81, chord: [] },
          { note: 1318.51, dur: 0.7, bass: 130.81, chord: [659.25, 783.99, 1046.5] },
          { note: 0, dur: 0.3, bass: 65.41, chord: [] },
          { note: 783.99, dur: 0.5, bass: 98.0, chord: [392.0, 493.88] },
          { note: 880.0, dur: 0.5, bass: 110.0, chord: [] },
          { note: 1046.5, dur: 0.9, bass: 130.81, chord: [523.25, 659.25, 783.99] },
        ];
        return { track: base, tempoFactor: 1.0 * intensity, color: 'ingles' };
      }
      case 'kinder_actividades':
      case 'kinder': {
        const base: BgmNote[] = [
          { note: 392.0, dur: 0.6, bass: 196.0, chord: [261.63, 329.63] },
          { note: 440.0, dur: 0.6, bass: 196.0, chord: [] },
          { note: 493.88, dur: 0.6, bass: 220.0, chord: [] },
          { note: 523.25, dur: 0.9, bass: 220.0, chord: [329.63, 415.3, 493.88] },
          { note: 493.88, dur: 0.5, bass: 220.0, chord: [] },
          { note: 440.0, dur: 0.5, bass: 196.0, chord: [] },
          { note: 392.0, dur: 1.0, bass: 196.0, chord: [246.94, 311.13, 392.0] },
          { note: 329.63, dur: 0.6, bass: 164.81, chord: [] },
          { note: 392.0, dur: 0.6, bass: 164.81, chord: [] },
          { note: 440.0, dur: 1.0, bass: 196.0, chord: [261.63, 329.63, 440.0] },
          { note: 0, dur: 0.4, bass: 0, chord: [] },
        ];
        return { track: base, tempoFactor: 1.05 * intensity, color: 'kinder' };
      }
      default: {
        // fallback matematicas crystal
        const base: BgmNote[] = [
          { note: 392.0, dur: 0.5, bass: 196.0, chord: [293.66, 392.0] },
          { note: 440.0, dur: 0.5, bass: 196.0, chord: [] },
          { note: 493.88, dur: 1.0, bass: 196.0, chord: [] },
          { note: 523.25, dur: 0.8, bass: 220.0, chord: [261.63, 329.63] },
          { note: 0, dur: 0.3, bass: 0, chord: [] },
        ];
        return { track: base, tempoFactor: 1.0 * intensity, color: 'default' };
      }
    }
  }

  private scheduleNextBgmPhrase() {
    if (!this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx || !this.bgmGain) return;

    const { track: melodyTrack, tempoFactor } = this.getMelodyForCurrentScene();
    // asegurar índice dentro de rango tras cambio de pista
    if (this.currentNoteIndex >= melodyTrack.length) this.currentNoteIndex = 0;

    const current = melodyTrack[this.currentNoteIndex];
    const now = this.ctx.currentTime;
    // Para CITY_MAP, un poco más corto y fuerte; para HOUSE más suave
    const isCity = this.currentScene === 'CITY_MAP';
    const isHouse = this.currentScene === 'HOUSE';
    const isPlaza = this.currentScene === 'PLAZA';
    const noteDuration = current.dur * 0.85;

    // 1. Melodía principal - timbre según escena
    if (current.note > 0 && this.musicEnabled && this.bgmVolume > 0) {
      try {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Selección de timbre por escena/materia
        let oscType: OscillatorType = 'sine';
        let peak = 0.12;
        let filterFreq = 3500;

        if (isHouse) {
          oscType = 'triangle'; // piano acogedor
          peak = 0.09;
          filterFreq = 1800;
        } else if (isPlaza) {
          oscType = 'sine'; // flauta bosque
          peak = 0.11;
          filterFreq = 2800;
        } else if (this.currentMateriaId === 'matematicas') {
          oscType = 'triangle';
          peak = isCity ? 0.14 : 0.11;
          filterFreq = 4200;
        } else if (this.currentMateriaId === 'lenguaje') {
          oscType = 'triangle';
          peak = 0.10;
          filterFreq = 2000;
        } else if (this.currentMateriaId === 'ciencias') {
          oscType = 'triangle';
          peak = 0.095;
          filterFreq = 1600;
        } else if (this.currentMateriaId === 'historia') {
          oscType = 'sawtooth'; // fanfarria épica leve
          peak = isCity ? 0.13 : 0.10;
          filterFreq = 2200;
        } else if (this.currentMateriaId === 'luces' || this.currentMateriaId === 'arte') {
          oscType = 'sine';
          peak = isCity ? 0.13 : 0.10;
          filterFreq = 3800;
        } else if (this.currentMateriaId === 'sonidos' || this.currentMateriaId === 'musica') {
          oscType = 'square';
          peak = 0.07;
          filterFreq = 2500;
        } else if (this.currentMateriaId === 'ingles') {
          oscType = 'sine'; // bell tintineo
          peak = isCity ? 0.15 : 0.12;
          filterFreq = 5000;
        }

        if (isCity) peak *= 1.18;

        osc.type = oscType;
        osc.frequency.setValueAtTime(current.note, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, now);
        filter.Q.setValueAtTime(0.6, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(peak, now + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + noteDuration);

        // Capa extra brillante para CITY_MAP (octava suave)
        if (isCity && current.note > 0 && this.currentMateriaId !== 'ciencias') {
          const osc2 = this.ctx.createOscillator();
          const g2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(current.note * 0.5, now);
          g2.gain.setValueAtTime(0.0001, now);
          g2.gain.linearRampToValueAtTime(peak * 0.22, now + 0.05);
          g2.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration * 1.1);
          osc2.connect(g2);
          g2.connect(this.bgmGain);
          osc2.start(now + 0.02);
          osc2.stop(now + noteDuration * 1.1);
        }
      } catch {}
    }

    // 2. Bajo suave
    if (current.bass > 0 && this.musicEnabled && this.bgmVolume > 0) {
      try {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = this.currentScene === 'HOUSE' || this.currentMateriaId === 'ciencias' ? 'sine' : 'triangle';
        const bassFreq = this.currentMateriaId === 'ingles' && current.bass === 65.41 ? 65.41 : current.bass / (this.currentScene === 'HOUSE' ? 1.5 : 2);
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        const bPeak = isCity ? 0.11 : isHouse ? 0.08 : 0.085;
        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(bPeak, now + 0.06);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration * 1.25);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + noteDuration * 1.25);
      } catch {}
    }

    // 3. Acordes cálidos (filtrados según escena)
    if (current.chord.length > 0 && this.musicEnabled && this.bgmVolume > 0) {
      current.chord.forEach((freq) => {
        if (!this.ctx || !this.bgmGain) return;
        try {
          const chordOsc = this.ctx.createOscillator();
          const chordGain = this.ctx.createGain();
          const cFilter = this.ctx.createBiquadFilter();
          chordOsc.type = this.currentMateriaId === 'historia' ? 'sawtooth' : this.currentMateriaId === 'ingles' ? 'sine' : 'triangle';
          chordOsc.frequency.setValueAtTime(freq, now);

          cFilter.type = 'lowpass';
          cFilter.frequency.setValueAtTime(isPlaza ? 2200 : isHouse ? 1500 : 2600, now);

          const cPeak = isCity ? 0.038 : 0.028;
          chordGain.gain.setValueAtTime(0.001, now);
          chordGain.gain.linearRampToValueAtTime(cPeak, now + 0.09);
          chordGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration * 1.45);

          chordOsc.connect(cFilter);
          cFilter.connect(chordGain);
          chordGain.connect(this.bgmGain);

          chordOsc.start(now);
          chordOsc.stop(now + noteDuration * 1.45);
        } catch {}
      });
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % melodyTrack.length;

    // Tempo base 600ms * dur * tempoFactor; HOUSE más lento, CITY más rápido
    const stepTimeMs = current.dur * 600 * tempoFactor;
    this.bgmLoopTimer = window.setTimeout(() => {
      this.scheduleNextBgmPhrase();
    }, stepTimeMs);
  }

  // --- SOUND EFFECTS (SFX) ---

  public playStep() {
    if (!this.sfxEnabled || this.sfxVolume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 30, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.04);

      const vol = 0.04;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  public playSelect() {
    if (!this.sfxEnabled || this.sfxVolume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      const vol = 0.1;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }

  public playDoor() {
    if (!this.sfxEnabled || this.sfxVolume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.15);

      const vol = 0.08;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.17);
    } catch {}
  }

  public playSuccess() {
    if (!this.sfxEnabled || this.sfxVolume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        const vol = 0.12;
        gain.gain.setValueAtTime(vol, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.26);
      });
    } catch {}
  }

  public playCoin() {
    if (!this.sfxEnabled || this.sfxVolume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6

      const vol = 0.08;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }
}

export const sound = new SoundFX();
