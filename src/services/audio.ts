// MIDI BGM player liviano via Web Audio + @tonejs/midi - lee /assets/midi/*.mid y sintetiza con osciladores nativos
// Mantiene crossfade, loop suave y ambient layers. Placeholder mids en public/assets/midi/ (casa, plaza, matematicas...)

export type SceneBgmType = 'HOUSE' | 'PLAZA' | 'MATERIA_MAP' | 'CITY_MAP';

type BgmNote = { note: number; dur: number; bass: number; chord: number[] };

class SoundFX {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.70; // unificado 70% pedido

  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmLoopTimer: number | null = null;
  private currentNoteIndex: number = 0;

  private currentScene: SceneBgmType = 'HOUSE';
  private currentMateriaId: string | null = null;
  private sceneTransitionTimer: number | null = null;
  private birdTimer: number | null = null;
  private ambientTimers: number[] = [];
  private windNodes: { src: AudioBufferSourceNode; gain: GainNode; filter: BiquadFilterNode } | null = null;

  // MIDI state
  private midiCache = new Map<string, any>();
  private scheduledNodes: OscillatorNode[] = [];
  private midiLoopTimer: number | null = null;
  private midiDuration: number = 0;
  private useMidi: boolean = false;
  private musicMode: 'procedural' | 'midi' = 'procedural';

  public setMusicMode(mode: 'procedural' | 'midi') {
    if (this.musicMode === mode) return;
    this.musicMode = mode;
    this.useMidi = mode === 'midi';
    if (this.isBgmPlaying) {
      this.clearMidiSchedule(true);
      if (this.bgmLoopTimer){ window.clearTimeout(this.bgmLoopTimer); this.bgmLoopTimer=null; }
      this.currentNoteIndex=0;
      this.scheduleMidiOrFallback();
    }
  }
  public getMusicMode(){ return this.musicMode; }

