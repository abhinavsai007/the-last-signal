import { LeaderboardEntry } from '../types/game';

export interface ChallengeTrack {
  id: string;
  code: string;
  title: string;
  threatLevel: 'ALPHA' | 'BETA' | 'GAMMA' | 'OMEGA';
  description: string;
  problemStatement: string;
  deliverables: string[];
  techStackFocus: string[];
}

export interface TimelinePhase {
  time: string;
  title: string;
  phaseCode: string;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
  description: string;
}

export const HACKATHON_CONFIG = {
  title: 'THE LAST SIGNAL: 2026 HORROR HACKATHON',
  codename: 'PROJECT NIGHTFALL PROTOCOL',
  motto: 'Build in the dark. Find a way out.',
  dates: 'October 31 – November 2, 2026',
  format: 'Hybrid (Underground Research Node 04 / Worldwide Emergency Relay)',
  totalPrizes: '$45,000 in Grants & Classified Hardware Kits',
  organizerEmail: 'control@thelastsignal.org',
  secureCommsDiscord: 'https://discord.gg/the-last-signal',
  emergencyRelayFreq: '433.92 MHz Encrypted'
};

export const CHALLENGE_TRACKS: ChallengeTrack[] = [
  {
    id: 'track-1',
    code: 'SEC-01',
    title: 'Anomalous Autonomous Surveillance & Computer Vision',
    threatLevel: 'BETA',
    description: 'Construct real-time intelligent monitoring systems capable of detecting spatial distortions, unseen entities, and unauthorized movement in low-visibility feeds.',
    problemStatement: 'Underground facilities require detection algorithms that can distinguish benign sensor noise from high-entropy paranormal entity signatures without false alarm floods.',
    deliverables: ['Real-time video/CCTV analyzer', 'Entity heat-signature model or bounding classifier', 'Edge alerting web interface'],
    techStackFocus: ['WebGL / Canvas', 'TensorFlow.js / ONNX', 'WebRTC', 'React']
  },
  {
    id: 'track-2',
    code: 'NET-02',
    title: 'Zero-Grid Emergency Mesh & Low-Bandwidth Networks',
    threatLevel: 'GAMMA',
    description: 'Design resilient local-first communication protocols that function under heavy analog static, EMP surges, and total internet isolation.',
    problemStatement: 'When primary fiber lines are severed from the outside, surviving teams must coordinate across isolated terminals without cloud infrastructure.',
    deliverables: ['P2P WebRTC / WebSocket local mesh', 'Offline cryptographic sync', 'Minimal packet audio/text encoding'],
    techStackFocus: ['WebSockets', 'WebRTC DataChannels', 'CRDTs', 'IndexedDB']
  },
  {
    id: 'track-3',
    code: 'SEC-03',
    title: 'Forensic Cryptanalysis & Data Recovery',
    threatLevel: 'ALPHA',
    description: 'Reverse-engineer damaged magnetic tapes, encrypted mainframe logs, and corrupted memory dumps from compromised laboratory systems.',
    problemStatement: 'Classified experiment records are fragmented across decaying sector terminals. Create forensic analysis tools to reconstruct redacted data pipelines.',
    deliverables: ['Interactive visual decompiler / log parser', 'Pattern recognition tool for corrupted hex/audio signals', 'Decryption dashboard'],
    techStackFocus: ['TypeScript', 'WASM', 'Web Audio API analysis', 'Data visualization']
  },
  {
    id: 'track-4',
    code: 'SIM-04',
    title: 'Immersive Psychological Horror & Spatial Audio Experiences',
    threatLevel: 'OMEGA',
    description: 'Engineer browser-based interactive simulation environments that induce authentic psychological tension using sound design, dynamic lighting, and narrative branching.',
    problemStatement: 'Traditional game engines require massive downloads. Build lightweight, zero-install web horror experiences that leverage browser graphics and 3D acoustics.',
    deliverables: ['Playable browser horror experience or escape engine', 'Procedural lighting / spatial sound integration', 'Dynamic tension pacing system'],
    techStackFocus: ['React', 'Three.js / WebGL', 'Web Audio API', 'Tailwind CSS']
  }
];

