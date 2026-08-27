// Web Audio API procedural sound synthesizer & RPG background music (100% Offline, no external mp3 assets needed)

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
    this.updateBgmGain();
    if (val && !this.isBgmPlaying) {
      this.startBgm();
    } else if (!val && this.isBgmPlaying) {
      this.stopBgm();
    }
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
    this.updateBgmGain();
    if (this.bgmVolume > 0 && !this.isBgmPlaying && this.musicEnabled) {
      this.startBgm();
    }
  }

  public getMusicVolume(): number {
    return Math.round(this.bgmVolume * 100);
  }

  private updateBgmGain() {
    if (this.bgmGain && this.ctx) {
      const targetGain = this.musicEnabled ? this.bgmVolume * 0.35 : 0;
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  // --- PROCEDURAL RPG BACKGROUND MUSIC ---

  public startBgm() {
    if (typeof window === 'undefined') return;
    this.initCtx();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.currentNoteIndex = 0;
    this.scheduleNextBgmPhrase();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmLoopTimer !== null) {
      window.clearTimeout(this.bgmLoopTimer);
      this.bgmLoopTimer = null;
    }
  }

  private scheduleNextBgmPhrase() {
    if (!this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx || !this.bgmGain) return;

    // Peaceful Medieval Town RPG Theme melody (Frequencies in Hz)
    // Scale: G Major / E Minor Pentatonic with warm acoustic chords
    const melodyTrack: { note: number; dur: number; bass: number; chord: number[] }[] = [
      { note: 392.0, dur: 0.5, bass: 196.0, chord: [293.66, 392.0, 493.88] }, // G4 (G chord)
      { note: 440.0, dur: 0.5, bass: 196.0, chord: [] },                     // A4
      { note: 493.88, dur: 1.0, bass: 196.0, chord: [293.66, 392.0, 493.88] }, // B4
      { note: 587.33, dur: 1.0, bass: 220.0, chord: [261.63, 329.63, 440.0] }, // D5 (Am chord)
      { note: 523.25, dur: 0.5, bass: 220.0, chord: [] },                     // C5
      { note: 493.88, dur: 0.5, bass: 220.0, chord: [] },                     // B4
      { note: 440.0, dur: 1.0, bass: 174.61, chord: [261.63, 349.23, 440.0] }, // A4 (F/D chord)
      { note: 392.0, dur: 1.0, bass: 196.0, chord: [293.66, 392.0, 493.88] }, // G4
      { note: 329.63, dur: 0.5, bass: 164.81, chord: [246.94, 329.63, 392.0] },// E4 (Em chord)
      { note: 392.0, dur: 0.5, bass: 164.81, chord: [] },                     // G4
      { note: 440.0, dur: 1.0, bass: 146.83, chord: [220.0, 293.66, 369.99] }, // A4 (D chord)
      { note: 493.88, dur: 0.5, bass: 146.83, chord: [] },                    // B4
      { note: 440.0, dur: 0.5, bass: 146.83, chord: [] },                    // A4
      { note: 392.0, dur: 1.5, bass: 196.0, chord: [293.66, 392.0, 493.88] }, // G4 (Resolved)
      { note: 0, dur: 0.5, bass: 0, chord: [] },                              // Rest
    ];

    const current = melodyTrack[this.currentNoteIndex];
    const now = this.ctx.currentTime;
    const noteDuration = current.dur * 0.85;

    // 1. Play Melody Flute/Harp Note
    if (current.note > 0 && this.musicEnabled && this.bgmVolume > 0) {
      try {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(current.note, now);

        // Soft attack and decay
        const peak = 0.12;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(peak, now + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + noteDuration);
      } catch {}
    }

    // 2. Play Gentle Bass Note
    if (current.bass > 0 && this.musicEnabled && this.bgmVolume > 0) {
      try {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(current.bass / 2, now);

        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration * 1.2);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + noteDuration * 1.2);
      } catch {}
    }

    // 3. Play Warm Acoustic Chord Harmonies
    if (current.chord.length > 0 && this.musicEnabled && this.bgmVolume > 0) {
      current.chord.forEach((freq) => {
        if (!this.ctx || !this.bgmGain) return;
        try {
          const chordOsc = this.ctx.createOscillator();
          const chordGain = this.ctx.createGain();
          chordOsc.type = 'triangle';
          chordOsc.frequency.setValueAtTime(freq, now);

          chordGain.gain.setValueAtTime(0.001, now);
          chordGain.gain.linearRampToValueAtTime(0.03, now + 0.08);
          chordGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration * 1.4);

          chordOsc.connect(chordGain);
          chordGain.connect(this.bgmGain);

          chordOsc.start(now);
          chordOsc.stop(now + noteDuration * 1.4);
        } catch {}
      });
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % melodyTrack.length;

    // Schedule next beat in ms
    const stepTimeMs = current.dur * 600;
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

