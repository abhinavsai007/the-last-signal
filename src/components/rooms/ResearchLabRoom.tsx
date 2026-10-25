import React, { useState } from 'react';
import { FlaskConical, AlertTriangle, ArrowRight, Map, RefreshCw, CheckCircle, FileText, Check } from 'lucide-react';
import { InventoryItem, JournalEntry, RoomId } from '../../types/game';
import { audioEngine } from '../../services/audioEngine';

interface ResearchLabRoomProps {
  onCollectItem: (item: InventoryItem) => void;
  onAddJournal: (entry: JournalEntry) => void;
  onUnlockRoom: (roomId: RoomId) => void;
  onNavigateToRoom: (roomId: RoomId) => void;
  onReturnToMap: () => void;
  inventory: InventoryItem[];
  symbolsSolved: boolean;
  onSolveSymbols: () => void;
}

interface SymbolItem {
  id: string;
  glyph: string;
  name: string;
  code: string;
}

export const ResearchLabRoom: React.FC<ResearchLabRoomProps> = ({
  onCollectItem,
  onAddJournal,
  onUnlockRoom,
  onNavigateToRoom,
  onReturnToMap,
  inventory,
  symbolsSolved,
  onSolveSymbols
}) => {
  const allSymbols: SymbolItem[] = [
    { id: 'sym-3', glyph: '⏣', name: 'Containment Matrix', code: 'MATRIX' },
    { id: 'sym-1', glyph: '☤', name: 'Caduceus Helix', code: 'HELIX' },
    { id: 'sym-4', glyph: '⎊', name: 'Resonator Coil', code: 'RESONATOR' },
    { id: 'sym-2', glyph: '☣', name: 'Biohazard Seal', code: 'BIO' }
  ];

  // Cryptic harmonic liturgy: HELIX -> BIO -> MATRIX -> RESONATOR
  const targetSequence = ['sym-1', 'sym-2', 'sym-3', 'sym-4'];

  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);
  const [showHiddenDoc, setShowHiddenDoc] = useState(false);

  const handleSelectSymbol = (symId: string) => {
    if (symbolsSolved || currentSequence.includes(symId)) return;

    audioEngine.playTerminalBeep('key');
    const nextSeq = [...currentSequence, symId];
    setCurrentSequence(nextSeq);
    setErrorMessage(null);

    // If 4 chosen, evaluate
    if (nextSeq.length === targetSequence.length) {
      const isCorrect = nextSeq.every((val, idx) => val === targetSequence[idx]);
      if (isCorrect) {
        audioEngine.playTerminalBeep('success');
        audioEngine.playStaticBurst(0.5, 0.4);
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 600);

        onSolveSymbols();
        onUnlockRoom('ward');

        onAddJournal({
          id: `journal-project-nightfall-${Date.now()}`,
          title: 'Project Nightfall Declassified',
          content: 'Experiment report restored:\n"PROJECT NIGHTFALL WAS NEVER DESIGNED TO CREATE LIFE. IT WAS DESIGNED TO DETECT SOMETHING THAT WAS ALREADY HERE."',
          timestamp: '03:17 AM',
          source: 'Research Mainframe'
        });
      } else {
        audioEngine.playTerminalBeep('error');
        setErrorMessage('HARMONIC FREQUENCY MISMATCH. SEQUENCE REJECTED.');
        setTimeout(() => {
          setCurrentSequence([]);
        }, 1200);
      }
    }
  };

  const handleResetSequence = () => {
    audioEngine.playTerminalBeep('key');
    setCurrentSequence([]);
    setErrorMessage(null);
  };

  const handleTakeHiddenDoc = () => {
    setShowHiddenDoc(true);
    audioEngine.playTerminalBeep('key');

    const docItem: InventoryItem = {
      id: 'doc_nightfall_autopsy',
      name: 'Classified Genesis Autopsy Memo',
      description: 'Charred research document detailing the initial bio-resonant specimen recovered from the sub-level cave.',
      category: 'document',
      icon: 'file',
      inspectedText: 'MEMORANDUM: SPECIMEN EPSILON\n"Subject possesses no blood vessels or cellular mitochondria. It feeds directly upon electromagnetic radiation and radio harmonics. When exposed to low frequencies, it begins to replicate human vocal frequencies."',
      foundIn: 'Broken Cryo-Tank'
    };

    if (!inventory.some(i => i.id === 'doc_nightfall_autopsy')) {
      onCollectItem(docItem);
      onAddJournal({
        id: `journal-memo-${Date.now()}`,
        title: 'Specimen Epsilon Anatomy',
        content: 'Autopsy notes describe an organism made of non-cellular electromagnetic biomass that mimics human voices over radio waves.',
        timestamp: '03:17 AM',
        source: 'Broken Cryo-Tank'
      });
    }
  };

  return (
    <div className={`relative min-h-[85vh] w-full bg-zinc-950 text-zinc-200 font-terminal p-4 sm:p-8 flex flex-col justify-between overflow-hidden border border-zinc-850 shadow-2xl ${
      isGlitching ? 'animate-glitch' : ''
    }`}>
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black pointer-events-none opacity-90" />
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />

      {/* Room Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-red-950 text-red-400 border border-red-900 font-bold">ROOM 03</span>
            <h2 className="text-xl font-cinematic font-black tracking-wider text-white">RESEARCH LABORATORY</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Shattered containment cylinders, green bioluminescent residue, and central sequencer terminal.</p>
        </div>

        <button
          onClick={onReturnToMap}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Map className="w-3.5 h-3.5 text-zinc-400" />
          <span>FACILITY MAP</span>
        </button>
      </div>

      {/* Main Lab Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1 items-start">
        {/* Left Column: Environmental inspection & optional secret document */}
        <div className="space-y-4">
          <div className="p-4 bg-black/60 border border-zinc-800 text-xs space-y-3">
            <h3 className="font-bold text-zinc-300 tracking-wider flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>CONTAINMENT ROW 04</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Three giant acrylic cylinders have been ruptured from the inside. Viscous slime trails lead across the floor towards the ventilation ducts.
            </p>

            <button
              onClick={handleTakeHiddenDoc}
              className="w-full text-left p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-400" />
                <div>
                  <span className="font-bold text-white block">SEARCH SHATTERED CRYO-TANK</span>
                  <span className="text-[10px] text-zinc-500">Charred autopsy memo trapped in glass</span>
                </div>
              </div>
              <span className="text-red-400 font-mono text-xs">[INSPECT]</span>
            </button>
          </div>

          {/* Clue Reminder Box */}
          <div className="p-4 bg-red-950/20 border border-red-900/40 text-xs text-zinc-400 space-y-2">
            <span className="font-bold text-red-400 block tracking-wider">LABORATORY KEYTAG INSCRIPTION:</span>
            <p className="italic text-zinc-300">
              "The sequence aligns from origin to breach, lattice to coil."
            </p>
          </div>
        </div>

        {/* Center & Right Columns: Symbol Sequence Terminal */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-black/90 border border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs font-bold text-emerald-400 tracking-widest block">BIO-RESONANCE SEQUENCER</span>
                <span className="text-[10px] text-zinc-500">CALIBRATE HARMONIC SYMBOLS TO DECRYPT MAINFRAME</span>
              </div>
              {symbolsSolved ? (
                <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-700 text-xs font-bold">
                  SEQUENCE RESTORED
                </span>
              ) : (
                <button
                  onClick={handleResetSequence}
                  className="flex items-center gap-1 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>RESET</span>
                </button>
              )}
            </div>

            {/* Chosen Sequence Slots */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[0, 1, 2, 3].map(slotIdx => {
                const symId = currentSequence[slotIdx];
                const sym = allSymbols.find(s => s.id === symId);
                return (
                  <div
                    key={slotIdx}
                    className={`h-24 flex flex-col items-center justify-center border-2 transition-all ${
                      symbolsSolved
                        ? 'border-emerald-600 bg-emerald-950/30 text-emerald-300'
                        : sym
                        ? 'border-zinc-400 bg-zinc-900 text-white'
                        : 'border-zinc-800 border-dashed bg-black/40 text-zinc-700'
                    }`}
                  >
                    {sym ? (
                      <>
                        <span className="text-3xl font-serif mb-1">{sym.glyph}</span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{sym.code}</span>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-700">SLOT 0{slotIdx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 mb-4 bg-red-950/60 border border-red-800 text-red-300 text-xs font-bold animate-pulse text-center">
                {errorMessage}
              </div>
            )}

            {/* Available Symbols Selector Buttons */}
            {!symbolsSolved && (
              <div className="space-y-3">
                {/* Cryptic Inscription on Glass */}
                <div className="p-3 bg-zinc-950/90 border border-zinc-800 text-[11px] font-mono leading-relaxed space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>ETCHED GLASS LITURGY // GENESIS SEQUENCE:</span>
                  </div>
                  <p className="text-zinc-400 italic">
                    "I. First came the dual serpents of healing...<br />
                    II. Then the biological contagion broke containment...<br />
                    III. Bound within the crystalline matrix...<br />
                    IV. Until the coil amplified the scream into our minds."
                  </p>
                </div>

                <span className="text-[11px] text-zinc-500 block mb-2">INPUT HARMONIC GLYPHS ACCORDING TO THE LITURGY:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {allSymbols.map(sym => {
                    const isSelected = currentSequence.includes(sym.id);
                    return (
                      <button
                        key={sym.id}
                        onClick={() => handleSelectSymbol(sym.id)}
                        disabled={isSelected}
                        className={`p-3 border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black border-zinc-800 text-zinc-700 cursor-not-allowed opacity-50'
                            : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-400 text-zinc-200'
                        }`}
                      >
                        <span className="text-3xl mb-1">{sym.glyph}</span>
                        <span className="text-[10px] font-bold tracking-wider">{sym.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unlocked Experiment Report Content */}
            {symbolsSolved && (
              <div className="mt-4 p-5 bg-zinc-950 border border-emerald-900/80 text-xs space-y-3 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-zinc-800 pb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>PROJECT NIGHTFALL // EXPERIMENT DEBRIEF #77</span>
                </div>
                <div className="p-4 bg-black border border-emerald-950 text-sm leading-relaxed text-zinc-200 font-serif italic">
                  "PROJECT NIGHTFALL WAS NEVER DESIGNED TO CREATE LIFE.
                  <br /><br />
                  <span className="text-red-400 font-bold not-italic font-terminal">
                    IT WAS DESIGNED TO DETECT SOMETHING THAT WAS ALREADY HERE.
                  </span>"
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Pneumatic interlock to Room 04 (Patient Ward) has disengaged.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Passage: Patient Ward Door */}
      <div className="relative z-10 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs">
          <span className="font-bold text-zinc-300 block">
            DOOR TO PATIENT WARD (ROOM 04): {symbolsSolved ? 'OPEN' : 'SEALED'}
          </span>
          <span className="text-[11px] text-zinc-500">
            {symbolsSolved ? 'Medical isolation door unlocked.' : 'Requires solving the bio-resonance sequencer puzzle.'}
          </span>
        </div>

        {symbolsSolved && (
          <button
            onClick={() => onNavigateToRoom('ward')}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-950 hover:bg-red-900 border border-red-700 text-white font-cinematic font-bold text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(179,0,24,0.4)]"
          >
            <span>ENTER PATIENT WARD</span>
            <ArrowRight className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};
