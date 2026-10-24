import React, { useState, useEffect } from 'react';
import { Radio, Eye, EyeOff, AlertOctagon, ArrowRight, Map, CheckCircle2, RefreshCw } from 'lucide-react';
import { InventoryItem, JournalEntry, RoomId } from '../../types/game';
import { audioEngine } from '../../services/audioEngine';

interface RedRoomProps {
  onCollectItem: (item: InventoryItem) => void;
  onAddJournal: (entry: JournalEntry) => void;
  onUnlockRoom: (roomId: RoomId) => void;
  onNavigateToRoom: (roomId: RoomId) => void;
  onReturnToMap: () => void;
  inventory: InventoryItem[];
  observerSpottedCount: number;
  onSpotObserver: () => void;
  glyphsActivated: string[];
  onActivateGlyph: (glyphId: string) => void;
  exitUnlocked: boolean;
  onUnlockExit: () => void;
  reducedMotion: boolean;
}

export const RedRoom: React.FC<RedRoomProps> = ({
  onCollectItem,
  onAddJournal,
  onUnlockRoom,
  onNavigateToRoom,
  onReturnToMap,
  inventory,
  observerSpottedCount,
  onSpotObserver,
  glyphsActivated,
  onActivateGlyph,
  exitUnlocked,
  onUnlockExit,
  reducedMotion
}) => {
  // The Observer silhouette appearance timer
  const [observerVisible, setObserverVisible] = useState(false);
  const [observerPosition, setObserverPosition] = useState<'left' | 'right' | 'center'>('left');
  const [isDistorting, setIsDistorting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 3 Tuning nodes
  const resonantNodes = [
    { id: 'node-freq-1', name: 'GLYPH ALPHA', freq: '433.9 MHz', harmonic: 'Sub-harmonic pulse' },
    { id: 'node-freq-2', name: 'GLYPH BETA', freq: '144.8 MHz', harmonic: 'Binaural resonance' },
    { id: 'node-freq-3', name: 'GLYPH GAMMA', freq: '88.3 MHz', harmonic: 'Carrier wave' }
  ];

  // Observer behavior loop
  useEffect(() => {
    if (exitUnlocked) return;

    const interval = setInterval(() => {
      const positions: ('left' | 'right' | 'center')[] = ['left', 'right', 'center'];
      const pos = positions[Math.floor(Math.random() * positions.length)];
      setObserverPosition(pos);
      setObserverVisible(true);
      audioEngine.playHeartbeat(true);

      const hideTimer = setTimeout(() => {
        setObserverVisible(false);
      }, 3500);

      return () => clearTimeout(hideTimer);
    }, 7000);

    return () => clearInterval(interval);
  }, [exitUnlocked]);

  const handleObserverStared = () => {
    // Player stared or hovered directly over The Observer
    audioEngine.playStaticBurst(0.8, 0.5);
    audioEngine.playWhisper();
    setIsDistorting(true);
    setObserverVisible(false);
    onSpotObserver();

    setTimeout(() => {
      setIsDistorting(false);
    }, 900);
  };

  const handleActivateNode = (nodeId: string) => {
    if (exitUnlocked || glyphsActivated.includes(nodeId)) return;

    // If observer is visible while tuning, brief interference
    if (observerVisible) {
      audioEngine.playTerminalBeep('error');
      audioEngine.playStaticBurst(0.4, 0.3);
      setErrorMessage('HIGH-ENTROPY DISTORTION! AVERT GAZE FROM THE OBSERVER BEFORE TUNING GLYPHS.');
      setTimeout(() => setErrorMessage(null), 2500);
      return;
    }

    audioEngine.playTerminalBeep('success');
    audioEngine.playWhisper();
    onActivateGlyph(nodeId);

    const nextActivated = [...glyphsActivated, nodeId];
    if (nextActivated.length === 3) {
      audioEngine.playTerminalBeep('success');
      audioEngine.playSiren();
      onUnlockExit();
      onUnlockRoom('exit');

      const masterKeyItem: InventoryItem = {
        id: 'observer_cipher',
        name: 'The Observer Resonant Matrix',
        description: 'Harmonized cipher allowing final disengagement of the facility emergency blast doors.',
        category: 'code',
        icon: 'key',
        inspectedText: '"YOU WERE NOT INVESTIGATING THE SIGNAL.\nTHE SIGNAL WAS WAITING FOR YOU.\nFINAL DECOUPLING CODE: 482-NIGHTFALL"',
        foundIn: 'The Red Room Monolith'
      };
      onCollectItem(masterKeyItem);

      onAddJournal({
        id: `journal-observer-${Date.now()}`,
        title: 'The Observer Encounter',
        content: 'Chilling revelation upon harmonizing the glyphs:\n"YOU WERE NOT INVESTIGATING THE SIGNAL. THE SIGNAL WAS WAITING FOR YOU." Final blast hatch to surface is unsealed.',
        timestamp: '03:17 AM',
        source: 'The Red Room'
      });
    }
  };

  return (
    <div className={`relative min-h-[85vh] w-full bg-[#120103] text-zinc-200 font-terminal p-4 sm:p-8 flex flex-col justify-between overflow-hidden border-2 border-red-900 shadow-[0_0_80px_rgba(179,0,24,0.5)] ${
      isDistorting ? 'animate-glitch' : ''
    }`}>
      {/* Deep Red Volumetric Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/70 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-65 pointer-events-none" />
      <div className="absolute inset-0 crt-vignette pointer-events-none" />

      {/* The Observer Entity Silhouette */}
      {observerVisible && !exitUnlocked && (
        <div
          onClick={handleObserverStared}
          onMouseEnter={handleObserverStared}
          className={`absolute bottom-12 z-20 cursor-pointer transition-all duration-700 ${
            observerPosition === 'left' ? 'left-8 sm:left-24' : observerPosition === 'right' ? 'right-8 sm:right-24' : 'left-1/2 -translate-x-1/2'
          }`}
        >
          <div className="relative flex flex-col items-center">
            {/* Dark elongated humanoid silhouette with faint crimson pinprick eyes */}
            <div className="w-10 h-10 bg-black/95 rounded-full shadow-[0_0_35px_#dc2626] flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="w-14 h-48 bg-black/90 rounded-t-lg -mt-2 shadow-[0_0_40px_rgba(0,0,0,1)]" />
            <span className="text-[9px] text-red-500/80 font-mono tracking-widest mt-2 animate-pulse">
              [ THE OBSERVER ]
            </span>
          </div>
        </div>
      )}

      {/* Room Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-red-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-red-900 text-white font-bold">ROOM 07</span>
            <h2 className="text-xl font-cinematic font-black tracking-widest text-red-500">
              THE RED ROOM // ANOMALOUS CORE
            </h2>
          </div>
          <p className="text-xs text-red-300/80 mt-1">Spatial distortion chamber. Saturated in monochromatic emergency crimson.</p>
        </div>

        <button
          onClick={onReturnToMap}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Map className="w-3.5 h-3.5 text-zinc-400" />
          <span>FACILITY MAP</span>
        </button>
      </div>

      {/* Main Gameplay Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1 items-start">
        {/* Left Column: Atmospheric advisory & Observer Warning */}
        <div className="space-y-4">
          <div className="p-4 bg-black/80 border border-red-900/80 text-xs space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <EyeOff className="w-4 h-4 text-red-500" />
              <span>SURVIVAL MECHANIC: AVERT YOUR GAZE</span>
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              THE OBSERVER drifts along the periphery of the chamber. Do not stare or interact with the entity directly, or static interference will corrupt the resonant coils.
            </p>
            <div className="p-2.5 bg-red-950/60 border border-red-800 text-[10px] text-red-300">
              Observer visual encounters logged: <strong>{observerSpottedCount}</strong>
            </div>
          </div>
        </div>

        {/* Center & Right Column: 3 Resonant Glyphs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-black/90 border border-red-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-red-900/60">
              <div>
                <span className="text-xs font-bold text-red-400 tracking-widest block">
                  ACOUSTIC HARMONIZATION MONOLITH
                </span>
                <span className="text-[10px] text-zinc-500">CALIBRATE ALL 3 GLYPHS TO OPEN BLAST GATE</span>
              </div>
              <span className={`text-xs px-2.5 py-1 font-bold border ${
                exitUnlocked ? 'bg-emerald-950 border-emerald-600 text-emerald-400' : 'bg-red-950 border-red-700 text-red-400'
              }`}>
                {exitUnlocked ? 'RESONANCE STABILIZED' : `${glyphsActivated.length}/3 GLYPHS TUNED`}
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 mb-4 bg-red-950 border border-red-700 text-red-300 text-xs font-bold text-center animate-pulse">
                {errorMessage}
              </div>
            )}

            {/* Glyph buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {resonantNodes.map(node => {
                const isTuned = glyphsActivated.includes(node.id) || exitUnlocked;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleActivateNode(node.id)}
                    disabled={isTuned}
                    className={`p-4 border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                      isTuned
                        ? 'bg-red-950/60 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-red-600 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-red-500 font-bold block mb-1">
                        {node.freq}
                      </span>
                      <span className="text-xs font-bold text-white block mb-1">
                        {node.name}
                      </span>
                      <p className="text-[10px] text-zinc-400">{node.harmonic}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-red-950 flex justify-between items-center text-[10px]">
                      <span className={isTuned ? 'text-red-400 font-bold' : 'text-zinc-600'}>
                        {isTuned ? 'HARMONIZED' : 'DORMANT'}
                      </span>
                      {!isTuned && (
                        <span className="text-red-400 font-mono">[TUNE]</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Story Revelation */}
            {exitUnlocked && (
              <div className="p-6 bg-red-950/40 border-2 border-red-700 text-center space-y-3 animate-in zoom-in-95">
                <AlertOctagon className="w-8 h-8 text-red-500 mx-auto animate-pulse" />
                <p className="font-cinematic text-lg sm:text-2xl font-black text-red-400 tracking-wider">
                  "YOU WERE NOT INVESTIGATING THE SIGNAL.
                </p>
                <p className="font-cinematic text-xl sm:text-3xl font-black text-white tracking-widest">
                  THE SIGNAL WAS WAITING FOR YOU."
                </p>
                <p className="text-zinc-300 text-xs max-w-lg mx-auto leading-relaxed pt-2">
                  The harmonic frequencies have matched. The final emergency exit console in Room 08 is powered and ready for escape.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Passage: The Exit Door */}
      <div className="relative z-10 pt-4 border-t border-red-900/60 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs">
          <span className="font-bold text-zinc-300 block">
            PORTAL TO FINAL EMERGENCY BLAST DOOR (ROOM 08): {exitUnlocked ? 'UNSEALED' : 'SEALED'}
          </span>
          <span className="text-[11px] text-zinc-500">
            {exitUnlocked ? 'Surface evacuation hatch active.' : 'Requires tuning all 3 resonant glyphs.'}
          </span>
        </div>

        {exitUnlocked && (
          <button
            onClick={() => onNavigateToRoom('exit')}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-950 hover:bg-red-900 border border-red-700 text-white font-cinematic font-bold text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_25px_rgba(179,0,24,0.6)] animate-pulse"
          >
            <span>PROCEED TO FINAL EMERGENCY EXIT</span>
            <ArrowRight className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};
