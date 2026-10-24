import React, { useState, useEffect } from 'react';
import { 
  Bed, FileText, AlertTriangle, ArrowRight, ArrowLeft, Map, Eye, Lock, 
  Activity, Skull, Volume2, ShieldAlert, Zap, Radio 
} from 'lucide-react';
import { InventoryItem, JournalEntry, RoomId } from '../../types/game';
import { audioEngine } from '../../services/audioEngine';

interface PatientWardRoomProps {
  onCollectItem: (item: InventoryItem) => void;
  onAddJournal: (entry: JournalEntry) => void;
  onUnlockRoom: (roomId: RoomId) => void;
  onNavigateToRoom: (roomId: RoomId) => void;
  onReturnToMap: () => void;
  inventory: InventoryItem[];
  inspectedRecords: string[];
  onInspectRecord: (id: string) => void;
  curtainInvestigated: boolean;
  onInvestigateCurtain: () => void;
  tunnelUnlocked: boolean;
  onUnlockTunnel: () => void;
}

export const PatientWardRoom: React.FC<PatientWardRoomProps> = ({
  onCollectItem,
  onAddJournal,
  onUnlockRoom,
  onNavigateToRoom,
  onReturnToMap,
  inventory,
  inspectedRecords,
  onInspectRecord,
  curtainInvestigated,
  onInvestigateCurtain,
  tunnelUnlocked,
  onUnlockTunnel
}) => {
  const [selectedRecord, setSelectedRecord] = useState<'07' | '19' | '42' | null>(null);
  const [curtainModalOpen, setCurtainModalOpen] = useState(false);
  const [codeAttempt, setCodeAttempt] = useState('');
  const [codeError, setCodeError] = useState(false);

  // JUMPSCARE STATES
  const [jumpscareActive, setJumpscareActive] = useState(false);
  const [blackoutTrigger, setBlackoutTrigger] = useState(false);
  const [screenShaking, setScreenShaking] = useState(false);
  const [monitorFlatlining, setMonitorFlatlining] = useState(false);
  const [ivStandFallen, setIvStandFallen] = useState(false);
  const [bloodMessageRevealed, setBloodMessageRevealed] = useState(curtainInvestigated);

  // Preload jumpscare image and roar sound assets
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/aistudio/horror-png-12_6fc05c71.png';

    const roar = new Audio();
    roar.src = '/assets/aistudio/phatphrogstudio-wendigo-horror-voice-angry-scream-growl-roar-583005_716e2a5f.mp3';
    roar.preload = 'auto';
  }, []);
  const patientData = {
    '07': {
      title: 'CHART #07: SUBJECT V. MARLOW',
      diagnosis: 'Bio-Electromagnetic Auditory Bleed',
      notes: 'Subject repeatedly slammed his forehead against the iron frame, muttering: "The entity strikes in measures of four... four gouges in the wall to keep them out." Audio telemetry confirmed four distinct pulse beats from the ductwork.',
      riddleHint: 'Four gouges on iron.'
    },
    '19': {
      title: 'CHART #19: SUBJECT S. VANCE',
      diagnosis: 'Acoustic Parasitism & Hallucinosis',
      notes: 'Marginalia scrawled in charcoal: "Eight shadows crawl across the ceiling tiles at night. Count to eight before you breathe." EEG spikes synchronized at eight-second intervals.',
      riddleHint: 'Eight shadows in the dark.'
    },
    '42': {
      title: 'CHART #42: SUBJECT UNKNOWN',
      diagnosis: 'Acute Cellular Dissolution',
      notes: 'The cot was found deserted. Only two melted dental fillings and two scorched palm prints burned into the sub-floor tiles. Scratched near the vent: "The final frequency is the duality of 2."',
      riddleHint: 'Two scorched prints.'
    }
  };

  const handleSelectRecord = (id: '07' | '19' | '42') => {
    setSelectedRecord(id);
    onInspectRecord(id);
    audioEngine.playTerminalBeep('key');

    // Trigger subtle scare on inspecting Patient 42 (missing patient)
    if (id === '42' && !monitorFlatlining) {
      triggerMonitorFlatlineScare();
    }

    if (id === '19' && !inventory.some(i => i.id === 'note_patient_19')) {
      const item: InventoryItem = {
        id: 'note_patient_19',
        name: "Patient 19's Cryptic Chart",
        description: 'Medical isolation chart with frantic marginalia.',
        category: 'document',
        icon: 'file',
        inspectedText: '"THE EXIT IS NOT WHERE THE MAP SAYS IT IS.\nTHEY POURED CONCRETE OVER THE PRIMARY AIRSHAFT."',
        foundIn: 'Patient Ward Cot 2'
      };
      onCollectItem(item);
    }
  };

  // --- JUMPSCARE 1: THE CURTAIN ENTITY JUMPSCARE ---
  const handleInvestigateCurtainAction = () => {
    setCurtainModalOpen(false);
    onInvestigateCurtain();

    // 1. Sudden audio shock stinger + Demonic Wendigo Roar/Scream
    audioEngine.playJumpscareStinger();
    audioEngine.playWendigoRoar();
    audioEngine.playHeartbeat(true);

    // 2. Violent screen shake & Jumpscare Entity Overlay
    setJumpscareActive(true);
    setScreenShaking(true);

    // 3. Entity screeches, then sudden blackout
    setTimeout(() => {
      setJumpscareActive(false);
      setBlackoutTrigger(true);
      audioEngine.playWhisper();
      audioEngine.playStaticBurst(0.6, 0.4);

      // 4. Recovery after dark raspy breathing
      setTimeout(() => {
        setBlackoutTrigger(false);
        setScreenShaking(false);
        setBloodMessageRevealed(true);
        audioEngine.playFluorescentFlicker();
      }, 1200);
    }, 2200);

    onAddJournal({
      id: `journal-curtain-${Date.now()}`,
      title: 'Curtain 03 Nightmare Apparition',
      content: 'Pulled back Curtain 3. An impossible, hollow-eyed humanoid entity lunged from the void with blinding static and deafening acoustic dissonance! When power returned, clawed scratch marks read "WHY DID YOU LOOK?"',
      timestamp: '03:17 AM',
      source: 'Patient Ward Bed 3'
    });
  };

  // --- JUMPSCARE 2: MEDICAL MONITOR FLATLINE SCARE ---
  const triggerMonitorFlatlineScare = () => {
    setMonitorFlatlining(true);
    audioEngine.playMedicalFlatline(1.6);
    setScreenShaking(true);

    setTimeout(() => {
      setScreenShaking(false);
      audioEngine.playStaticBurst(0.3, 0.3);
    }, 600);

    setTimeout(() => {
      setMonitorFlatlining(false);
    }, 3800);
  };

  // --- JUMPSCARE 3: FALLING METAL IV DRIP STAND ---
  const triggerIvStandCrash = () => {
    if (ivStandFallen) return;
    setIvStandFallen(true);
    audioEngine.playMetalClang();
    setScreenShaking(true);
    setTimeout(() => setScreenShaking(false), 350);
  };

  const handleKeypadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeAttempt.trim() === '482') {
      audioEngine.playTerminalBeep('success');
      audioEngine.playMetalClang();
      onUnlockTunnel();
      onUnlockRoom('tunnel');
      setCodeError(false);

      onAddJournal({
        id: `journal-ward-unlocked-${Date.now()}`,
        title: 'Maintenance Tunnel Access Granted',
        content: 'Entered composite patient frequency code [482]. The pneumatic hatch to Sector C Maintenance Tunnels released.',
        timestamp: '03:17 AM',
        source: 'Ward Pneumatic Hatch'
      });
    } else {
      audioEngine.playTerminalBeep('error');
      setCodeError(true);
    }
  };

  return (
    <div className={`relative min-h-[85vh] w-full bg-zinc-950 text-zinc-200 font-terminal p-4 sm:p-8 flex flex-col justify-between overflow-hidden border border-zinc-850 shadow-2xl ${
      screenShaking ? 'animate-violent-shake' : ''
    } ${blackoutTrigger ? 'bg-black opacity-5 pointer-events-none' : ''}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black pointer-events-none opacity-90" />
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />

      {/* ======================================================== */}
      {/* FULL-SCREEN TERRIFYING ENTITY JUMPSCARE MODAL OVERLAY */}
      {/* ======================================================== */}
      {jumpscareActive && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/95 overflow-hidden select-none p-4 sm:p-8">
          {/* Ominous Red Atmosphere & CRT Scanlines Behind */}
          <div className="absolute inset-0 bg-red-950/30 pointer-events-none z-10 animate-pulse" />
          <div className="absolute inset-0 scanlines opacity-50 pointer-events-none z-10" />
          <div className="absolute inset-0 crt-vignette pointer-events-none z-10" />

          {/* Screaming Grotesque Creature Image - Dead Center in Viewport */}
          <div className="relative z-20 flex flex-col items-center justify-center max-w-4xl max-h-[85vh] w-full animate-jumpscare-zoom">
            <div className="relative rounded-lg overflow-hidden border-2 border-red-600 shadow-[0_0_90px_rgba(220,38,38,0.95)] bg-black">
              <img
                src="/assets/aistudio/horror-png-12_6fc05c71.png"
                alt="Breached Anomalous Entity"
                className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain mx-auto block"
              />
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-red-950/90 to-transparent pointer-events-none" />
            </div>

            {/* Shocking Flash Banner directly underneath image */}
            <div className="mt-4 px-6 py-2.5 bg-red-950/95 border-2 border-red-500 text-white font-cinematic font-black text-lg sm:text-2xl tracking-widest animate-glitch shadow-[0_0_50px_#dc2626] text-center">
              ⚠ SUBJECT 42: CONTAINMENT BREACH ⚠
            </div>
          </div>
        </div>
      )}

      {/* Room Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-red-950 text-red-400 border border-red-900 font-bold">ROOM 04</span>
            <h2 className="text-xl font-cinematic font-black tracking-wider text-white">PATIENT ISOLATION WARD</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Damp cots, hanging divider drapes, and disconnected physiological monitors.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToRoom('lab')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ROOM 03: LAB</span>
          </button>

          <button
            onClick={onReturnToMap}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-zinc-400" />
            <span>FACILITY MAP</span>
          </button>
        </div>
      </div>

      {/* Interactive Cardiac ECG Monitor Jumpscare Feature on Wall */}
      <div className="relative z-10 my-3 p-3 bg-black/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Activity className={`w-5 h-5 ${monitorFlatlining ? 'text-red-500 animate-ping' : 'text-emerald-400 animate-pulse'}`} />
          <div>
            <span className="text-xs font-bold text-white block">
              WALL PHYSIOLOGICAL MONITOR // WARD 4
            </span>
            <span className={`text-[10px] font-mono ${monitorFlatlining ? 'text-red-400 font-bold animate-pulse' : 'text-zinc-500'}`}>
              {monitorFlatlining ? 'CRITICAL FLATLINE DETECTED // PULSE: 0 BPM // ANOMALOUS MASS DETECTED' : 'HEARTBEAT FREQUENCY: 72 BPM // SENSOR: CALIBRATED'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {monitorFlatlining ? (
            <span className="px-3 py-1 bg-red-950 border border-red-600 text-red-300 text-xs font-bold animate-pulse">
              [ ⚠ CARDIAC ARREST // PARANORMAL RESIDUE ]
            </span>
          ) : (
            <button
              onClick={triggerMonitorFlatlineScare}
              className="px-3 py-1 bg-zinc-900 hover:bg-red-950 border border-zinc-700 hover:border-red-700 text-zinc-400 hover:text-red-300 text-[11px] font-mono cursor-pointer transition-colors"
            >
              [TAP MONITOR GLASS]
            </button>
          )}
        </div>
      </div>

      {/* Main Ward Interactive Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 my-4 flex-1 items-start">
        {/* Left Column: 3 Patient Records + Curtain + IV Stand */}
        <div className="space-y-4">
          <div className="p-4 bg-black/60 border border-zinc-800 text-xs space-y-3">
            <h3 className="font-bold text-zinc-300 tracking-wider flex items-center gap-2">
              <Bed className="w-4 h-4 text-red-500" />
              <span>ISOLATION CHARTS ({inspectedRecords.length}/3 EXAMINED)</span>
            </h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Medical clipboard records clip onto the rusted bedframes:
            </p>

            <div className="space-y-2">
              {(['07', '19', '42'] as const).map(id => (
                <button
                  key={id}
                  onClick={() => handleSelectRecord(id)}
                  className={`w-full text-left p-3 border transition-colors flex items-center justify-between text-xs cursor-pointer ${
                    selectedRecord === id
                      ? 'bg-red-950/40 border-red-600 text-white'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-red-400" />
                    <span>PATIENT {id} CLINICAL RECORD</span>
                  </div>
                  {inspectedRecords.includes(id) && (
                    <span className="text-red-400 text-[10px] font-bold">[FILE EXAMINED]</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Curtain Encounter Box with Jumpscare Trigger */}
          <div className="p-4 bg-zinc-950 border border-red-950 text-xs space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <Eye className="w-4 h-4 text-red-500 animate-pulse" />
                <span>BED 03 // HEAVY DIVIDER CURTAIN</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">SECTOR-B WARD</span>
            </div>

            <p className="text-zinc-300 text-[11px] leading-relaxed">
              {bloodMessageRevealed 
                ? 'The curtain was pulled back. Distorted claw marks and drying black blood stain the headboard with numeral [ 8 ].'
                : 'A faint, ragged raspy breath rasps from behind the hanging curtain fabric. Something heavy is leaning against it.'}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setCurtainModalOpen(true)}
                className="w-full py-2.5 px-3 bg-red-950 hover:bg-red-900 border-2 border-red-700 text-white text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(179,0,24,0.4)]"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{bloodMessageRevealed ? 'RE-OPEN CURTAIN 03' : 'APPROACH & PULL BACK CURTAIN 03'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Toppling IV Drip Stand */}
          <div className="p-3 bg-black/40 border border-zinc-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <Radio className="w-3.5 h-3.5 text-zinc-500" />
              <span>{ivStandFallen ? 'RUSTED IV STAND (CRASHED ON TILES)' : 'RUSTED IV STAND (UNSTABLE)'}</span>
            </div>
            <button
              onClick={triggerIvStandCrash}
              disabled={ivStandFallen}
              className={`px-2.5 py-1 text-[10px] font-mono border transition-colors cursor-pointer ${
                ivStandFallen ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              {ivStandFallen ? 'TOPPLED' : '[TOUCH STAND]'}
            </button>
          </div>
        </div>

        {/* Center: Selected Chart Reader */}
        <div className="space-y-4">
          {selectedRecord ? (
            <div className="p-6 bg-black/90 border border-zinc-800 text-xs space-y-4 animate-in fade-in shadow-xl">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
                <span className="font-bold text-white text-sm">{patientData[selectedRecord].title}</span>
                <span className="text-[10px] px-2 py-0.5 bg-red-950 text-red-400 border border-red-900">
                  CLASSIFIED PSYCH WARD
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">DIAGNOSIS / PHENOMENON:</span>
                <span className="font-bold text-red-400">{patientData[selectedRecord].diagnosis}</span>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-300 leading-relaxed font-sans text-sm italic">
                "{patientData[selectedRecord].notes}"
              </div>

              <div className="p-3 bg-red-950/30 border border-red-900 text-red-300 flex items-center justify-between">
                <span className="text-[11px] font-mono">OBSERVED SYMPTOM SIGNATURE:</span>
                <span className="text-xs font-mono font-bold text-white px-2 py-0.5 bg-red-950 border border-red-700">
                  {patientData[selectedRecord].riddleHint}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-black/40 border border-zinc-800 text-center flex flex-col items-center justify-center min-h-[260px] text-zinc-500 text-xs">
              <FileText className="w-8 h-8 text-zinc-700 mb-2" />
              <p>SELECT A PATIENT CHART TO DECIPHER THE OCCULT SYMPTOMS</p>
              <p className="text-[10px] text-zinc-600 mt-1">Cross-examine the frantic observations from Cots 07, 19, and 42.</p>
            </div>
          )}

          {/* Bloodied Wall Graffiti after Curtain Scare */}
          {bloodMessageRevealed && (
            <div className="p-4 bg-red-950/20 border border-red-900/60 text-xs space-y-2 animate-in fade-in">
              <span className="text-red-400 font-bold block flex items-center gap-1.5">
                <Skull className="w-4 h-4 text-red-500" />
                <span>BLOOD SMEARS ACROSS BED 03:</span>
              </span>
              <p className="text-zinc-200 font-mono italic text-sm">
                "WHY DID YOU LOOK? THE FREQUENCY WAS NEVER SILENT."
              </p>
              <span className="text-zinc-400 text-[11px] block font-mono">
                * The entity's eightfold resonance echoes in the damp tiles.
              </span>
            </div>
          )}
        </div>

        {/* Right: Keypad for Maintenance Tunnel */}
        <div className="p-6 bg-black/90 border border-zinc-800 text-xs space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-zinc-300 font-bold border-b border-zinc-800 pb-2">
            <Lock className="w-4 h-4 text-red-500" />
            <span>MAINTENANCE TUNNEL ACCESS LOCK</span>
          </div>

          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Pneumatic pressure door requires the 3-digit frequency code compiled from the cryptic records of Patients 07, 19, and 42.
          </p>

          <form onSubmit={handleKeypadSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">ENTER 3-DIGIT OVERRIDE CODE:</label>
              <input
                type="text"
                maxLength={4}
                value={codeAttempt}
                onChange={e => setCodeAttempt(e.target.value)}
                placeholder="---"
                disabled={tunnelUnlocked}
                className="w-full text-center text-2xl font-mono tracking-widest p-2 bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {codeError && (
              <div className="p-2 bg-red-950/60 border border-red-800 text-red-300 text-[11px] text-center font-bold">
                INVALID FREQUENCY SEQUENCE. TRY AGAIN.
              </div>
            )}

            {!tunnelUnlocked ? (
              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-950 hover:bg-red-900 border border-red-700 text-white font-bold text-xs cursor-pointer tracking-wider"
                >
                  DISENGAGE PNEUMATIC SEAL
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-center text-xs flex items-center justify-center gap-1.5">
                <span>CODE ACCEPTED: TUNNEL UNLOCKED</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Curtain Choice Encounter Modal */}
      {curtainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="p-6 max-w-md w-full bg-zinc-950 border-2 border-red-900 text-zinc-200 font-terminal shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-500 font-bold">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span>UNIDENTIFIED ACOUSTIC DISTURBANCE // BED 03</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              The cloth drapes of Bed 3 are twitching violently. Heavy, uneven breathing sounds like someone suffocating in wet fluid behind the linen.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleInvestigateCurtainAction}
                className="flex-1 py-3 bg-red-950 hover:bg-red-900 border-2 border-red-600 text-white font-bold text-xs cursor-pointer tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)]"
              >
                PULL BACK CURTAIN NOW
              </button>
              <button
                onClick={() => setCurtainModalOpen(false)}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                STEP AWAY QUIETLY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Passage: Maintenance Tunnel */}
      <div className="relative z-10 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs">
          <span className="font-bold text-zinc-300 block">
            HATCH TO MAINTENANCE TUNNEL (ROOM 05): {tunnelUnlocked ? 'OPEN' : 'LOCKED'}
          </span>
          <span className="text-[11px] text-zinc-500">
            {tunnelUnlocked ? 'Industrial steam release valve active.' : 'Requires 3-digit patient code (482).'}
          </span>
        </div>

        {tunnelUnlocked && (
          <button
            onClick={() => onNavigateToRoom('tunnel')}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-950 hover:bg-red-900 border border-red-700 text-white font-cinematic font-bold text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(179,0,24,0.4)]"
          >
            <span>DESCEND INTO MAINTENANCE TUNNEL</span>
            <ArrowRight className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};
