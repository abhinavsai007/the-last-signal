import React from 'react';
import { Lock, Unlock, CheckCircle2, MapPin, Compass, Briefcase, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';
import { RoomId, InventoryItem } from '../types/game';
import { FACILITY_ROOMS, RoomDefinition } from '../data/facilityData';
import { audioEngine } from '../services/audioEngine';

interface FacilityMapProps {
  currentRoom: RoomId | null;
  unlockedRooms: RoomId[];
  clearedRooms: RoomId[];
  discoveredRooms: RoomId[];
  inventory: InventoryItem[];
  onSelectRoom: (roomId: RoomId) => void;
  onOpenInventory: () => void;
  onOpenJournal: () => void;
  onReturnToSurface: () => void;
}

export const FacilityMap: React.FC<FacilityMapProps> = ({
  currentRoom,
  unlockedRooms,
  clearedRooms,
  discoveredRooms,
  inventory,
  onSelectRoom,
  onOpenInventory,
  onOpenJournal,
  onReturnToSurface
}) => {
  const roomsList = Object.values(FACILITY_ROOMS);

  const handleRoomClick = (room: RoomDefinition) => {
    const hasBadge = inventory.some(i => i.id === 'kane_badge');
    const isUnlocked = unlockedRooms.includes(room.id) || (room.id === 'security' && hasBadge);
    if (!isUnlocked) {
      audioEngine.playTerminalBeep('error');
      return;
    }
    audioEngine.playTerminalBeep('success');
    audioEngine.playStaticBurst(0.2, 0.2);
    onSelectRoom(room.id);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-[#E8E8E8] flex flex-col justify-between font-terminal p-4 sm:p-6 overflow-hidden">
      {/* Blueprint Grid & Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />
      <div className="absolute inset-0 crt-vignette pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-950/80 border border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToSurface}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>SURFACE / LANDING</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-zinc-600">//</span>
            <span className="text-red-500 font-bold">NIGHTFALL FACILITY SCHEMATIC</span>
            <span className="text-zinc-500 text-[10px]">(LEVEL 4 SUB-COMPLEX)</span>
          </div>
        </div>

        {/* Action drawers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInventory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-red-950 text-zinc-300 hover:text-red-300 border border-zinc-700 hover:border-red-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
            <span>INVENTORY ({inventory.length})</span>
          </button>

          <button
            onClick={onOpenJournal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-500" />
            <span>JOURNAL & HINTS</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Blueprint Canvas */}
      <main className="relative z-10 flex-1 my-4 flex items-center justify-center">
        <div className="relative w-full max-w-5xl aspect-[16/10] max-h-[70vh] bg-zinc-950/90 border-2 border-zinc-800/90 shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden p-4">
          {/* Blueprint Heading Stamp */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-80">
            <div className="border border-red-900 px-3 py-1 bg-black/60 inline-block text-[11px] text-red-400 font-bold tracking-widest">
              CONTAINMENT SECTOR SCHEMATIC // TOP SECRET
            </div>
            <div className="text-[10px] text-zinc-600 mt-1">GRID: SUB-04-NORTH // SYSTEM INTEGRITY: 19%</div>
          </div>

          {/* SVG Connection Lines between adjacent rooms */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Draw schematic paths */}
            {roomsList.map(room => {
              return room.connectedRooms.map(targetId => {
                const target = FACILITY_ROOMS[targetId];
                if (!target) return null;
                const isConnectedUnlocked = unlockedRooms.includes(room.id) && unlockedRooms.includes(target.id);
                return (
                  <line
                    key={`${room.id}-${target.id}`}
                    x1={`${room.x}%`}
                    y1={`${room.y}%`}
                    x2={`${target.x}%`}
                    y2={`${target.y}%`}
                    stroke={isConnectedUnlocked ? '#10b981' : '#374151'}
                    strokeWidth={isConnectedUnlocked ? '2.5' : '1.5'}
                    strokeDasharray={isConnectedUnlocked ? 'none' : '4 4'}
                    opacity={isConnectedUnlocked ? '0.7' : '0.35'}
                  />
                );
              });
            })}
          </svg>

          {/* Room Nodes */}
          {roomsList.map(room => {
            const isCurrent = currentRoom === room.id;
            const hasBadge = inventory.some(i => i.id === 'kane_badge');
            const isUnlocked = unlockedRooms.includes(room.id) || (room.id === 'security' && hasBadge);
            const isCleared = clearedRooms.includes(room.id);

            return (
              <div
                key={room.id}
                style={{ left: `${room.x}%`, top: `${room.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
              >
                {/* Node Button */}
                <button
                  onClick={() => handleRoomClick(room)}
                  disabled={!isUnlocked}
                  className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3.5 border-2 transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'bg-red-950 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.7)] scale-110'
                      : isCleared
                      ? 'bg-zinc-900 border-emerald-600 text-emerald-400 hover:border-emerald-400 hover:scale-105'
                      : isUnlocked
                      ? 'bg-zinc-950 border-zinc-400 text-zinc-200 hover:border-red-500 hover:scale-105'
                      : 'bg-black/90 border-zinc-800 text-zinc-600 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Current Room Pulse Ring */}
                  {isCurrent && (
                    <span className="absolute -inset-2 border border-red-500/60 animate-ping rounded-none" />
                  )}

                  {/* Room Number & Status Icon */}
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] font-bold font-mono tracking-wider">{room.number}</span>
                    {isCleared ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isUnlocked ? (
                      <Unlock className="w-3.5 h-3.5 text-zinc-300" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-red-500" />
                    )}
                  </div>

                  {/* Room Name */}
                  <span className="text-[11px] sm:text-xs font-bold tracking-wider max-w-[100px] text-center leading-tight truncate">
                    {room.name}
                  </span>

                  {isCurrent && (
                    <span className="text-[9px] text-red-400 font-bold mt-1 tracking-widest">[YOU ARE HERE]</span>
                  )}
                </button>

                {/* Hover Tooltip Details */}
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-zinc-950 border border-zinc-700 shadow-2xl z-30 pointer-events-none text-[11px] text-left">
                  <div className="font-bold text-white mb-0.5">{room.name}</div>
                  <div className="text-[10px] text-zinc-500 mb-1">{room.sector}</div>
                  <p className="text-zinc-400 text-[10px] leading-tight mb-1.5">{room.tagline}</p>
                  <div className="text-[9px]">
                    {isUnlocked ? (
                      <span className="text-emerald-400 font-bold">ACCESS AUTHORIZED — CLICK TO ENTER</span>
                    ) : (
                      <span className="text-red-400 font-bold">LOCKED: Requires earlier room clearance</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Map Legend */}
          <div className="absolute bottom-4 right-4 z-10 p-2.5 bg-black/80 border border-zinc-800 text-[10px] space-y-1 hidden sm:block">
            <div className="font-bold text-zinc-400 tracking-wider mb-1">LEGEND:</div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="w-2.5 h-2.5 border-2 border-red-500 bg-red-950 inline-block" /> Current Location
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Puzzle Completed
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Unlock className="w-3 h-3" /> Unlocked / Accessible
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <Lock className="w-3 h-3 text-red-500" /> Locked Sector
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation Bar */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-500">
        <div>
          <span>PROGRESSION: {clearedRooms.length}/8 ROOMS RESOLVED</span>
        </div>
        <div className="text-red-400 text-xs">
          {currentRoom ? (
            <span>CURRENT SECTOR: <strong>{FACILITY_ROOMS[currentRoom].name}</strong></span>
          ) : (
            <span>SELECT ANY UNLOCKED NODE TO INVESTIGATE</span>
          )}
        </div>
      </footer>
    </div>
  );
};
