import React, { useState, useEffect } from 'react';
import { Camera, Terminal as TerminalIcon, Key, ArrowRight, ArrowLeft, Map, AlertTriangle, Eye, ShieldCheck, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { InventoryItem, JournalEntry, RoomId } from '../../types/game';
import { CCTVMonitor } from '../CCTVMonitor';
import { TerminalInterface } from '../TerminalInterface';
import { audioEngine } from '../../services/audioEngine';

interface SecurityRoomProps {
  onCollectItem: (item: InventoryItem) => void;
  onAddJournal: (entry: JournalEntry) => void;
  onUnlockRoom: (roomId: RoomId) => void;
  onNavigateToRoom: (roomId: RoomId) => void;
  onReturnToMap: () => void;
  inventory: InventoryItem[];
  terminalUnlocked: boolean;
  onUnlockTerminal?: () => void;
}

export const SecurityRoom: React.FC<SecurityRoomProps> = ({
  onCollectItem,
  onAddJournal,
  onUnlockRoom,
  onNavigateToRoom,
  onReturnToMap,
  inventory,
  terminalUnlocked,
  onUnlockTerminal
}) => {
  const hasLabKey = inventory.some(i => i.id === 'lab_key');
  const [labKeyTaken, setLabKeyTaken] = useState(hasLabKey);
  const [isUnlocked, setIsUnlocked] = useState(terminalUnlocked || hasLabKey);
  const [activeTab, setActiveTab] = useState<'cctv' | 'terminal'>('cctv');

  useEffect(() => {
    if (terminalUnlocked || hasLabKey) {
      setIsUnlocked(true);
    }
  }, [terminalUnlocked, hasLabKey]);

  useEffect(() => {
    if (hasLabKey) {
      setLabKeyTaken(true);
    }
  }, [hasLabKey]);

  const handleSilhouetteSpotted = () => {
    onAddJournal({
      id: `journal-silhouette-${Date.now()}`,
      title: 'Corridor Entity Sighting',
      content: 'CAM-02 (Main Corridor) captured a tall, non-human silhouette standing motionless under the red emergency bulb. It disappeared when the feed glitched.',
      timestamp: '03:17 AM',
      source: 'CCTV Feed 02'
    });
  };

  const handlePasswordSuccess = () => {
    setIsUnlocked(true);
    onUnlockTerminal?.();
    audioEngine.playTerminalBeep('success');

    onAddJournal({
      id: `journal-sec-unlocked-${Date.now()}`,
      title: 'Security Terminal Decrypted',
      content: 'Incident recording confirms: "CONTAINMENT BREACH CONFIRMED. ALL PERSONNEL MUST PROCEED TO THE EMERGENCY EXIT. DO NOT FOLLOW VOICES FROM UNAUTHORIZED LOCATIONS."',
      timestamp: '03:17 AM',
      source: 'Security Terminal'
    });
  };

  const handleTakeLabKey = () => {
    if (labKeyTaken) return;

    setLabKeyTaken(true);
    setIsUnlocked(true);
    audioEngine.playTerminalBeep('success');
    audioEngine.playMetalClang();

    const labKeyItem: InventoryItem = {
      id: 'lab_key',
      name: 'Bio-Containment Lab Keycard',
      description: 'Heavy magnetic badge granting entrance to Sector B Research Laboratory. Imprinted with harmonic bio-symbols.',
      category: 'key',
      icon: 'key',
      inspectedText: 'SECTOR-B // RESEARCH LABORATORY\nCLEARANCE: LEVEL 2\nNOTE ON KEYTAG: "Sequence begins with the Caduceus helix; resonance follows the biohazard seal."',
      foundIn: 'Security Safe'
    };

    onCollectItem(labKeyItem);
    onUnlockRoom('lab');
    onUnlockTerminal?.();
  };

  return (
    <div className="relative min-h-[85vh] w-full bg-zinc-950 text-zinc-200 font-terminal p-4 sm:p-8 flex flex-col justify-between overflow-hidden border border-zinc-850 shadow-2xl">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black pointer-events-none opacity-90" />
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />

      {/* Room Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-red-950 text-red-400 border border-red-900 font-bold">ROOM 02</span>
            <h2 className="text-xl font-cinematic font-black tracking-wider text-white">SECURITY MONITORING ROOM</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Bank of flickering CRT surveillance monitors and mainframe clearance terminal.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToRoom('reception')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ROOM 01: RECEPTION</span>
          </button>

          <button
            onClick={onReturnToMap}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-zinc-400" />
            <span>FACILITY MAP</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs between CCTV and Terminal */}
      <div className="relative z-10 flex gap-2 my-4">
        <button
          onClick={() => setActiveTab('cctv')}
          className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'cctv'
              ? 'bg-red-950 border-red-700 text-red-300'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>CCTV SURVEILLANCE ARRAYS</span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'terminal'
              ? 'bg-red-950 border-red-700 text-red-300'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <TerminalIcon className="w-4 h-4" />
          <span>INCIDENT TERMINAL {isUnlocked ? '✔' : ''}</span>
        </button>
      </div>

      {/* Main Interactive Content */}
      <div className="relative z-10 my-4 flex-1">
        {activeTab === 'cctv' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <CCTVMonitor onSilhouetteSeen={handleSilhouetteSpotted} compact={false} />
            </div>

            <div className="p-5 bg-black/60 border border-zinc-800 text-xs space-y-4">
              <div className="flex items-center gap-2 text-zinc-300 font-bold border-b border-zinc-800 pb-2">
                <Eye className="w-4 h-4 text-red-500" />
                <span>SURVEILLANCE INSTRUCTIONS</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Cycle through the cameras. Keep a close watch on CAM-02 (Main Corridor). Notice where shadows shift when you cycle channels.
              </p>
              <div className="p-3 bg-red-950/20 border border-red-900/40 text-[11px] text-red-400 space-y-2">
                <div>
                  <span className="font-bold">OPERATIONAL CLUE:</span> Dr. Kane left a clearance memo pinned to the console:
                  <em className="block mt-1 text-zinc-200 font-mono">"In case of containment failure, enter security password: BREACH"</em>
                </div>

                <button
                  onClick={() => setActiveTab('terminal')}
                  className="w-full mt-2 py-1.5 px-3 bg-red-900 hover:bg-red-800 text-white font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>OPEN INCIDENT TERMINAL →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="space-y-4 max-w-3xl">
            {/* Quick helper banner */}
            {/* Cryptic security prompt */}
            {!isUnlocked && (
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 flex items-center gap-2 text-xs text-zinc-400">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
                <span>
                  MAIN TERMINAL LOCKED: Decipher Dr. Kane's clearance password or the fatal minute the alarms triggered (0317).
                </span>
              </div>
            )}

            <TerminalInterface
              title="SECTOR-A SECURITY MAINFRAME"
              systemName="STATION-02"
              theme="green"
              requiredPassword="BREACH"
              acceptedPasswords={['BREACH', 'KANE-0317', '0317', 'KANE', 'OVERRIDE', 'CONTAINMENT', 'ANOMALY']}
              isUnlocked={isUnlocked}
              onPasswordSuccess={handlePasswordSuccess}
              hint="Check the warning memo on the reception desk or the facility incident clock (0317 or BREACH)."
              initialLines={[
                'NIGHTFALL OS v4.09 - SURVEILLANCE NODE',
                'FACILITY WIDE LOCKDOWN DETECTED AT 03:17:00 AM',
                isUnlocked ? 'PASSWORD ACCEPTED: CONTAINMENT BREACH PROTOCOL RELEASED' : 'ENTER PASSCODE TO ACCESS INCIDENT RECORDING:'
              ]}
              unlockedContent={
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="p-4 bg-red-950/30 border border-red-800 text-red-300">
                    <p className="font-bold text-sm tracking-widest text-red-400 mb-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>CLASSIFIED INCIDENT RECORDING // RECOVERED</span>
                    </p>
                    <p className="italic text-xs leading-relaxed text-zinc-200 mt-2">
                      "CONTAINMENT BREACH CONFIRMED. ALL PERSONNEL MUST PROCEED TO THE EMERGENCY EXIT. DO NOT FOLLOW VOICES FROM UNAUTHORIZED LOCATIONS."
                    </p>
                  </div>

                  {!labKeyTaken ? (
                    <div className="p-4 bg-zinc-900 border border-emerald-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                      <div>
                        <span className="font-bold text-emerald-400 block text-xs">
                          LOCKER 04 CLICKED OPEN: SECTOR-B LAB KEYCARD
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Grants access to Room 03 (Research Laboratory).
                        </span>
                      </div>
                      <button
                        onClick={handleTakeLabKey}
                        className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 border border-emerald-600 text-white font-bold text-xs cursor-pointer shadow-md tracking-wider flex items-center gap-2"
                      >
                        <Key className="w-4 h-4 text-amber-400" />
                        <span>RECOVER LAB KEYCARD</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-900/80 border border-emerald-900 text-emerald-400 text-xs flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="font-bold block">Lab Keycard secured in your satchel.</span>
                          <span className="text-[11px] text-zinc-400">Sector B Research Laboratory is now accessible.</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigateToRoom('lab')}
                        className="px-5 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-white font-bold text-xs cursor-pointer tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(179,0,24,0.4)]"
                      >
                        <span>ENTER ROOM 03: LAB →</span>
                      </button>
                    </div>
                  )}
                </div>
              }
            />
          </div>
        )}
      </div>

      {/* Bottom Passage: Research Lab Door */}
      <div className="relative z-10 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs">
          <span className="font-bold text-zinc-300 block flex items-center gap-1.5">
            {labKeyTaken ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-red-500" />}
            <span>DOOR TO RESEARCH LABORATORY (ROOM 03): {labKeyTaken ? 'UNLOCKED' : 'LOCKED'}</span>
          </span>
          <span className="text-[11px] text-zinc-500">
            {labKeyTaken ? 'Bio-containment airlock cycling.' : 'Requires unlocking the incident terminal and recovering the Lab Keycard.'}
          </span>
        </div>

        {labKeyTaken && (
          <button
            onClick={() => onNavigateToRoom('lab')}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-950 hover:bg-red-900 border border-red-700 text-white font-cinematic font-bold text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(179,0,24,0.4)]"
          >
            <span>PROCEED TO RESEARCH LABORATORY (ROOM 03)</span>
            <ArrowRight className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};
