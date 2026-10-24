export type RoomId = 
  | 'reception' 
  | 'security' 
  | 'lab' 
  | 'ward' 
  | 'tunnel' 
  | 'archive' 
  | 'red_room' 
  | 'exit';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'key' | 'document' | 'tool' | 'code';
  icon: string;
  inspectedText?: string;
  foundIn: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  source: string;
}

export interface HauntingEvent {
  id: string;
  type: 'flicker' | 'shadow' | 'static' | 'whisper' | 'text_corrupt' | 'camera_entity' | 'warning';
  text?: string;
  intensity: number;
  durationMs: number;
}

export interface PuzzlesState {
  receptionBadgeCollected: boolean;
  receptionDoorUnlocked: boolean;
  securityTerminalUnlocked: boolean;
  securityCamChannel: number;
  securitySilhouetteTriggered: boolean;
  labSymbolsSolved: boolean;
  wardRecordsInspected: string[];
  wardCurtainInvestigated: boolean;
  tunnelCircuitSolved: boolean;
  tunnelTimerActive: boolean;
  tunnelTimeLeft: number;
  archiveFilesFound: string[];
  archiveMasterUnlocked: boolean;
  redRoomObserverSpottedCount: number;
  redRoomGlyphsActivated: string[];
  exitConsoleUnlocked: boolean;
  selectedEnding: 'A' | 'B' | 'C' | null;
}

export interface GameSettings {
  soundEnabled: boolean;
  masterVolume: number;
  ambientVolume: number;
  musicVolume?: number;
  sfxVolume: number;
  reducedMotion: boolean;
  lowIntensityVisuals: boolean;
  flashlightEffect: boolean;
}

export interface SurvivorRegistration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  teamName: string;
  teamMembers: string;
  organization: string;
  category: string;
  projectIdea: string;
  registeredAt: string;
  accessBadgeId: string;
}

export interface ProjectSubmission {
  id: string;
  projectName: string;
  tagline: string;
  description: string;
  repoUrl: string;
  demoUrl: string;
  teamName: string;
  category: string;
  submittedAt: string;
  status: 'PENDING_SECURITY_REVIEW' | 'VERIFIED' | 'COMPROMISED';
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  projectName: string;
  category: string;
  score: number;
  status: 'SURVIVED' | 'SIGNAL_ACTIVE' | 'ISOLATED';
  lastPing: string;
}
