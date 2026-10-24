/**
 * Audio Engine for The Last Signal:
 * - Plays the user-provided horror background track ('/assets/aistudio/danydory-dark-night-141315_ca3e4f54.mp3') on loop.
 * - Synthesizes immediate acoustic sound effects (jumpscare stingers, heartbeats, terminal clicks, static bursts).
 */
class HorrorAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Background Horror Song
  private bgMusic: HTMLAudioElement | null = null;
  private isMusicRunning = false;
  private hasUserInteracted = false;

  private isMuted = false;
  private masterVol = 0.7;
  private ambientVol = 0.5;
  private musicVol = 0.65;
  private sfxVol = 0.8;

  constructor() {
    if (typeof window !== 'undefined') {
      // Auto-attach user gesture unlocker for browser autoplay policies
      const unlockAudio = () => {
        this.hasUserInteracted = true;
        this.resume();
        if (this.isMusicRunning && this.bgMusic && this.bgMusic.paused) {
          this.bgMusic.play().catch(() => {});
        }
      };

      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  private initBgMusic() {
    if (typeof window === 'undefined') return;
    if (!this.bgMusic) {
      this.bgMusic = new Audio('/assets/aistudio/danydory-dark-night-141315_ca3e4f54.mp3');
      this.bgMusic.loop = true;
      this.bgMusic.preload = 'auto';
      this.updateBgMusicVolume();
    }
  }

  private updateBgMusicVolume() {
    if (!this.bgMusic) return;
    const effectiveVol = this.isMuted ? 0 : this.masterVol * this.musicVol;
    this.bgMusic.volume = Math.max(0, Math.min(1, effectiveVol));
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVol;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVol;
      this.sfxGain.connect(this.masterGain);
    } catch {
      // Audio not supported in environment
    }
  }

  public resume() {
    if (!this.ctx) {
      this.initContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.isMusicRunning && this.bgMusic && this.bgMusic.paused) {
      this.bgMusic.play().catch(() => {});
    }
  }

  public setMasterVolume(v: number) {
    this.masterVol = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime, 0.05);
    }
    this.updateBgMusicVolume();
  }

  public setAmbientVolume(v: number) {
    this.ambientVol = Math.max(0, Math.min(1, v));
  }

  public setMusicVolume(v: number) {
    this.musicVol = Math.max(0, Math.min(1, v));
    this.updateBgMusicVolume();
  }

  public setSfxVolume(v: number) {
    this.sfxVol = Math.max(0, Math.min(1, v));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVol, this.ctx.currentTime, 0.05);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.masterVol, this.ctx.currentTime, 0.05);
    }
    this.updateBgMusicVolume();
  }

  // Starts the horror background music
  public startAmbientDrone() {
    this.startHorrorMusicTrack();
  }

  public stopAmbientDrone() {
    this.stopHorrorMusicTrack();
  }

  public startHorrorMusicTrack() {
    this.isMusicRunning = true;
    this.resume();
    this.initBgMusic();
    if (this.bgMusic) {
      this.updateBgMusicVolume();
      this.bgMusic.play().catch(() => {
        // Will start automatically when player interacts with page
      });
    }
  }

  public stopHorrorMusicTrack() {
    this.isMusicRunning = false;
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  // SFX: Radio static noise burst
  public playStaticBurst(duration = 0.4, intensity = 0.25) {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * intensity;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(2, this.ctx.currentTime);

      const envGain = this.ctx.createGain();
      envGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      envGain.gain.linearRampToValueAtTime(intensity, this.ctx.currentTime + 0.05);
      envGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(envGain);
      envGain.connect(this.sfxGain);

      noise.start();
      noise.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio error
    }
  }

  // SFX: Fluorescent light flicker buzz
  public playFluorescentFlicker() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(118, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio error
    }
  }

  // SFX: Distant metallic impact / clang
  public playMetalClang() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [174, 388, 720, 1140];
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const gain = this.ctx.createGain();
        const baseVol = 0.08 / (idx + 1);
        gain.gain.setValueAtTime(baseVol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 - idx * 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 1.3);
      });
    } catch {
      // Audio error
    }
  }

  // SFX: Heartbeat (double low thump)
  public playHeartbeat(urgent = false) {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const triggerThump = (offsetTime: number, freq: number, decay: number) => {
        if (!this.ctx || !this.sfxGain) return;
        const t = now + offsetTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + decay);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(urgent ? 0.35 : 0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + decay);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + decay);
      };

      triggerThump(0, 75, 0.18);
      triggerThump(urgent ? 0.15 : 0.22, 60, 0.22);
    } catch {
      // Audio error
    }
  }

  // SFX: Terminal keystroke or CRT click
  public playTerminalBeep(type: 'key' | 'error' | 'success' | 'alert' = 'key') {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'key') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700 + Math.random() * 200, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.setValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      }

      osc.connect(gain);
      gain.connect(this.sfxGain);
    } catch {
      // Audio error
    }
  }

  // SFX: Eerie paranormal whisper sweep
  public playWhisper() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const duration = 1.2;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.12;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(350, this.ctx.currentTime + duration);
      filter.Q.setValueAtTime(6, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start();
      noise.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio error
    }
  }

  // SFX: Emergency Warning Siren
  public playSiren() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.35);
      osc.frequency.linearRampToValueAtTime(550, now + 0.7);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
    } catch {
      // Audio error
    }
  }

  // SFX: Wendigo Horror Creature Angry Scream & Roar (User-provided jumpscare audio)
  public playWendigoRoar() {
    this.resume();
    try {
      const roarAudio = new Audio('/assets/aistudio/phatphrogstudio-wendigo-horror-voice-angry-scream-growl-roar-583005_716e2a5f.mp3');
      const effectiveVol = this.isMuted ? 0 : this.masterVol * this.sfxVol;
      roarAudio.volume = Math.max(0, Math.min(1, effectiveVol));
      roarAudio.play().catch(() => {});
    } catch {
      // Audio fallback
    }
  }

  // SFX: Dissonant Horror Jumpscare Stinger
  public playJumpscareStinger() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Heavy sub-bass thud
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.4);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(now);
      subOsc.stop(now + 0.7);

      // 2. Screeching tritone cluster (eerie dissonant horror chord)
      const dissonantFreqs = [440, 622, 880, 1244];
      dissonantFreqs.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(freq + (Math.random() * 8 - 4), now);
        osc.frequency.linearRampToValueAtTime(freq * 0.7, now + 0.5);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(300, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.65);
      });

      // 3. Harsh noise burst
      this.playStaticBurst(0.5, 0.4);
    } catch {
      // Audio error
    }
  }

  // SFX: Medical monitor flatline alarm
  public playMedicalFlatline(duration = 1.2) {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0.2, now + duration - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // Audio error
    }
  }
}

export const audioEngine = new HorrorAudioEngine();
