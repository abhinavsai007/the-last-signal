import React, { useState } from 'react';
import { Key, FileText, Terminal as TerminalIcon, DoorClosed, DoorOpen, AlertTriangle, ArrowRight, Map, Check } from 'lucide-react';
import { InventoryItem, JournalEntry, RoomId } from '../../types/game';
import { TerminalInterface } from '../TerminalInterface';
import { audioEngine } from '../../services/audioEngine';

interface ReceptionRoomProps {
  onCollectItem: (item: InventoryItem) => void;
  onAddJournal: (entry: JournalEntry) => void;
  onUnlockRoom: (roomId: RoomId) => void;
  onNavigateToRoom: (roomId: RoomId) => void;
  onReturnToMap: () => void;
  inventory: InventoryItem[];
  badgeCollected: boolean;
  doorUnlocked: boolean;
}

export const ReceptionRoom: React.FC<ReceptionRoomProps> = ({
  onCollectItem,
  onAddJournal,
  onUnlockRoom,
  onNavigateToRoom,
  onReturnToMap,
  inventory,
  badgeCollected,
  doorUnlocked
}) => {
  const [activeInspection, setActiveInspection] = useState<'none' | 'note' | 'terminal' | 'desk'>('none');
  const [flickerTrigger, setFlickerTrigger] = useState(false);

  const hasBadge = inventory.some(i => i.id === 'kane_badge') || badgeCollected;

  const handleTakeBadge = () => {
    if (hasBadge) return;

    audioEngine.playTerminalBeep('success');
    audioEngine.playFluorescentFlicker();
    setFlickerTrigger(true);
    setTimeout(() => setFlickerTrigger(false), 900);

    const badgeItem: InventoryItem = {
      id: 'kane_badge',
      name: "Dr. Kane's Security Clearance Badge",
      description: 'Laminated keycard for Dr. Victor Kane, Lead Bio-Resonance Researcher. Sector A clearance magnetic stripe intact.',
      category: 'key',
      icon: 'key',
      inspectedText: 'ID: KANE-0317\nCLEARANCE: LEVEL 1 (SECTOR A: RECEPTION & SECURITY)\nNOTICE: Report all unverified radio transmissions to Director Mercer.',
      foundIn: 'Reception Desk'
    };

    onCollectItem(badgeItem);
    onUnlockRoom('security');
    onAddJournal({
      id: `journal-kane-${Date.now()}`,
      title: "Dr. Kane's Badge Recovered",
      content: 'Found Dr. Victor Kane\'s level 1 access pass tucked beneath the shattered terminal on the reception desk. Card ID reads KANE-0317.',
      timestamp: '03:17 AM',
      source: 'Reception'
    });
  };

  const handleOpenNote = () => {
    audioEngine.playTerminalBeep('key');
    setActiveInspection('note');

    const noteItem: InventoryItem = {
      id: 'note_warning',
      name: 'Bloody Handwritten Note',
      description: 'Torn legal pad sheet scribbled in trembling red ballpoint ink.',
      category: 'document',
      icon: 'file',
      inspectedText: '"IF YOU HEAR YOUR NAME OVER THE SPEAKERS, DO NOT ANSWER.\nIT IS NOT MERCER. IT IS NOT RESCUE."',
      foundIn: 'Reception Desk'
    };

    if (!inventory.some(i => i.id === 'note_warning')) {
      onCollectItem(noteItem);
      onAddJournal({
        id: `journal-note-${Date.now()}`,
        title: 'Chilling Warning Note',
        content: '"IF YOU HEAR YOUR NAME OVER THE SPEAKERS, DO NOT ANSWER." The handwriting deteriorated towards the bottom of the page.',
        timestamp: '03:17 AM',
        source: 'Reception Desk'
      });
    }
  };

  const handleUseBadgeOnTerminal = () => {
    if (!hasBadge) {
      audioEngine.playTerminalBeep('error');
      return;
    }

    audioEngine.playTerminalBeep('success');
    audioEngine.playMetalClang();
    onUnlockRoom('security');
    setFlickerTrigger(true);
    setTimeout(() => setFlickerTrigger(false), 800);
  };

  return (
    <div className={`relative min-h-[85vh] w-full bg-zinc-950 text-zinc-200 font-terminal p-4 sm:p-8 flex flex-col justify-between overflow-hidden border border-zinc-850 shadow-2xl ${
      flickerTrigger ? 'animate-flicker' : ''
    }`}>
      {/* Visual Environment Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black pointer-events-none opacity-90" />
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />

      {/* Room Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-red-950 text-red-400 border border-red-900 font-bold">ROOM 01</span>
            <h2 className="text-xl font-cinematic font-black tracking-wider text-white">RECEPTION SECTOR</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Ground level arrival station. Dust particles hang suspended in the beam of emergency light.</p>
        </div>

        <button
          onClick={onReturnToMap}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Map className="w-3.5 h-3.5 text-zinc-400" />
          <span>FACILITY MAP</span>
        </button>
      </div>

      {/* Main Room Interaction Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1 items-start">
        {/* Left Column: Environmental Objects */}
        <div className="space-y-4">
          <div className="p-4 bg-black/60 border border-zinc-800">
            <h3 className="font-bold text-zinc-300 tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              SURROUNDINGS
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              The front desk is overturned. Shattered monitor glass crunches underfoot. A flickering fluorescent tube overhead clicks rhythmically.
            </p>

            {/* Interactive Object 1: Reception Desk */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveInspection('desk')}
                className="w-full text-left p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <div>
                  <span className="font-bold text-white block">OVERTURNED RECEPTION DESK</span>
                  <span className="text-[10px] text-zinc-500">Scattered papers and broken electronics</span>
                </div>
                <span className="text-red-400 text-xs font-mono">[INSPECT]</span>
              </button>

              {/* Interactive Object 2: Handwritten Note */}
              <button
                onClick={handleOpenNote}
                className="w-full text-left p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  <div>
                    <span className="font-bold text-white block">TORN NOTEPAD SHEET</span>
                    <span className="text-[10px] text-zinc-500">Pinned to the counter with a scalpel</span>
                  </div>
                </div>
                <span className="text-red-400 text-xs font-mono">[READ]</span>
              </button>

              {/* Interactive Object 3: Damaged Security Terminal */}
              <button
                onClick={() => setActiveInspection('terminal')}
                className="w-full text-left p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block">MAGNETIC DOOR CONSOLE</span>
                    <span className="text-[10px] text-zinc-500">Controls heavy blast door to Security Room</span>
                  </div>
                </div>
                <span className="text-emerald-400 text-xs font-mono">[CONSOLE]</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center Column: Detailed Inspection View */}
        <div className="lg:col-span-2">
          {activeInspection === 'none' && (
            <div className="p-8 bg-black/40 border border-zinc-800 text-center flex flex-col items-center justify-center min-h-[320px]">
              <AlertTriangle className="w-8 h-8 text-zinc-700 mb-3" />
              <p className="text-sm font-bold text-zinc-400">SELECT AN OBJECT IN THE RECEPTION ROOM TO INVESTIGATE</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-md">
                Examine the overturned desk, inspect the handwritten note, or access the magnetic door terminal.
              </p>
            </div>
          )}

          {/* Desk Inspection */}
          {activeInspection === 'desk' && (
            <div className="p-6 bg-black/80 border border-zinc-700 text-xs space-y-4 animate-in fade-in">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
                <div>
                  <h4 className="font-bold text-white text-sm">SEARCHING RECEPTION DESK</h4>
                  <p className="text-zinc-500">Beneath overturned binders and damp debris...</p>
                </div>
                <button
                  onClick={() => setActiveInspection('none')}
                  className="text-zinc-500 hover:text-white"
                >
                  [CLOSE]
                </button>
              </div>

              <p className="text-zinc-300 leading-relaxed">
                You sift through water-damaged visitor logs from October 2026. Tucked beneath an unplugged CRT monitor, a plastic security lanyard glints in the emergency strobe.
              </p>

              {!hasBadge ? (
                <div className="p-4 bg-red-950/30 border border-red-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-red-300 block">DR. VICTOR KANE'S ACCESS BADGE</span>
                    <span className="text-[11px] text-zinc-400">Clearance Level 1 (Sector A)</span>
                  </div>
                  <button
                    onClick={handleTakeBadge}
                    className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white font-bold text-xs tracking-wider border border-red-600 cursor-pointer"
                  >
                    TAKE BADGE
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Dr. Kane's badge has already been recovered and placed in your satchel.</span>
                </div>
              )}
            </div>
          )}

          {/* Note Inspection */}
          {activeInspection === 'note' && (
            <div className="p-6 bg-black/90 border border-red-950 text-xs space-y-4 animate-in fade-in">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
                <span className="text-red-500 font-bold tracking-widest text-sm">HANDWRITTEN ADVISORY</span>
                <button
                  onClick={() => setActiveInspection('none')}
                  className="text-zinc-500 hover:text-white"
                >
                  [CLOSE]
                </button>
              </div>

              <div className="p-5 bg-zinc-950 border border-red-900/60 font-mono text-zinc-200 text-sm leading-relaxed whitespace-pre-line shadow-inner">
                {`"IF YOU HEAR YOUR NAME OVER THE SPEAKERS, DO NOT ANSWER.

IT IS NOT MERCER. IT IS NOT RESCUE.

IT HAS LEARNED TO MIMIC THE NIGHT WATCHMEN'S CADENCE.
LOCK THE SECURITY ROOM DOOR BEHIND YOU."`}
              </div>
            </div>
          )}

          {/* Terminal Console Inspection */}
          {activeInspection === 'terminal' && (
            <div className="space-y-4 animate-in fade-in">
              <TerminalInterface
                title="RECEPTION SECTOR-A RELAY"
                systemName="DOOR-LOCK-01"
                theme="green"
                isUnlocked={doorUnlocked}
                initialLines={[
                  'INITIALIZING DOOR LOCK CONTROLLER...',
                  'INTERLOCK STATUS: SECURED (MAGNETIC HOLD ACTIVE)',
                  doorUnlocked ? 'SECURITY CLEARANCE VERIFIED: LEVEL 1' : 'ACCESS DENIED: KEYCARD SWIPE REQUIRED'
                ]}
                unlockedContent={
                  <div className="text-emerald-400">
                    <p className="font-bold">RELAY RELEASED // MAGNETIC SOLENOID DE-ENERGIZED.</p>
                    <p className="text-xs text-zinc-400 mt-1">The heavy security door clicks open with a pneumatic hiss.</p>
                  </div>
                }
              />

              {!doorUnlocked && (
                <div className="p-4 bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-300 block">KEYCARD SCANNER APERTURE</span>
                    <span className="text-[11px] text-zinc-500">
                      {hasBadge ? 'Kane\'s Level 1 Badge detected in inventory.' : 'Requires Dr. Kane\'s Badge (search the desk).'}
                    </span>
                  </div>
                  <button
                    onClick={handleUseBadgeOnTerminal}
                    disabled={!hasBadge}
                    className={`px-4 py-2 font-bold text-xs border transition-colors cursor-pointer ${
                      hasBadge
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    SWIPE DR. KANE'S BADGE
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Passage: Security Room Door */}
      <div className="relative z-10 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {doorUnlocked ? (
            <DoorOpen className="w-5 h-5 text-emerald-400 animate-pulse" />
          ) : (
            <DoorClosed className="w-5 h-5 text-red-500" />
          )}
          <div>
            <span className="text-xs font-bold text-zinc-300 block">
              DOOR TO SECURITY ROOM (ROOM 02): {doorUnlocked ? 'SLIGHTLY AJAR' : 'SEALED'}
            </span>
            <span className="text-[11px] text-zinc-500">
              {doorUnlocked ? 'A pale green light spills through the cracked door.' : 'Requires magnetic badge authorization.'}
            </span>
          </div>
        </div>

        {doorUnlocked && (
          <button
            onClick={() => onNavigateToRoom('security')}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-950 hover:bg-red-900 border border-red-700 text-white font-cinematic font-bold text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(179,0,24,0.4)]"
          >
            <span>PROCEED INTO SECURITY ROOM</span>
            <ArrowRight className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};
