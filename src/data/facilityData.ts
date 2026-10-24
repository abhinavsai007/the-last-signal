import { RoomId } from '../types/game';

export interface RoomDefinition {
  id: RoomId;
  number: string;
  name: string;
  sector: string;
  tagline: string;
  description: string;
  x: number; // percentage on map
  y: number; // percentage on map
  connectedRooms: RoomId[];
  requiredItemsToEnter?: string[];
  requiredPuzzleToUnlock?: string;
  soundAtmosphere: string;
}

export const FACILITY_ROOMS: Record<RoomId, RoomDefinition> = {
  reception: {
    id: 'reception',
    number: '01',
    name: 'RECEPTION',
    sector: 'SECTOR-A // GROUND ENTRY',
    tagline: 'Abandoned reception desk, shattered monitors, and locked magnetic security door.',
    description: 'The front desk is overturned. Papers are scattered across the floor, soaked in dried fluid. A broken monitor buzzes with weak static.',
    x: 18,
    y: 72,
    connectedRooms: ['security'],
    soundAtmosphere: 'Flickering fluorescent buzz, subtle distant dripping.'
  },
  security: {
    id: 'security',
    number: '02',
    name: 'SECURITY ROOM',
    sector: 'SECTOR-A // SURVEILLANCE',
    tagline: 'CCTV monitors watching empty corridors. One feed is not entirely empty.',
    description: 'Four cathode-ray tube monitors hum inside metal racks. A central terminal with Nightfall OS awaits clearance credentials.',
    x: 35,
    y: 70,
    connectedRooms: ['reception', 'lab'],
    requiredItemsToEnter: ['kane_badge'],
    soundAtmosphere: 'CRT high-pitch whine, radio static crackle.'
  },
  lab: {
    id: 'lab',
    number: '03',
    name: 'RESEARCH LABORATORY',
    sector: 'SECTOR-B // ANOMALOUS BIOLOGY',
    tagline: 'Broken containment tubes and experimental consoles. Project Nightfall birthplace.',
    description: 'Greenish liquid covers the tile flooring. Shattered cylindrical tanks stand empty. A sequencing console flashes with ancient symbols.',
    x: 52,
    y: 65,
    connectedRooms: ['security', 'ward'],
    requiredPuzzleToUnlock: 'security_terminal',
    soundAtmosphere: 'Bubbling condensation, warning beep intervals.'
  },
  ward: {
    id: 'ward',
    number: '04',
    name: 'PATIENT WARD',
    sector: 'SECTOR-B // HUMAN ISOLATION',
    tagline: 'Rusted beds, swaying divider curtains, and corrupted medical charts.',
    description: 'Three isolation cots line the damp corridor. A faint rustling sound emanates from behind the curtain of bed number three.',
    x: 70,
    y: 62,
    connectedRooms: ['lab', 'tunnel'],
    requiredPuzzleToUnlock: 'lab_symbols',
    soundAtmosphere: 'Distant breathing, cold draft wind.'
  },
  tunnel: {
    id: 'tunnel',
    number: '05',
    name: 'MAINTENANCE TUNNEL',
    sector: 'SECTOR-C // AUXILIARY POWER',
    tagline: 'Narrow industrial passage, exposed wiring, and power routing nodes.',
    description: 'Industrial steam pipes hiss along the ceiling. The auxiliary generator junction is offline. You have a sense of being pursued.',
    x: 75,
    y: 38,
    connectedRooms: ['ward', 'archive'],
    requiredPuzzleToUnlock: 'ward_code',
    soundAtmosphere: 'Steam hissing, deep mechanical drone, accelerating heartbeat.'
  },
  archive: {
    id: 'archive',
    number: '06',
    name: 'ARCHIVE ROOM',
    sector: 'SECTOR-C // CLASSIFIED STORAGE',
    tagline: 'Towering shelves of magnetic tape, microfiche, and sealed director dossiers.',
    description: 'Rows upon rows of dusty file cabinets and magnetic reels. The terminal index contains fragmented records of the facility lockdown.',
    x: 52,
    y: 32,
    connectedRooms: ['tunnel', 'red_room'],
    requiredPuzzleToUnlock: 'tunnel_power',
    soundAtmosphere: 'Paper rustling, magnetic tape flutter.'
  },
  red_room: {
    id: 'red_room',
    number: '07',
    name: 'THE RED ROOM',
    sector: 'SECTOR-D // ANOMALOUS CORE',
    tagline: 'Saturated blood-red emergency light, spatial distortion, and THE OBSERVER.',
    description: 'The geometry of this chamber defies architectural sanity. Crimson light bathes the walls. An entity lingers just outside your peripheral vision.',
    x: 32,
    y: 28,
    connectedRooms: ['archive', 'exit'],
    requiredPuzzleToUnlock: 'archive_lock',
    soundAtmosphere: 'Sub-bass pressure wave, reversed audio textures, erratic static.'
  },
  exit: {
    id: 'exit',
    number: '08',
    name: 'THE EXIT',
    sector: 'SECTOR-E // SURFACE EVACUATION',
    tagline: 'Massive hydraulic blast door. The only barrier between you and the surface.',
    description: 'A reinforced steel hatch sealed by three independent cryptographic locks. Beyond it lies the surface air... or whatever remains.',
    x: 18,
    y: 22,
    connectedRooms: ['red_room'],
    requiredPuzzleToUnlock: 'red_room_observer',
    soundAtmosphere: 'Wind rushing through cracks, hydraulic pressure hum.'
  }
};