  public resumeAfterInteraction() {
    this.initCtx();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().then(()=>{
        if (this.musicEnabled && this.bgmVolume>0) {
          if (!this.isBgmPlaying) this.startBgm(); else this.updateBgmGain(true);
        }
      }).catch(()=>{});
    } else if (this.musicEnabled && this.bgmVolume>0 && !this.isBgmPlaying) {
      this.startBgm();
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          // @ts-ignore
          this.ctx.onstatechange = () => {
            if (this.ctx?.state === 'closed' || this.ctx?.state === 'suspended') {
              // deja que el próximo gesto lo reanude
            }
          };
          if (this.ctx.state === 'suspended') {
            const resume = () => {
              this.ctx?.resume().then(()=> {
                if (this.musicEnabled && this.bgmVolume>0 && !this.isBgmPlaying) this.startBgm();
                else if (this.isBgmPlaying) this.updateBgmGain(true);
              }).catch(()=>{
                // si falla por dispositivo, recrea en próximo gesto
                try { this.ctx?.close(); } catch {}
                this.ctx = null;
                this.bgmGain = null; this.sfxGain = null;
              });
            };
            window.addEventListener('click', resume, { once: true });
            window.addEventListener('keydown', resume, { once: true });
            window.addEventListener('touchstart', resume, { once: true });
          }
        }
      } catch (e) {
        console.warn('[audio] AudioContext error, reintentará en próximo gesto', e);
        this.ctx = null; this.bgmGain=null; this.sfxGain=null;
        const retry=()=>{
          try { this.initCtx(); if (this.musicEnabled) this.startBgm(); } catch {}
        };
        window.addEventListener('click', retry, {once:true});
        return;
      }
    }
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(()=>{
        // si el dispositivo dio error, recrea
        try { this.ctx?.close(); } catch {}
        this.ctx=null; this.bgmGain=null; this.sfxGain=null;
      });
      if (!this.sfxGain) {
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);
      }
      if (!this.bgmGain) {
        this.bgmGain = this.ctx.createGain();
        const effectiveBgm = this.musicEnabled ? this.bgmVolume * 0.68 : 0;
        this.bgmGain.gain.setValueAtTime(effectiveBgm, this.ctx.currentTime);
        this.bgmGain.connect(this.ctx.destination);
      }
    }
  }

  public setSfxEnabled(val: boolean) { this.sfxEnabled = val; }
  public isSfxEnabled() { return this.sfxEnabled; }
  public setMusicEnabled(val: boolean) {
    this.musicEnabled = val;
    this.updateBgmGain(true);
    if (val && !this.isBgmPlaying) this.startBgm();
    else if (!val && this.isBgmPlaying) this.stopBgm();
    if (!val) this.clearAmbient();
    else if (this.isBgmPlaying) this.startAmbientForScene();
  }
  public isMusicEnabled() { return this.musicEnabled; }
  public setEnabled(val: boolean) { this.setSfxEnabled(val); this.setMusicEnabled(val); }
  public isEnabled() { return this.sfxEnabled || this.musicEnabled; }
  public setVolume(val: number) { this.setSfxVolume(val); }
  public getVolume() { return Math.round(this.sfxVolume * 100); }
  public setSfxVolume(val: number) {
    if (val > 1) this.sfxVolume = Math.max(0, Math.min(1, val / 100));
    else this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
  }
  public getSfxVolume() { return Math.round(this.sfxVolume * 100); }
  public setMusicVolume(val: number) {
    if (val > 1) this.bgmVolume = Math.max(0, Math.min(1, val / 100));
    else this.bgmVolume = Math.max(0, Math.min(1, val));
    this.updateBgmGain(true);
    if (this.bgmVolume > 0 && !this.isBgmPlaying && this.musicEnabled) this.startBgm();
    else if (this.bgmVolume === 0 && this.isBgmPlaying) this.updateBgmGain(true);
  }
  public getMusicVolume() { return Math.round(this.bgmVolume * 100); }
  public getIsBgmPlaying() { return this.isBgmPlaying; }
  public getCurrentScene() { return this.currentScene; }
  public getCurrentMateriaId() { return this.currentMateriaId; }

  private updateBgmGain(withRamp = true) {
    if (this.bgmGain && this.ctx) {
      const targetGain = this.musicEnabled ? this.bgmVolume * 0.68 : 0;
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
      } catch { try { this.bgmGain.gain.setValueAtTime(targetGain, now); } catch {} }
    }
  }

  public setScene(scene: SceneBgmType, materiaId?: string) {
    const normMateria = materiaId || null;
    const sceneChanged = this.currentScene !== scene || this.currentMateriaId !== normMateria;
    if (!sceneChanged) {
      if (this.musicEnabled && this.bgmVolume > 0 && !this.isBgmPlaying) this.startBgm();
      return;
    }
    this.currentScene = scene;
    this.currentMateriaId = normMateria;
    if (!this.musicEnabled || this.bgmVolume <= 0) { this.clearAmbient(); return; }
    if (!this.isBgmPlaying) { this.currentNoteIndex = 0; this.startBgm(); return; }
    this.crossfadeToScene();
  }

  public playSceneBgm(scene: SceneBgmType, materiaId?: string) {
    this.currentScene = scene;
    this.currentMateriaId = materiaId || null;
    if (!this.musicEnabled || this.bgmVolume <= 0) return;
    if (this.isBgmPlaying) this.crossfadeToScene();
    else { this.currentNoteIndex = 0; this.startBgm(); }
  }

  private crossfadeToScene() {
    this.initCtx();
    if (!this.ctx || !this.bgmGain) { this.currentNoteIndex = 0; this.scheduleMidiOrFallback(); return; }
    const now = this.ctx.currentTime;
    try {
      const cur = this.bgmGain.gain.value;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(Math.max(0.0001, cur), now);
      this.bgmGain.gain.linearRampToValueAtTime(0.001, now + 0.45);
    } catch {}
    this.clearMidiSchedule(false);
    this.clearAmbient(false);
    if (this.sceneTransitionTimer !== null) { window.clearTimeout(this.sceneTransitionTimer); this.sceneTransitionTimer = null; }
    if (this.bgmLoopTimer !== null) { window.clearTimeout(this.bgmLoopTimer); this.bgmLoopTimer = null; }
    if (this.midiLoopTimer !== null) { window.clearTimeout(this.midiLoopTimer); this.midiLoopTimer = null; }
    this.sceneTransitionTimer = window.setTimeout(() => {
      this.sceneTransitionTimer = null;
      this.currentNoteIndex = 0;
      this.updateBgmGain(true);
      this.startAmbientForScene();
      if (this.isBgmPlaying) this.scheduleMidiOrFallback();
      else { this.isBgmPlaying = true; this.scheduleMidiOrFallback(); }
    }, 480);
  }

  // --- MIDI handling ---
  private getMidiName(): string {
    if (this.currentScene === 'HOUSE') return 'casa';
    if (this.currentScene === 'PLAZA') return 'plaza';
    const m = (this.currentMateriaId || 'matematicas').toLowerCase();
    const map: Record<string,string> = { luces: 'luces', arte: 'luces', sonidos: 'sonidos', musica: 'sonidos', kinder_actividades: 'kinder', kinder: 'kinder' };
    return map[m] || m;
  }

  private async loadMidi(name: string): Promise<any|null> {
    if (this.midiCache.has(name)) return this.midiCache.get(name);
    try {
      const res = await fetch(`/assets/midi/${name}.mid`);
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      const mod = await import('@tonejs/midi');
      // @ts-ignore
      const Midi = (mod as any).Midi || (mod as any).default?.Midi || (mod as any).default;
      if (!Midi) return null;
      const midi = new Midi(buf);
      this.midiCache.set(name, midi);
      return midi;
    } catch { return null; }
  }

  private clearMidiSchedule(stopOsc = true) {
    if (stopOsc) {
      this.scheduledNodes.forEach(n => { try { n.stop(); n.disconnect(); } catch {} });
    }
    this.scheduledNodes = [];
    if (this.midiLoopTimer !== null) { window.clearTimeout(this.midiLoopTimer); this.midiLoopTimer = null; }
    if (this.bgmLoopTimer !== null) { window.clearTimeout(this.bgmLoopTimer); this.bgmLoopTimer = null; }
  }

  private scheduleMidiOrFallback() {
    if (this.musicMode === 'procedural') { this.scheduleNextBgmPhrase(); return; }
    if (!this.useMidi) { this.scheduleNextBgmPhrase(); return; }
    const name = this.getMidiName();
    this.loadMidi(name).then(midi => {
      if (!midi || !midi.tracks || midi.tracks.length===0 || midi.tracks.every((t:any)=> t.notes.length===0)) {
        // fallback procedural si midi vacío o no existe
        this.scheduleNextBgmPhrase();
        return;
      }
      this.scheduleMidiNotes(midi);
    }).catch(()=> this.scheduleNextBgmPhrase());
  }

  private scheduleMidiNotes(midi: any) {
    if (!this.ctx || !this.bgmGain || !this.isBgmPlaying) return;
    this.clearMidiSchedule(true);
    const now = this.ctx.currentTime;
    const filtered: any[] = [];
    midi.tracks.forEach((track:any)=>{
      const isDrum = track.instrument?.name?.toLowerCase().includes('kit') || track.instrument?.name?.toLowerCase().includes('drum') || track.channel === 9;
      if (isDrum) return; // batería no sintetizable con sine simple
      track.notes.forEach((n:any)=>{
        if (n.midi < 36 || n.midi > 96) return; // fuera de rango audible (grave extremo/agudo)
        filtered.push(n);
      });
    });
    const notes = filtered.length>0 ? filtered : midi.tracks.flatMap((t:any)=> t.notes).filter((n:any)=> n.midi>=36 && n.midi<=96);
    if (notes.length===0){ this.scheduleNextBgmPhrase(); return; }
    // recorta silencio inicial de 3.7s (plaza primer nota en 3.76)
    const minTime = Math.min(...notes.map((n:any)=> n.time));
    const duration = Math.max(...notes.map((n:any)=> n.time + n.duration), 0) - minTime;
    this.midiDuration = duration || 8;
    // sintetiza cada nota con oscilador nativo (recortado silencio inicial)
    notes.forEach((n:any)=>{
      try {
        const t = n.time - minTime;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();
        const type: OscillatorType = n.velocity > 0.7 ? 'triangle' : 'sine';
        osc.type = type;
        const freq = 440 * Math.pow(2, (n.midi - 69)/12);
        osc.frequency.setValueAtTime(freq, now + t);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(n.velocity>0.7 ? 3200 : 2200, now + t);
        filter.Q.setValueAtTime(0.6, now + t);

        const start = now + t;
        const end = start + n.duration * 0.92;
        // volumen unificado 70% parejo (ignora velocity) + más fuerte para que se escuche
        const peak = 0.22 * 0.70; // 0.154 = 70% de 0.22, audible
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(peak, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        osc.connect(filter); filter.connect(gain); gain.connect(this.bgmGain!);
        osc.start(start); osc.stop(end);
        this.scheduledNodes.push(osc);
        // auto cleanup
        window.setTimeout(()=> { try{ osc.disconnect(); gain.disconnect(); filter.disconnect(); }catch{} }, (end - now)*1000 + 200);
      } catch {}
    });
    // loop suave: reprograma al finalizar con crossfade casi inaudible
    const loopMs = (this.midiDuration + 0.6) * 1000;
    this.midiLoopTimer = window.setTimeout(() => {
      if (!this.isBgmPlaying) return;
      // verifica que siga misma escena/materia antes de loopear
      const curName = this.getMidiName();
      this.loadMidi(curName).then(m=> { if(m) this.scheduleMidiNotes(m); });
    }, loopMs);
  }

  // --- AMBIENT LAYERS ---
  private clearAmbient(clearWind: boolean = true) {
    if (this.birdTimer !== null) { window.clearTimeout(this.birdTimer); this.birdTimer = null; }
    this.ambientTimers.forEach((t) => window.clearTimeout(t));
    this.ambientTimers = [];
    if (clearWind && this.windNodes) {
      try {
        this.windNodes.gain.gain.cancelScheduledValues(this.ctx?.currentTime || 0);
        this.windNodes.gain.gain.linearRampToValueAtTime(0.001, (this.ctx?.currentTime || 0) + 0.3);
      } catch {}
      window.setTimeout(() => {
        try { this.windNodes?.src.stop(); } catch {}
        try { this.windNodes?.src.disconnect(); this.windNodes?.gain.disconnect(); this.windNodes?.filter.disconnect(); } catch {}
        this.windNodes = null;
      }, 350);
    } else if (!clearWind && this.windNodes) {
      try { this.windNodes.src.stop(); } catch {}
      try { this.windNodes.src.disconnect(); this.windNodes.gain.disconnect(); this.windNodes.filter.disconnect(); } catch {}
      this.windNodes = null;
    }
  }

  private startAmbientForScene() {
    this.clearAmbient(true);
    if (!this.musicEnabled || this.bgmVolume <= 0) return;
    if (this.currentScene === 'PLAZA') { this.startWindLoop(); this.scheduleNextBirdChirp(); }
    else if (this.currentScene === 'MATERIA_MAP' || this.currentScene === 'CITY_MAP') {
      if (this.currentMateriaId === 'ciencias') this.startWindLoop(0.012, 500);
    }
  }

  private startWindLoop(baseGain: number = 0.018, cutoff: number = 700) {
    if (!this.ctx || !this.bgmGain || !this.musicEnabled) return;
    try {
      const ctx = this.ctx;
      const bufferSize = Math.floor(ctx.sampleRate * 1.8);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) { data[i] = (Math.random() * 2 - 1) * 0.5; if (i>0) data[i]=(data[i]+data[i-1])*0.5; }
      const src = ctx.createBufferSource(); src.buffer=buffer; src.loop=true;
      const filter = ctx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.setValueAtTime(cutoff, ctx.currentTime); filter.Q.setValueAtTime(0.7, ctx.currentTime);
      const gain = ctx.createGain(); const targetVol = baseGain*(this.bgmVolume*0.9+0.1);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime); gain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime+1.2);
      const lfo = ctx.createOscillator(); const lfoGain=ctx.createGain(); lfo.type='sine'; lfo.frequency.setValueAtTime(0.07+Math.random()*0.05, ctx.currentTime); lfoGain.gain.setValueAtTime(120, ctx.currentTime); lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();
      src.connect(filter); filter.connect(gain); gain.connect(this.bgmGain); src.start();
      this.windNodes={src,gain,filter};
      const gust=()=>{
        if(!this.ctx||!this.windNodes||this.currentScene!=='PLAZA'&&this.currentMateriaId!=='ciencias') return;
        try{
          const now=this.ctx.currentTime; const cur=this.windNodes.gain.gain.value;
          const next=targetVol*(0.7+Math.random()*0.6);
          this.windNodes.gain.gain.cancelScheduledValues(now); this.windNodes.gain.gain.setValueAtTime(cur, now);
          this.windNodes.gain.gain.linearRampToValueAtTime(next, now+2.5+Math.random()*2);
        }catch{}
        const t=window.setTimeout(gust,3000+Math.random()*4000); this.ambientTimers.push(t);
      };
      const firstGust=window.setTimeout(gust,3500); this.ambientTimers.push(firstGust);
    } catch {}
  }

  private scheduleNextBirdChirp() {
    if (this.currentScene !== 'PLAZA') return;
    if (!this.sfxEnabled || this.sfxVolume <= 0) return;
    const delay = 1400 + Math.random()*2800;
    this.birdTimer = window.setTimeout(() => {
      this.playBirdChirp();
      if (Math.random()<0.35){ const t=window.setTimeout(()=> this.playBirdChirp(),180+Math.random()*120); this.ambientTimers.push(t); }
      this.scheduleNextBirdChirp();
    }, delay);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.sfxGain || !this.sfxEnabled || this.sfxVolume <= 0) return;
    if (this.currentScene !== 'PLAZA') return;
    try {
      const now=this.ctx.currentTime; const base=1800+Math.random()*700;
      const osc=this.ctx.createOscillator(); const gain=this.ctx.createGain(); const filter=this.ctx.createBiquadFilter();
      filter.type='bandpass'; filter.frequency.setValueAtTime(base, now); filter.Q.setValueAtTime(1.2, now);
      osc.type='sine'; osc.frequency.setValueAtTime(base, now);
      osc.frequency.linearRampToValueAtTime(base+250+Math.random()*300, now+0.06);
      osc.frequency.linearRampToValueAtTime(base-120, now+0.12);
      const peak=0.055*(this.sfxVolume*0.8+0.2);
      gain.gain.setValueAtTime(0.0001, now); gain.gain.linearRampToValueAtTime(peak, now+0.015); gain.gain.exponentialRampToValueAtTime(0.0001, now+0.16);
      osc.connect(filter); filter.connect(gain); gain.connect(this.sfxGain); osc.start(now); osc.stop(now+0.18);
      const osc2=this.ctx.createOscillator(); const gain2=this.ctx.createGain();
      osc2.type='sine'; osc2.frequency.setValueAtTime(base*0.5, now);
      gain2.gain.setValueAtTime(0.0001, now); gain2.gain.linearRampToValueAtTime(peak*0.18, now+0.02); gain2.gain.exponentialRampToValueAtTime(0.0001, now+0.22);
      osc2.connect(gain2); gain2.connect(this.sfxGain); osc2.start(now+0.01); osc2.stop(now+0.23);
    } catch {}
  }

  // --- FALLBACK PROCEDURAL (si MIDI no existe o falla) ---
  private extendWithVariation(base: BgmNote[], repeats: number, transposeEvery: number = 3): BgmNote[] {
    const out: BgmNote[] = [];
    const semitone = Math.pow(2, 1/12);
    for(let r=0;r<repeats;r++){
      const shift = r % transposeEvery === 1 ? semitone : r % transposeEvery === 2 ? 1/semitone : 1;
      const durJitter = r%2===0 ? 1 : 0.92;
      for(const n of base){
        const isSilent=n.note===0 && n.bass===0;
        out.push({ note:isSilent?0:n.note*shift, dur:n.dur*durJitter, bass:isSilent?0:n.bass*(shift>1?shift:1), chord:n.chord.map(c=> c*shift)});
      }
      if(r<repeats-1) out.push({ note:0, dur:0.35+(r%3)*0.15, bass:0, chord:[]});
    }
    return out;
  }

  private getMelodyForCurrentScene(): { track: BgmNote[]; tempoFactor: number; color: string } {
    const isCity=this.currentScene==='CITY_MAP';
    const materia=this.currentMateriaId||'matematicas';
    if(this.currentScene==='HOUSE'){
      const base:BgmNote[]=[
        { note:261.63,dur:1.0,bass:130.81,chord:[196.0,261.63] },
        { note:329.63,dur:1.0,bass:146.83,chord:[] },
        { note:392.0,dur:1.0,bass:196.0,chord:[261.63,329.63] },
        { note:440.0,dur:0.9,bass:220.0,chord:[] },
        { note:392.0,dur:1.2,bass:196.0,chord:[246.94,311.13] },
        { note:349.23,dur:0.9,bass:174.61,chord:[] },
        { note:329.63,dur:1.0,bass:164.81,chord:[220.0,261.63] },
        { note:293.66,dur:1.4,bass:146.83,chord:[196.0,246.94] },
        { note:0,dur:0.6,bass:0,chord:[] },
        { note:246.94,dur:0.8,bass:130.81,chord:[196.0,246.94] },
        { note:261.63,dur:0.8,bass:130.81,chord:[] },
        { note:329.63,dur:1.2,bass:164.81,chord:[261.63,329.63,392.0] },
        { note:392.0,dur:1.4,bass:196.0,chord:[] },
        { note:0,dur:0.5,bass:0,chord:[] },
      ];
      return { track:this.extendWithVariation(base,9), tempoFactor:1.35, color:'house'};
    }
    if(this.currentScene==='PLAZA'){
      const base:BgmNote[]=[
        { note:392.0,dur:0.7,bass:98.0,chord:[246.94,311.13,392.0] },
        { note:440.0,dur:0.7,bass:98.0,chord:[] },
        { note:493.88,dur:1.0,bass:123.47,chord:[293.66,369.99,440.0] },
        { note:523.25,dur:0.9,bass:130.81,chord:[] },
        { note:493.88,dur:0.7,bass:123.47,chord:[] },
        { note:440.0,dur:1.2,bass:110.0,chord:[220.0,277.18,329.63] },
        { note:392.0,dur:1.0,bass:98.0,chord:[] },
        { note:329.63,dur:0.7,bass:82.41,chord:[196.0,246.94] },
        { note:349.23,dur:0.7,bass:87.31,chord:[] },
        { note:392.0,dur:1.3,bass:98.0,chord:[246.94,311.13,392.0] },
        { note:0,dur:0.5,bass:0,chord:[] },
        { note:440.0,dur:0.6,bass:110.0,chord:[261.63,329.63] },
        { note:493.88,dur:0.6,bass:123.47,chord:[] },
        { note:587.33,dur:1.1,bass:130.81,chord:[311.13,392.0,493.88] },
        { note:523.25,dur:0.9,bass:130.81,chord:[] },
        { note:0,dur:0.4,bass:0,chord:[] },
      ];
      return { track:this.extendWithVariation(base,8), tempoFactor:1.0, color:'plaza'};
    }
    const materiaTrack=this.getMateriaTrack(materia,isCity);
    return materiaTrack;
  }

  private getMateriaTrack(materiaId:string,isCity:boolean): { track:BgmNote[]; tempoFactor:number; color:string } {
    const intensity=isCity?0.78:1.0;
    switch(materiaId){
      case 'matematicas':{ const base:BgmNote[]=[
        { note:329.63,dur:0.35,bass:164.81,chord:[] },{ note:440.0,dur:0.35,bass:164.81,chord:[] },{ note:523.25,dur:0.35,bass:164.81,chord:[329.63,440.0] },{ note:659.25,dur:0.55,bass:130.81,chord:[] },{ note:523.25,dur:0.35,bass:130.81,chord:[] },{ note:440.0,dur:0.35,bass:164.81,chord:[] },{ note:392.0,dur:0.45,bass:196.0,chord:[246.94,311.13] },{ note:329.63,dur:0.55,bass:164.81,chord:[] },{ note:0,dur:0.25,bass:0,chord:[] },{ note:349.23,dur:0.35,bass:174.61,chord:[] },{ note:466.16,dur:0.35,bass:174.61,chord:[] },{ note:587.33,dur:0.35,bass:174.61,chord:[349.23,466.16] },{ note:659.25,dur:0.6,bass:146.83,chord:[] },{ note:0,dur:0.3,bass:0,chord:[] },
      ]; return { track:this.extendWithVariation(base,34), tempoFactor:0.95*intensity, color:'matematicas'};}
      case 'lenguaje':{ const base:BgmNote[]=[
        { note:293.66,dur:1.1,bass:146.83,chord:[233.08,293.66,369.99] },{ note:329.63,dur:0.9,bass:146.83,chord:[] },{ note:349.23,dur:1.1,bass:174.61,chord:[261.63,329.63,415.3] },{ note:392.0,dur:1.0,bass:196.0,chord:[] },{ note:440.0,dur:0.9,bass:220.0,chord:[329.63,440.0] },{ note:392.0,dur:1.2,bass:196.0,chord:[246.94,311.13,392.0] },{ note:329.63,dur:0.9,bass:164.81,chord:[] },{ note:293.66,dur:1.3,bass:146.83,chord:[233.08,293.66] },{ note:0,dur:0.5,bass:0,chord:[] },
      ]; return { track:this.extendWithVariation(base,22), tempoFactor:1.15*intensity, color:'lenguaje'};}
      case 'ciencias':{ const base:BgmNote[]=[
        { note:196.0,dur:1.4,bass:98.0,chord:[146.83,196.0,246.94] },{ note:220.0,dur:1.2,bass:110.0,chord:[] },{ note:246.94,dur:1.4,bass:123.47,chord:[174.61,220.0,293.66] },{ note:293.66,dur:1.2,bass:146.83,chord:[] },{ note:329.63,dur:1.0,bass:164.81,chord:[196.0,246.94,329.63] },{ note:293.66,dur:1.3,bass:146.83,chord:[] },{ note:246.94,dur:1.4,bass:123.47,chord:[146.83,196.0] },{ note:220.0,dur:1.6,bass:110.0,chord:[164.81,220.0,261.63] },{ note:0,dur:0.6,bass:0,chord:[] },
      ]; return { track:this.extendWithVariation(base,16), tempoFactor:1.4*intensity, color:'ciencias'};}
      case 'historia':{ const base:BgmNote[]=[
        { note:196.0,dur:0.55,bass:98.0,chord:[146.83,196.0,246.94] },{ note:246.94,dur:0.55,bass:98.0,chord:[] },{ note:293.66,dur:0.55,bass:130.81,chord:[196.0,246.94,293.66] },{ note:392.0,dur:0.9,bass:98.0,chord:[] },{ note:349.23,dur:0.55,bass:110.0,chord:[] },{ note:329.63,dur:0.55,bass:110.0,chord:[164.81,220.0,261.63] },{ note:293.66,dur:1.1,bass:146.83,chord:[220.0,277.18,329.63] },{ note:220.0,dur:0.55,bass:110.0,chord:[] },{ note:246.94,dur:0.55,bass:110.0,chord:[] },{ note:293.66,dur:0.9,bass:146.83,chord:[196.0,293.66,349.23] },{ note:392.0,dur:1.3,bass:98.0,chord:[] },{ note:0,dur:0.4,bass:0,chord:[] },
      ]; return { track:this.extendWithVariation(base,28), tempoFactor:0.92*intensity, color:'historia'};}
      case 'luces':
      case 'arte':{ const base:BgmNote[]=[
        { note:392.0,dur:0.28,bass:196.0,chord:[] },{ note:493.88,dur:0.28,bass:196.0,chord:[] },{ note:587.33,dur:0.28,bass:220.0,chord:[392.0,493.88] },{ note:659.25,dur:0.4,bass:220.0,chord:[] },{ note:783.99,dur:0.45,bass:246.94,chord:[] },{ note:659.25,dur:0.28,bass:220.0,chord:[] },{ note:587.33,dur:0.28,bass:196.0,chord:[] },{ note:493.88,dur:0.28,bass:196.0,chord:[246.94,329.63] },{ note:440.0,dur:0.3,bass:220.0,chord:[] },{ note:523.25,dur:0.28,bass:220.0,chord:[] },{ note:659.25,dur:0.28,bass:246.94,chord:[415.3,523.25] },{ note:783.99,dur:0.5,bass:196.0,chord:[] },{ note:0,dur:0.25,bass:0,chord:[] },{ note:349.23,dur:0.28,bass:174.61,chord:[] },{ note:440.0,dur:0.28,bass:174.61,chord:[] },{ note:554.37,dur:0.5,bass:174.61,chord:[349.23,440.0,554.37] },
      ]; return { track:this.extendWithVariation(base,34), tempoFactor:0.85*intensity, color:'luces'};}
      case 'sonidos':
      case 'musica':{ const base:BgmNote[]=[
        { note:261.63,dur:0.5,bass:130.81,chord:[196.0,261.63,311.13,392.0] },{ note:329.63,dur:0.3,bass:130.81,chord:[] },{ note:349.23,dur:0.5,bass:130.81,chord:[] },{ note:392.0,dur:0.7,bass:146.83,chord:[220.0,277.18,329.63,392.0] },{ note:440.0,dur:0.3,bass:146.83,chord:[] },{ note:466.16,dur:0.5,bass:146.83,chord:[] },{ note:392.0,dur:0.5,bass:130.81,chord:[196.0,261.63,311.13] },{ note:329.63,dur:0.5,bass:130.81,chord:[] },{ note:311.13,dur:0.3,bass:123.47,chord:[] },{ note:293.66,dur:0.7,bass:123.47,chord:[233.08,293.66,349.23,415.3] },{ note:349.23,dur:0.5,bass:130.81,chord:[] },{ note:392.0,dur:0.9,bass:130.81,chord:[261.63,329.63,392.0,466.16] },{ note:0,dur:0.35,bass:0,chord:[] },
      ]; return { track:this.extendWithVariation(base,28), tempoFactor:0.88*intensity, color:'sonidos'};}
      case 'ingles':{ const base:BgmNote[]=[
        { note:1046.5,dur:0.45,bass:130.81,chord:[523.25,659.25] },{ note:0,dur:0.2,bass:65.41,chord:[] },{ note:1318.51,dur:0.45,bass:130.81,chord:[] },{ note:0,dur:0.15,bass:65.41,chord:[] },{ note:1174.66,dur:0.5,bass:146.83,chord:[587.33,739.99] },{ note:1046.5,dur:0.6,bass:130.81,chord:[] },{ note:0,dur:0.25,bass:65.41,chord:[] },{ note:987.77,dur:0.45,bass:123.47,chord:[493.88,622.25] },{ note:1046.5,dur:0.45,bass:130.81,chord:[] },{ note:1318.51,dur:0.7,bass:130.81,chord:[659.25,783.99,1046.5] },{ note:0,dur:0.3,bass:65.41,chord:[] },{ note:783.99,dur:0.5,bass:98.0,chord:[392.0,493.88] },{ note:880.0,dur:0.5,bass:110.0,chord:[] },{ note:1046.5,dur:0.9,bass:130.81,chord:[523.25,659.25,783.99] },
      ]; return { track:this.extendWithVariation(base,28), tempoFactor:1.0*intensity, color:'ingles'};}
      case 'kinder_actividades':
      case 'kinder':{ const base:BgmNote[]=[
        { note:392.0,dur:0.6,bass:196.0,chord:[261.63,329.63] },{ note:440.0,dur:0.6,bass:196.0,chord:[] },{ note:493.88,dur:0.6,bass:220.0,chord:[] },{ note:523.25,dur:0.9,bass:220.0,chord:[329.63,415.3,493.88] },{ note:493.88,dur:0.5,bass:220.0,chord:[] },{ note:440.0,dur:0.5,bass:196.0,chord:[] },{ note:392.0,dur:1.0,bass:196.0,chord:[246.94,311.13,392.0] },{ note:329.63,dur:0.6,bass:164.81,chord:[] },{ note:392.0,dur:0.6,bass:164.81,chord:[] },{ note:440.0,dur:1.0,bass:196.0,chord:[261.63,329.63,440.0] },{ note:0,dur:0.4,bass:0,chord:[] },
      ]; return { track:this.extendWithVariation(base,24), tempoFactor:1.05*intensity, color:'kinder'};}
      default:{ const base:BgmNote[]=[
        { note:392.0,dur:0.5,bass:196.0,chord:[293.66,392.0] },{ note:440.0,dur:0.5,bass:196.0,chord:[] },{ note:493.88,dur:1.0,bass:196.0,chord:[] },{ note:523.25,dur:0.8,bass:220.0,chord:[261.63,329.63] },{ note:0,dur:0.3,bass:0,chord:[] },
      ]; return { track:this.extendWithVariation(base,30), tempoFactor:1.0*intensity, color:'default'};}
    }
  }

  public startBgm() {
    if (typeof window === 'undefined') return;
    this.initCtx();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    if (this.currentNoteIndex >= 999) this.currentNoteIndex = 0;
    this.updateBgmGain(true);
    this.startAmbientForScene();
    this.scheduleMidiOrFallback();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    this.clearMidiSchedule(true);
    if (this.bgmLoopTimer !== null) { window.clearTimeout(this.bgmLoopTimer); this.bgmLoopTimer = null; }
    if (this.sceneTransitionTimer !== null) { window.clearTimeout(this.sceneTransitionTimer); this.sceneTransitionTimer = null; }
    this.clearAmbient(true);
    if (this.bgmGain && this.ctx) {
      try {
        const now=this.ctx.currentTime; const cur=this.bgmGain.gain.value;
        this.bgmGain.gain.cancelScheduledValues(now); this.bgmGain.gain.setValueAtTime(cur, now);
        this.bgmGain.gain.linearRampToValueAtTime(0, now+0.5);
      } catch {}
    }
  }

  private scheduleNextBgmPhrase() {
    if (!this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx || !this.bgmGain) return;
    const { track: melodyTrack, tempoFactor } = this.getMelodyForCurrentScene();
    if (this.currentNoteIndex >= melodyTrack.length) this.currentNoteIndex = 0;
    const current = melodyTrack[this.currentNoteIndex];
    const now = this.ctx.currentTime;
    const isCity = this.currentScene === 'CITY_MAP';
    const isHouse = this.currentScene === 'HOUSE';
    const isPlaza = this.currentScene === 'PLAZA';
    const noteDuration = current.dur * 0.85;
    if (current.note > 0 && this.musicEnabled && this.bgmVolume > 0) {
      try {
        const osc = this.ctx.createOscillator(); const noteGain=this.ctx.createGain(); const filter=this.ctx.createBiquadFilter();
        let oscType: OscillatorType='sine'; let peak=0.12; let filterFreq=3500;
        if (isHouse){ oscType='triangle'; peak=0.09; filterFreq=1800; }
        else if (isPlaza){ oscType='sine'; peak=0.11; filterFreq=2800; }
        else if (this.currentMateriaId==='matematicas'){ oscType='triangle'; peak=isCity?0.14:0.11; filterFreq=4200; }
        else if (this.currentMateriaId==='lenguaje'){ oscType='triangle'; peak=0.10; filterFreq=2000; }
        else if (this.currentMateriaId==='ciencias'){ oscType='triangle'; peak=0.095; filterFreq=1600; }
        else if (this.currentMateriaId==='historia'){ oscType='sawtooth'; peak=isCity?0.13:0.10; filterFreq=2200; }
        else if (this.currentMateriaId==='luces'||this.currentMateriaId==='arte'){ oscType='sine'; peak=isCity?0.13:0.10; filterFreq=3800; }
        else if (this.currentMateriaId==='sonidos'||this.currentMateriaId==='musica'){ oscType='square'; peak=0.07; filterFreq=2500; }
        else if (this.currentMateriaId==='ingles'){ oscType='sine'; peak=isCity?0.15:0.12; filterFreq=5000; }
        if (isCity) peak*=1.18;
        osc.type=oscType; osc.frequency.setValueAtTime(current.note, now);
        filter.type='lowpass'; filter.frequency.setValueAtTime(filterFreq, now); filter.Q.setValueAtTime(0.6, now);
        noteGain.gain.setValueAtTime(0.001, now); noteGain.gain.linearRampToValueAtTime(peak, now+0.04); noteGain.gain.exponentialRampToValueAtTime(0.001, now+noteDuration);
        osc.connect(filter); filter.connect(noteGain); noteGain.connect(this.bgmGain);
        osc.start(now); osc.stop(now+noteDuration);
        if (isCity && current.note>0 && this.currentMateriaId!=='ciencias'){
          const osc2=this.ctx.createOscillator(); const g2=this.ctx.createGain();
          osc2.type='sine'; osc2.frequency.setValueAtTime(current.note*0.5, now);
          g2.gain.setValueAtTime(0.0001, now); g2.gain.linearRampToValueAtTime(peak*0.22, now+0.05); g2.gain.exponentialRampToValueAtTime(0.0001, now+noteDuration*1.1);
          osc2.connect(g2); g2.connect(this.bgmGain); osc2.start(now+0.02); osc2.stop(now+noteDuration*1.1);
        }
      } catch {}
    }
    if (current.bass>0 && this.musicEnabled && this.bgmVolume>0){
      try{
        const bassOsc=this.ctx.createOscillator(); const bassGain=this.ctx.createGain();
        bassOsc.type=this.currentScene==='HOUSE'||this.currentMateriaId==='ciencias'?'sine':'triangle';
        const bassFreq=this.currentMateriaId==='ingles'&&current.bass===65.41?65.41:current.bass/(this.currentScene==='HOUSE'?1.5:2);
        bassOsc.frequency.setValueAtTime(bassFreq, now);
        const bPeak=isCity?0.11:isHouse?0.08:0.085;
        bassGain.gain.setValueAtTime(0.001, now); bassGain.gain.linearRampToValueAtTime(bPeak, now+0.06); bassGain.gain.exponentialRampToValueAtTime(0.001, now+noteDuration*1.25);
        bassOsc.connect(bassGain); bassGain.connect(this.bgmGain);
        bassOsc.start(now); bassOsc.stop(now+noteDuration*1.25);
      }catch{}
    }
    if (current.chord.length>0 && this.musicEnabled && this.bgmVolume>0){
      current.chord.forEach((freq)=>{
        if(!this.ctx||!this.bgmGain) return;
        try{
          const chordOsc=this.ctx.createOscillator(); const chordGain=this.ctx.createGain(); const cFilter=this.ctx.createBiquadFilter();
          chordOsc.type=this.currentMateriaId==='historia'?'sawtooth':this.currentMateriaId==='ingles'?'sine':'triangle';
          chordOsc.frequency.setValueAtTime(freq, now);
          cFilter.type='lowpass'; cFilter.frequency.setValueAtTime(isPlaza?2200:isHouse?1500:2600, now);
          const cPeak=isCity?0.038:0.028;
          chordGain.gain.setValueAtTime(0.001, now); chordGain.gain.linearRampToValueAtTime(cPeak, now+0.09); chordGain.gain.exponentialRampToValueAtTime(0.001, now+noteDuration*1.45);
          chordOsc.connect(cFilter); cFilter.connect(chordGain); chordGain.connect(this.bgmGain);
          chordOsc.start(now); chordOsc.stop(now+noteDuration*1.45);
        }catch{}
      });
    }
    this.currentNoteIndex=(this.currentNoteIndex+1)%melodyTrack.length;
    const stepTimeMs=current.dur*600*tempoFactor;
    this.bgmLoopTimer=window.setTimeout(()=>{ this.scheduleNextBgmPhrase(); }, stepTimeMs);
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
// expone para diagnóstico en consola
if (typeof window !== 'undefined') (window as any).sound = sound;
