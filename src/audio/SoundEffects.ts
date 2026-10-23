/**
 * Procedural Web Audio API sound generator for Desi Highway.
 * Zero external audio files; all synthesized in real time.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  
  // Engine audio nodes
  private engineGain: GainNode | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning: boolean = false;

  // FM Radio nodes
  private isRadioPlaying: boolean = false;
  private radioGain: GainNode | null = null;
  private radioInterval: number | null = null;
  private radioTrackIndex: number = 0;

  // Active Horn
  private hornGain: GainNode | null = null;
  private hornOscs: OscillatorNode[] = [];

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.7;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // ---- CAR ENGINE SOUND ----
  public startEngine() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isEngineRunning) return;

    try {
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.15;

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 450;
      this.engineFilter.Q.value = 2.0;

      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.value = 55; // Idle rumble

      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'triangle';
      this.engineOsc2.frequency.value = 110;

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.isEngineRunning = true;
    } catch {
      // AudioContext policy handled
    }
  }

  public updateEngine(speedKmh: number, throttle: number) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter || !this.engineGain) return;

    const baseFreq = 50;
    // Simulate gear ratios (1st to 5th gear)
    const gearSpeed = speedKmh % 45;
    const gearFactor = gearSpeed / 45;
    const targetFreq = baseFreq + gearFactor * 90 + (throttle > 0 ? 30 : 0);
    const filterFreq = 300 + speedKmh * 10 + throttle * 400;

    const t = this.ctx.currentTime;
    this.engineOsc1.frequency.setTargetAtTime(targetFreq, t, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq * 1.5, t, 0.08);
    this.engineFilter.frequency.setTargetAtTime(Math.min(filterFreq, 3000), t, 0.08);
    this.engineGain.gain.setTargetAtTime(0.08 + (speedKmh / 160) * 0.15 + (throttle * 0.08), t, 0.08);
  }

  public stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      this.engineOsc1?.stop();
      this.engineOsc2?.stop();
      this.engineOsc1?.disconnect();
      this.engineOsc2?.disconnect();
      this.engineFilter?.disconnect();
      this.engineGain?.disconnect();
    } catch {
      // Ignored
    }
    this.isEngineRunning = false;
  }

  // ---- DUAL-TONE DESI CAR HORN ("Peep-Peep") & AIR HORN ----
  public startHorn(type: string = 'classic') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.hornOscs.length > 0) return; // already active

    const t = this.ctx.currentTime;
    this.hornGain = this.ctx.createGain();
    this.hornGain.gain.setValueAtTime(0, t);
    this.hornGain.gain.linearRampToValueAtTime(0.35, t + 0.03);
    this.hornGain.connect(this.masterGain);

    if (type === 'airhorn') {
      // Indian Truck Musical Air Horn frequencies: D4 (293.66), F#4 (370), A4 (440), D5 (587.3)
      const freqs = [293.66, 370.0, 440.0];
      this.hornOscs = freqs.map((f, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(f, t);
        osc.connect(this.hornGain!);
        osc.start();
        return osc;
      });
    } else if (type === 'nagad') {
      // Upbeat desi dual tone with vibrato
      const freqs = [415, 520];
      this.hornOscs = freqs.map(f => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);
        osc.connect(this.hornGain!);
        osc.start();
        return osc;
      });
    } else {
      // Classic Indian Car Dual-Tone Horn (420Hz + 500Hz)
      const freqs = [425, 495];
      this.hornOscs = freqs.map((f, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i === 0 ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(f, t);
        osc.connect(this.hornGain!);
        osc.start();
        return osc;
      });
    }
  }

  public stopHorn() {
    if (!this.ctx || !this.hornGain || this.hornOscs.length === 0) return;
    const t = this.ctx.currentTime;
    this.hornGain.gain.linearRampToValueAtTime(0.001, t + 0.05);
    setTimeout(() => {
      this.hornOscs.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignored
        }
      });
      this.hornOscs = [];
      this.hornGain?.disconnect();
      this.hornGain = null;
    }, 60);
  }

  // Quick Horn Tap ("Peep-Peep")
  public tapHorn(type: string = 'classic') {
    this.startHorn(type);
    setTimeout(() => this.stopHorn(), 150);
    setTimeout(() => {
      this.startHorn(type);
      setTimeout(() => this.stopHorn(), 180);
    }, 240);
  }

  // ---- TIRE BRAKE / SKID SCREECH ----
  public playTireSkid() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.35);
    filter.Q.value = 4.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  // ---- NEAR MISS WHOOSH ----
  public playNearMiss() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Doppler effect whoosh
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(t + 0.35);
  }

  // ---- FASTag TOLL CHIME ("Ding-Ding") ----
  public playFastagChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // First high ding
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, t); // A5
    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.4);

    // Second cheerful ding
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, t + 0.14); // E6
    gain2.gain.setValueAtTime(0.35, t + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t + 0.14);
    osc2.stop(t + 0.6);
  }

  // ---- POTHOLE / ROAD BUMP CLUNK ----
  public playPotholeBump() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.22);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.26);
  }

  // ---- CRASH IMPACT SOUND ----
  public playCrash() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Low sub thump
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.6);

    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0.5, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    osc.connect(gain1);
    gain1.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.7);

    // Metal crunch noise
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.45);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.45, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    noise.connect(filter);
    filter.connect(gain2);
    gain2.connect(this.masterGain);
    noise.start();
  }

  // ---- COW MOO / BELL ----
  public playCowAlert() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Cow bell ring
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.42);
  }

  // ---- DESI HIGHWAY FM RADIO (Procedural Synthwave Grooves) ----
  public toggleRadio(): boolean {
    this.isRadioPlaying = !this.isRadioPlaying;
    if (this.isRadioPlaying) {
      this.startRadio();
    } else {
      this.stopRadio();
    }
    return this.isRadioPlaying;
  }

  public getIsRadioPlaying(): boolean {
    return this.isRadioPlaying;
  }

  private startRadio() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.radioGain = this.ctx.createGain();
    this.radioGain.gain.value = 0.14;
    this.radioGain.connect(this.masterGain);

    // Desi Raga Bhairav / Highway Synth notes (C, D#, F, G, G#, C)
    const scale = [130.81, 155.56, 174.61, 196.00, 207.65, 261.63, 311.13, 392.00];
    let step = 0;

    this.radioInterval = window.setInterval(() => {
      if (!this.ctx || !this.radioGain || !this.isRadioPlaying) return;

      const t = this.ctx.currentTime;
      // Bass root beat on every 4 beats
      if (step % 4 === 0) {
        const bass = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bass.type = 'triangle';
        bass.frequency.setValueAtTime(65.41, t); // C2
        bGain.gain.setValueAtTime(0.25, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        bass.connect(bGain);
        bGain.connect(this.radioGain!);
        bass.start();
        bass.stop(t + 0.42);
      }

      // Melodic Desi Sitar / Flute note
      const noteIdx = (step * 3 + (this.radioTrackIndex % 3)) % scale.length;
      const freq = scale[noteIdx];

      const mel = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();
      mel.type = step % 2 === 0 ? 'sine' : 'triangle';
      mel.frequency.setValueAtTime(freq, t);
      // subtle slide
      mel.frequency.exponentialRampToValueAtTime(freq * 1.02, t + 0.15);

      mGain.gain.setValueAtTime(0.18, t);
      mGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      mel.connect(mGain);
      mGain.connect(this.radioGain!);
      mel.start();
      mel.stop(t + 0.3);

      step = (step + 1) % 16;
    }, 280);
  }

  private stopRadio() {
    if (this.radioInterval) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }
    if (this.radioGain) {
      this.radioGain.disconnect();
      this.radioGain = null;
    }
  }

  public nextRadioStation(): string {
    const stations = ['Desi Highway FM 93.5', 'NH-44 Dhabha Beats', 'Monsoon Raga Lounge', 'Truckers Express FM'];
    this.radioTrackIndex = (this.radioTrackIndex + 1) % stations.length;
    if (this.isRadioPlaying) {
      this.stopRadio();
      this.startRadio();
    }
    return stations[this.radioTrackIndex];
  }
}

export const sounds = new SoundSystem();
