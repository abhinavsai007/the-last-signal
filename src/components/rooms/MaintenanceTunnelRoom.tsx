import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, ArrowRight, Map, Clock, RotateCcw, CheckCircle, ShieldAlert } from 'lucide-react';
import { InventoryItem, JournalEntry, RoomId } from '../../types/game';
import { audioEngine } from '../../services/audioEngine';

interface MaintenanceTunnelRoomProps {
  onCollectItem: (item: InventoryItem) => void;
  onAddJournal: (entry: JournalEntry) => void;
  onUnlockRoom: (roomId: RoomId) => void;
  onNavigateToRoom: (roomId: RoomId) => void;
  onReturnToMap: () => void;
  inventory: InventoryItem[];
  circuitSolved: boolean;
  onSolveCircuit: () => void;
  reducedMotion: boolean;
}

export const MaintenanceTunnelRoom: React.FC<MaintenanceTunnelRoomProps> = ({
  onCollectItem,
  onAddJournal,
  onUnlockRoom,
  onNavigateToRoom,
  onReturnToMap,
  inventory,
  circuitSolved,
  onSolveCircuit,
  reducedMotion
}) => {
  // Circuit puzzle: 3 nodes must be activated in order: Alpha (Generator) -> Beta (Relay) -> Gamma (Grid)
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [pursuitActive, setPursuitActive] = useState(circuitSolved);
  const [timeLeft, setTimeLeft] = useState(55);
  const [timerFailed, setTimerFailed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const nodes = [
    { id: 1, name: 'NODE ALPHA // DIESEL TURBINE', desc: 'Primary auxiliary induction coil' },
    { id: 2, name: 'NODE BETA // STEP-UP TRANSFORMER', desc: 'Voltage stabilizing capacitor' },
    { id: 3, name: 'NODE GAMMA // SUB-SECTOR BUS', desc: 'Blast gate power distribution feed' }
  ];

  const handleNodeClick = (nodeId: number) => {
    if (circuitSolved) return;

    audioEngine.playTerminalBeep('key');

    // Expected next node is activeNodes.length + 1
    const expected = activeNodes.length + 1;
    if (nodeId === expected) {
      const next = [...activeNodes, nodeId];
      setActiveNodes(next);

      if (next.length === 3) {
        // Solved!
        audioEngine.playTerminalBeep('success');
        audioEngine.playSiren();
        audioEngine.playFluorescentFlicker();
        onSolveCircuit();
        setPursuitActive(true);
        onUnlockRoom('archive');

        onAddJournal({
          id: `journal-power-${Date.now()}`,
          title: 'Auxiliary Power Restored',
          content: '"POWER RESTORED. UNAUTHORIZED MOVEMENT DETECTED." High-speed acoustic disturbance echoed through the steam pipes as the Archive Room gate unsealed.',
          timestamp: '03:17 AM',
          source: 'Maintenance Junction'
        });
      }
    } else {
      audioEngine.playTerminalBeep('error');
      audioEngine.playFluorescentFlicker();
      setActiveNodes([]); // Reset
    }
  };

  // Pursuit countdown timer once circuit is solved
  useEffect(() => {
    if (!pursuitActive || isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerFailed(true);
          audioEngine.playHeartbeat(true);
          audioEngine.playStaticBurst(0.7, 0.4);
          return 0;
        }
        if (prev <= 15) {
          audioEngine.playHeartbeat(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pursuitActive, isPaused, timeLeft]);

  const handleRetryCountdown = () => {
    setTimeLeft(45);
    setTimerFailed(false);
    audioEngine.playTerminalBeep('key');
  };

  return (
    <div className={`relative min-h-[85vh] w-full bg-zinc-950 text-zinc-200 font-terminal p-4 sm:p-8 flex flex-col justify-between overflow-hidden border border-zinc-850 shadow-2xl ${
      timerFailed ? 'bg-red-950/80 animate-flicker' : ''
    }`}>
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black pointer-events-none opacity-90" />
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />

      {/* Room Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-red-950 text-red-400 border border-red-900 font-bold">ROOM 05</span>
            <h2 className="text-xl font-cinematic font-black tracking-wider text-white">MAINTENANCE TUNNEL</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Exposed conduits, pressurized steam valves, and auxiliary junction box.</p>
        </div>

        <button
          onClick={onReturnToMap}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Map className="w-3.5 h-3.5 text-zinc-400" />
          <span>FACILITY MAP</span>
        </button>
      </div>

      {/* Pursuit Alarm Banner if Power Restored */}
      {pursuitActive && !timerFailed && (
        <div className="relative z-10 my-3 p-3 bg-red-950/60 border border-red-700 flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-spin" />
            <span>WARNING: BIOLOGICAL ENTITY CLOSING IN RAPIDLY! PROCEED TO ARCHIVES!</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <span className="text-white bg-red-900 px-3 py-1 text-sm">
              COUNTDOWN: {timeLeft}s
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-400 hover:text-white"
            >
              {isPaused ? 'RESUME TIMER' : 'PAUSE (ACCESSIBILITY)'}
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Circuit Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1 items-start">
        {/* Environmental info */}
        <div className="space-y-4">
          <div className="p-4 bg-black/60 border border-zinc-800 text-xs space-y-3">
            <h3 className="font-bold text-zinc-300 tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>POWER RELAY SCHEMATIC</span>
            </h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              The facility main generator tripped during the initial breach. You must manually close the 3 electrical breaker nodes in sequential order to re-energize the Sector C magnetic door relays.
            </p>
            <div className="p-3 bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
              <span className="text-amber-400 font-bold block mb-1">CIRCUIT RULES:</span>
              Engage turbine generation first (Alpha), step up the line voltage (Beta), then feed the sub-sector distribution bus (Gamma).
            </div>
          </div>
        </div>

        {/* 3 Node Breakers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-black/90 border border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs font-bold text-amber-400 tracking-widest block">3-PHASE JUNCTION CONDUIT</span>
                <span className="text-[10px] text-zinc-500">CLICK BREAKERS IN ELECTRICAL SEQUENCE</span>
              </div>
              <span className={`text-xs px-2.5 py-1 font-bold border ${
                circuitSolved ? 'bg-emerald-950 border-emerald-600 text-emerald-400' : 'bg-red-950 border-red-700 text-red-400'
              }`}>
                {circuitSolved ? 'POWER RESTORED' : 'CIRCUIT OPEN // ZERO CURRENT'}
              </span>
            </div>

            {/* Circuit Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {nodes.map(node => {
                const isActivated = activeNodes.includes(node.id) || circuitSolved;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    disabled={circuitSolved}
                    className={`p-4 border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                      isActivated
                        ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold font-mono text-zinc-500">STATION 0{node.id}</span>
                        <Zap className={`w-4 h-4 ${isActivated ? 'text-amber-400 animate-pulse' : 'text-zinc-700'}`} />
                      </div>
                      <span className={`text-xs font-bold block ${isActivated ? 'text-white' : 'text-zinc-300'}`}>
                        {node.name}
                      </span>
                      <p className="text-[10px] text-zinc-500 mt-1">{node.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800 flex justify-between items-center text-[10px]">
                      <span className={isActivated ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                        {isActivated ? 'ENERGIZED' : 'DISENGAGED'}
                      </span>
                      {!circuitSolved && (
                        <span className="text-zinc-400 hover:text-white font-mono">[TOGGLE]</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Status Feedback */}
            {circuitSolved && (
              <div className="p-4 bg-zinc-950 border border-emerald-900/80 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>AUXILIARY GRID ONLINE // HEAVY DOOR SOLENOID ENERGIZED</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  "POWER RESTORED. UNAUTHORIZED MOVEMENT DETECTED IN DUCT 08."
                  The steel bulkhead to Room 06 (Archive Room) has ground open. You must escape through the tunnel before the entity catches you!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Failure Screen on Timer Expiry */}
      {timerFailed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg">
          <div className="p-6 max-w-md w-full bg-zinc-950 border-2 border-red-700 text-zinc-200 font-terminal text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-cinematic font-black text-red-500">
              ENTITY OVERRUNS THE TUNNEL
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The shadows converged upon the junction box. Cold tendrils of static enveloped your vision before you could reach the archive door.
            </p>
            <div className="p-2 bg-zinc-900 text-[11px] text-emerald-400">
              * Your collected items and puzzles remain preserved.
            </div>
            <button
              onClick={handleRetryCountdown}
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-900 hover:bg-red-800 text-white font-bold text-xs tracking-wider cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RETRY TUNNEL ESCAPE</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Passage: Archive Room Door */}
      <div className="relative z-10 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs">
          <span className="font-bold text-zinc-300 block">
            BULKHEAD TO ARCHIVE ROOM (ROOM 06): {circuitSolved ? 'POWERED & OPEN' : 'UNPOWERED'}
          </span>
          <span className="text-[11px] text-zinc-500">
            {circuitSolved ? 'Passage clear—move quickly!' : 'Requires restoring 3-phase power.'}
          </span>
        </div>

        {circuitSolved && !timerFailed && (
          <button
            onClick={() => onNavigateToRoom('archive')}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-950 hover:bg-red-900 border border-red-700 text-white font-cinematic font-bold text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(179,0,24,0.4)] animate-pulse"
          >
            <span>RUSH INTO ARCHIVE ROOM</span>
            <ArrowRight className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};
