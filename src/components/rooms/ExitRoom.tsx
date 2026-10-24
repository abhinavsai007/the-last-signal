import React, { useState } from 'react';
import { DoorOpen, ShieldCheck, AlertTriangle, ArrowRight, Map, Key, Terminal, Radio } from 'lucide-react';
import { InventoryItem, JournalEntry, RoomId } from '../../types/game';
import { audioEngine } from '../../services/audioEngine';

interface ExitRoomProps {
  onCollectItem: (item: InventoryItem) => void;
  onAddJournal: (entry: JournalEntry) => void;
  onNavigateToRoom: (roomId: RoomId) => void;
  onReturnToMap: () => void;
  inventory: InventoryItem[];
  onTriggerEscape: (endingType: 'A' | 'B' | 'C') => void;
}

export const ExitRoom: React.FC<ExitRoomProps> = ({
  onCollectItem,
  onAddJournal,
  onNavigateToRoom,
  onReturnToMap,
  inventory,
  onTriggerEscape
}) => {
  const [badgeInserted, setBadgeInserted] = useState(false);
  const [researchCodeInput, setResearchCodeInput] = useState('');
  const [cipherInput, setCipherInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasBadge = inventory.some(i => i.id === 'kane_badge');
  const hasPatientCode = inventory.some(i => i.id === 'note_patient_19') || true;
  const hasOutsideDossier = inventory.some(i => i.id === 'dossier_outside_lock');

  const handleAutoFill = () => {
    setBadgeInserted(true);
    setResearchCodeInput('482');
    setCipherInput('NIGHTFALL-0317');
    audioEngine.playTerminalBeep('success');
  };

  const handleInitiateEscape = (e: React.FormEvent) => {
    e.preventDefault();

    if (!badgeInserted) {
      audioEngine.playTerminalBeep('error');
      setErrorMessage('DR. KANE’S CLEARANCE BADGE MUST BE INSERTED INTO SLOT 1.');
      return;
    }

    if (researchCodeInput.trim() !== '482') {
      audioEngine.playTerminalBeep('error');
      setErrorMessage('INVALID BIO-RESONANCE PATIENT FREQUENCY CODE.');
      return;
    }

    if (!cipherInput.toUpperCase().includes('NIGHTFALL') && !cipherInput.toUpperCase().includes('0317')) {
      audioEngine.playTerminalBeep('error');
      setErrorMessage('SURFACE LOCK OVERRIDE CIPHER INVALID.');
      return;
    }

    // Determine ending based on whether they recovered the outside dossier:
    // If they have the outside dossier and entered correct override:
    // If they also inspected the radio transcript or observer, choice can yield A or B
    const endingType = hasOutsideDossier ? (Math.random() < 0.5 ? 'A' : 'B') : 'C';

    audioEngine.playTerminalBeep('success');
    audioEngine.playMetalClang();
    onTriggerEscape(endingType);
  };

  const handleSacrificeContainment = () => {
    // Deliberate containment ending C
    audioEngine.playSiren();
    audioEngine.playTerminalBeep('alert');
    onTriggerEscape('C');
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
            <span className="text-xs px-2 py-0.5 bg-red-950 text-red-400 border border-red-900 font-bold">ROOM 08</span>
            <h2 className="text-xl font-cinematic font-black tracking-wider text-white">THE EMERGENCY EXIT</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Four-inch thick hydraulic blast hatch leading up to the surface extraction shaft.</p>
        </div>

        <button
          onClick={onReturnToMap}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Map className="w-3.5 h-3.5 text-zinc-400" />
          <span>FACILITY MAP</span>
        </button>
      </div>

      {/* Main Terminal Console Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1 items-start">
        {/* Left Column: Inventory Review of Recovered Keys */}
        <div className="space-y-4">
          <div className="p-4 bg-black/60 border border-zinc-800 text-xs space-y-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <Key className="w-4 h-4 text-amber-500" />
              <span>COLLECTED CREDENTIALS CHECKLIST</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Disengaging the surface emergency exit requires credentials gathered throughout the underground facility:
            </p>

            <div className="space-y-2 text-xs">
              <div className={`p-2.5 border flex items-center justify-between ${
                hasBadge ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' : 'bg-red-950/30 border-red-900 text-red-400'
              }`}>
                <span>1. Dr. Kane's Security Clearance Badge</span>
                <span className="font-bold">{hasBadge ? 'READY' : 'MISSING'}</span>
              </div>

              <div className="p-2.5 border bg-emerald-950/30 border-emerald-800 text-emerald-300 flex items-center justify-between">
                <span>2. Patient Ward Frequency Code</span>
                <span className="font-bold font-mono">[ 482 ]</span>
              </div>

              <div className={`p-2.5 border flex items-center justify-between ${
                hasOutsideDossier ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' : 'bg-amber-950/30 border-amber-800 text-amber-400'
              }`}>
                <span>3. Outside Override Cipher</span>
                <span className="font-bold font-mono">{hasOutsideDossier ? 'NIGHTFALL-0317' : 'UNRECOVERED'}</span>
              </div>
            </div>

            <button
              onClick={handleAutoFill}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-[11px] cursor-pointer mt-2"
            >
              [AUTO-LOAD CREDENTIALS FROM INVENTORY]
            </button>
          </div>
        </div>

        {/* Center & Right Column: Master Escape Terminal */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleInitiateEscape} className="p-6 bg-black/90 border border-zinc-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-bold text-red-400 tracking-widest block">
                SURFACE EVACUATION HYDRAULIC CONSOLE
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">PORT 08 // READY FOR PURGE</span>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950 border border-red-700 text-red-300 text-xs font-bold text-center">
                {errorMessage}
              </div>
            )}

            {/* Input 1: Card slot */}
            <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-zinc-200 block">KEYCARD SCANNER: DR. KANE LEVEL 1 BADGE</span>
                <span className="text-[10px] text-zinc-500">
                  {badgeInserted ? 'CARD ENGAGED IN READER' : 'SLOT EMPTY'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBadgeInserted(true);
                  audioEngine.playTerminalBeep('success');
                }}
                className={`px-3 py-1.5 font-bold text-xs border cursor-pointer ${
                  badgeInserted
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-400'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}
              >
                {badgeInserted ? 'INSERTED ✔' : 'INSERT BADGE'}
              </button>
            </div>

            {/* Input 2: Patient frequency code */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 block font-bold">
                PATIENT BIO-RESONANCE CODE (3 DIGITS):
              </label>
              <input
                type="text"
                value={researchCodeInput}
                onChange={e => setResearchCodeInput(e.target.value)}
                placeholder="e.g. 482"
                className="w-full bg-zinc-950 border border-zinc-700 p-2.5 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Input 3: Outside override cipher */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 block font-bold">
                SURFACE OVERRIDE CIPHER:
              </label>
              <input
                type="text"
                value={cipherInput}
                onChange={e => setCipherInput(e.target.value)}
                placeholder="e.g. NIGHTFALL-0317"
                className="w-full bg-zinc-950 border border-zinc-700 p-2.5 text-white font-mono text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Submit Escape */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 py-4 bg-red-950 hover:bg-red-900 border-2 border-red-700 hover:border-red-500 text-white font-cinematic font-bold tracking-widest text-sm shadow-[0_0_35px_rgba(179,0,24,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <DoorOpen className="w-5 h-5 text-red-400" />
                <span>DISENGAGE SURFACE BLAST DOORS & ESCAPE</span>
              </button>

              <button
                type="button"
                onClick={handleSacrificeContainment}
                title="Sacrifice yourself to seal the anomaly forever"
                className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 text-xs font-bold transition-all cursor-pointer"
              >
                [INITIATE TOTAL CONTAINMENT LOCKDOWN]
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="relative z-10 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        <span>FACILITY EXTRACTION PROTOCOL // FINAL STAGE</span>
        <span className="text-red-500 font-bold">SURFACE ELEVATION: -140 METERS</span>
      </div>
    </div>
  );
};
