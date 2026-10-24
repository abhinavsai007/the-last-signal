import { HauntingEvent, RoomId } from '../types/game';
import { audioEngine } from './audioEngine';

export type HauntingCallback = (event: HauntingEvent) => void;

class DynamicHauntingEngine {
  private listeners: Set<HauntingCallback> = new Set();
  private timer: number | null = null;
  private isEnabled = true;
  private currentRoom: RoomId | null = null;
  private lowIntensity = false;
  private lastTriggerTime = 0;

  // Curated creepy text lines
  private corruptedWhispers = [
    'IT SEES YOU IN THE DARK.',
    'DO NOT LOOK AT THE MONITORS.',
    'SOMEONE IS BREATHING BEHIND YOU.',
    'THE SIGNAL HAS NOT STOPPED.',
    'WHY ARE YOU STILL HERE?',
    'YOU CANNOT LOCK WHAT IS ALREADY INSIDE.',
    'PLEASE OPEN THE DOOR.',
    'WE NEVER LEFT SECTOR 4.'
  ];

  public subscribe(cb: HauntingCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public setRoom(room: RoomId | null) {
    this.currentRoom = room;
  }

  public setSettings(lowIntensity: boolean, reducedMotion: boolean) {
    this.lowIntensity = lowIntensity;
    if (reducedMotion) {
      this.lowIntensity = true;
    }
  }

  public start() {
    if (this.timer) return;
    this.scheduleNextEvent();
  }

  public stop() {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNextEvent() {
    // Rare, controlled interval between 25s and 50s so it remains genuinely surprising and not obnoxious
    const delay = Math.floor(Math.random() * 25000) + 25000;
    this.timer = window.setTimeout(() => {
      this.triggerRandomEvent();
      this.scheduleNextEvent();
    }, delay);
  }

  public triggerRandomEvent(forcedType?: HauntingEvent['type']) {
    const now = Date.now();
    if (now - this.lastTriggerTime < 8000) return; // Prevent spamming
    this.lastTriggerTime = now;

    const types: HauntingEvent['type'][] = [
      'flicker',
      'shadow',
      'static',
      'whisper',
      'text_corrupt',
      'camera_entity',
      'warning'
    ];

    const chosenType = forcedType || types[Math.floor(Math.random() * types.length)];
    const randomWhisper = this.corruptedWhispers[Math.floor(Math.random() * this.corruptedWhispers.length)];

    const event: HauntingEvent = {
      id: `haunt-${Date.now()}`,
      type: chosenType,
      text: randomWhisper,
      intensity: this.lowIntensity ? 0.3 : 0.8,
      durationMs: chosenType === 'flicker' ? 800 : chosenType === 'text_corrupt' ? 2200 : 1500
    };

    // Play appropriate procedural sound
    if (chosenType === 'flicker') {
      audioEngine.playFluorescentFlicker();
    } else if (chosenType === 'static') {
      audioEngine.playStaticBurst(0.5, 0.2);
    } else if (chosenType === 'whisper') {
      audioEngine.playWhisper();
    } else if (chosenType === 'warning') {
      audioEngine.playTerminalBeep('alert');
    } else if (chosenType === 'shadow') {
      audioEngine.playHeartbeat(false);
    }

    this.listeners.forEach(cb => cb(event));
  }
}

export const hauntingEngine = new DynamicHauntingEngine();