export const TIMELINE_PHASES: TimelinePhase[] = [
  {
    time: 'OCT 31 — 18:00 UTC',
    title: 'THE BREACH // OPENING BROADCAST',
    phaseCode: 'PHASE-01',
    status: 'COMPLETED',
    description: 'Classified briefing released. Challenge tracks unlocked. Team formations locked into the containment registry.'
  },
  {
    time: 'OCT 31 — 20:00 UTC',
    title: 'CONTAINMENT PROTOCOL ACTIVE // HACKING COMMENCES',
    phaseCode: 'PHASE-02',
    status: 'ACTIVE',
    description: '48-hour development window begins. Sub-level terminals open for local and remote survivors worldwide.'
  },
  {
    time: 'NOV 01 — 03:17 UTC',
    title: 'THE WITCHING HOUR CHECK-IN // SIGNAL ANOMALY',
    phaseCode: 'PHASE-03',
    status: 'UPCOMING',
    description: 'Mandatory proof-of-life code commit and project architecture snapshot. Mysterious bonus challenges unlocked.'
  },
  {
    time: 'NOV 02 — 12:00 UTC',
    title: 'EVACUATION LOCKDOWN // FINAL SUBMISSIONS',
    phaseCode: 'PHASE-04',
    status: 'UPCOMING',
    description: 'Strict repository commit freeze. Final demo recordings and classified write-ups submitted to the exit terminal.'
  },
  {
    time: 'NOV 02 — 16:00 UTC',
    title: 'DEBRIEFING & ESCAPE PODIUM // JUDGING',
    phaseCode: 'PHASE-05',
    status: 'UPCOMING',
    description: 'Surviving project demonstrations, evaluation by the Research Directorate, and award allocation.'
  }
];

export const MISSION_RULES = [
  {
    rule: 'Team Composition',
    detail: 'Teams may consist of 1 to 4 survivors. Cross-disciplinary collaboration (engineers, audio designers, narrative writers) is strongly encouraged.'
  },
  {
    rule: 'Original Code Verification',
    detail: 'All foundational project code must be developed during the hackathon window. Open-source libraries, pretrained models, and public frameworks are permitted with proper attribution.'
  },
  {
    rule: 'Submission Package',
    detail: 'Final submissions require a public GitHub repository, a working browser demo or video walkthrough, and an incident debrief (README).'
  },
  {
    rule: 'Safety & Code of Conduct',
    detail: 'Fictional psychological horror only. Absolutely no flashing strobe patterns exceeding safety thresholds, no unprompted malware simulations, no harassment, and full adherence to ethical standards.'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    teamName: 'Spectral Logic',
    projectName: 'Acoustic Entity Sonar v2.1',
    category: 'Anomalous Surveillance',
    score: 96.4,
    status: 'SURVIVED',
    lastPing: '2 mins ago'
  },
  {
    rank: 2,
    teamName: 'Echo Protocol',
    projectName: 'BunkerMesh Offline P2P',
    category: 'Emergency Mesh',
    score: 93.8,
    status: 'SIGNAL_ACTIVE',
    lastPing: '5 mins ago'
  },
  {
    rank: 3,
    teamName: 'Sub-Zero Wardens',
    projectName: 'Corrupted Tape Reconstructor',
    category: 'Forensic Cryptanalysis',
    score: 91.2,
    status: 'SIGNAL_ACTIVE',
    lastPing: '8 mins ago'
  },
  {
    rank: 4,
    teamName: 'Void Watchers',
    projectName: 'Sanity Decay Simulator',
    category: 'Psychological Simulation',
    score: 88.7,
    status: 'ISOLATED',
    lastPing: '14 mins ago'
  },
  {
    rank: 5,
    teamName: 'Blackout Syndicate',
    projectName: 'Thermal Silhouette Beacon',
    category: 'Anomalous Surveillance',
    score: 85.3,
    status: 'SIGNAL_ACTIVE',
    lastPing: '22 mins ago'
  }
];
