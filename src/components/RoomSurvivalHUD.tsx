import React, { useState, useEffect, useRef } from 'react';
import { Skull, AlertTriangle, RotateCcw, Map, Radio, Activity, Clock } from 'lucide-react';
import { RoomId } from '../types/game';
import { audioEngine } from '../services/audioEngine';

interface RoomSurvivalHUDProps {
  currentRoom: RoomId | null;
  roomName: string;
  isRoomCleared: boolean;
  onRetryRoom: () => void;
  onReturnToMap: () => void;
  reducedMotion?: boolean;
}

const DEFAULT_ROOM_TIME_SECONDS = 75;

export const RoomSurvivalHUD: React.FC<RoomSurvivalHUDProps> = ({
  currentRoom,
  roomName,
  isRoomCleared,
  onRetryRoom,
  onReturnToMap,
  reducedMotion = false
}) => {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_ROOM_TIME_SECONDS);
  const [isJumpscareActive, setIsJumpscareActive] = useState(false);
  const [isGhostGotYou, setIsGhostGotYou] = useState(false);
  const lastHeartbeatRef = useRef<number>(0);

  // Reset timer whenever room changes
  useEffect(() => {
    setTimeLeft(DEFAULT_ROOM_TIME_SECONDS);
    setIsJumpscareActive(false);
    setIsGhostGotYou(false);
  }, [currentRoom]);

  // Preload jumpscare audio and image assets
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/aistudio/horror-png-12_6fc05c71.png';

    const roar = new Audio();
    roar.src = '/assets/aistudio/phatphrogstudio-wendigo-horror-voice-angry-scream-growl-roar-583005_716e2a5f.mp3';
    roar.preload = 'auto';
  }, []);

  // Main Survival Countdown Loop
  useEffect(() => {
    // If room is cleared or already dead, stop countdown
    if (isRoomCleared || isGhostGotYou || isJumpscareActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerGhostKill();
          return 0;
        }

        const next = prev - 1;

        // Auditory tension cues when time is dangerously low
        const now = Date.now();
        if (next <= 25 && next > 0) {
          const heartbeatInterval = next <= 10 ? 1200 : 2200;
          if (now - lastHeartbeatRef.current > heartbeatInterval) {
            audioEngine.playHeartbeat(next <= 10);
            lastHeartbeatRef.current = now;
          }
        }

        // Static flicker warning at 15s and 5s
        if (next === 15 || next === 5) {
          audioEngine.playStaticBurst(0.3, 0.25);
          audioEngine.playFluorescentFlicker();
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRoomCleared, isGhostGotYou, isJumpscareActive]);

  // When timer hits 0: violent jumpscare with wendigo roar, followed by "THE GHOST GOT YOU"
  const triggerGhostKill = () => {
    // 1. Play both terrifying jumpscare audio stinger AND the demonic wendigo scream/roar
    audioEngine.playJumpscareStinger();
    audioEngine.playWendigoRoar();
    audioEngine.playHeartbeat(true);

    // 2. Trigger active jumpscare image
    setIsJumpscareActive(true);

    // 3. After 2.2 seconds of horrific screamer, show "THE GHOST GOT YOU"
    setTimeout(() => {
      setIsJumpscareActive(false);
      setIsGhostGotYou(true);
      audioEngine.playMedicalFlatline(2.2);
      audioEngine.playWhisper();
    }, 2200);
  };

  const handleRetry = () => {
    setTimeLeft(DEFAULT_ROOM_TIME_SECONDS);
    setIsGhostGotYou(false);
    setIsJumpscareActive(false);
    audioEngine.playTerminalBeep('success');
    audioEngine.startAmbientDrone();
    onRetryRoom();
  };

  const handleRetreat = () => {
    setTimeLeft(DEFAULT_ROOM_TIME_SECONDS);
    setIsGhostGotYou(false);
    setIsJumpscareActive(false);
    onReturnToMap();
  };

  // Format time as MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const percentLeft = (timeLeft / DEFAULT_ROOM_TIME_SECONDS) * 100;
  const isDanger = timeLeft <= 20;
  const isCritical = timeLeft <= 10;

  return (
    <>
      {/* Top Threat / Proximity Tension HUD */}
      {!isGhostGotYou && (
        <div className="relative z-30 w-full mb-3 px-3 py-2 bg-black/90 border border-zinc-800 backdrop-blur-md font-terminal text-xs shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Entity Tracker Status */}
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isRoomCleared
                  ? 'bg-emerald-500'
                  : isCritical
                  ? 'bg-red-500 animate-ping'
                  : isDanger
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-red-600 animate-pulse'
              }`} />
              <span className="font-bold tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-red-500" />
                {isRoomCleared ? (
                  <span className="text-emerald-400">SECTOR SECURED // ENTITY REPELLED</span>
                ) : (
                  <span>
                    ENTITY HUNTING // SOLVE CLUES BEFORE CONVERGENCE:
                  </span>
                )}
              </span>
            </div>

            {/* Countdown Badge */}
            {!isRoomCleared && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-500 hidden sm:inline">
                  PARANORMAL DRAIN:
                </span>
                <div className={`px-2.5 py-0.5 border font-mono font-black text-sm tracking-widest flex items-center gap-1.5 ${
                  isCritical
                    ? 'bg-red-950 border-red-500 text-red-300 animate-glitch shadow-[0_0_20px_#dc2626]'
                    : isDanger
                    ? 'bg-red-950/60 border-red-700 text-red-400 animate-pulse'
                    : 'bg-zinc-900 border-zinc-700 text-amber-400'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeFormatted}</span>
                </div>
              </div>
            )}
          </div>

          {/* Draining Progress Bar */}
          {!isRoomCleared && (
            <div className="w-full h-1 bg-zinc-900 mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  isCritical
                    ? 'bg-red-600 animate-pulse'
                    : isDanger
                    ? 'bg-amber-500'
                    : 'bg-red-800'
                }`}
                style={{ width: `${percentLeft}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TIMEOUT FULL-SCREEN TERRIFYING ENTITY JUMPSCARE */}
      {/* ======================================================== */}
      {isJumpscareActive && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/95 overflow-hidden select-none p-4 sm:p-8">
          <div className="absolute inset-0 bg-red-950/40 pointer-events-none z-10 animate-pulse" />
          <div className="absolute inset-0 scanlines opacity-60 pointer-events-none z-10" />
          <div className="absolute inset-0 crt-vignette pointer-events-none z-10" />

          {/* Screaming Grotesque Creature Image - Dead Center in Viewport */}
          <div className="relative z-20 flex flex-col items-center justify-center max-w-4xl max-h-[85vh] w-full animate-jumpscare-zoom">
            <div className="relative rounded-lg overflow-hidden border-2 border-red-600 shadow-[0_0_100px_rgba(220,38,38,1)] bg-black">
              <img
                src="/assets/aistudio/horror-png-12_6fc05c71.png"
                alt="Breached Anomalous Entity"
                className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain mx-auto block"
              />
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-red-950/90 to-transparent pointer-events-none" />
            </div>

            {/* Shocking Flash Banner directly underneath image */}
            <div className="mt-4 px-6 py-2.5 bg-red-950/95 border-2 border-red-500 text-white font-cinematic font-black text-lg sm:text-2xl tracking-widest animate-glitch shadow-[0_0_60px_#dc2626] text-center">
              ⚠ TIME EXPIRED: THE ENTITY CONSUMED YOU ⚠
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* "THE GHOST GOT YOU" GAME OVER SCREEN */}
      {/* ======================================================== */}
      {isGhostGotYou && (
        <div className="fixed inset-0 z-[998] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-xl select-none font-terminal">
          <div className="absolute inset-0 scanlines opacity-70 pointer-events-none" />
          <div className="absolute inset-0 crt-vignette pointer-events-none" />

          <div className="relative z-10 max-w-xl w-full p-6 sm:p-8 bg-zinc-950 border-2 border-red-700 shadow-[0_0_80px_rgba(179,0,24,0.7)] text-center space-y-6 animate-in zoom-in-95">
            {/* Ominous Flashing Skull */}
            <div className="flex justify-center">
              <div className="p-4 bg-red-950/60 border-2 border-red-600 rounded-full animate-pulse shadow-[0_0_30px_#dc2626]">
                <Skull className="w-12 h-12 text-red-500 animate-violent-shake" />
              </div>
            </div>

            {/* Huge Terrifying Game Over Title */}
            <div>
              <h1 className="font-cinematic font-black text-4xl sm:text-5xl text-red-500 tracking-widest animate-glitch drop-shadow-[0_0_20px_#dc2626]">
                THE GHOST GOT YOU
              </h1>
              <p className="text-zinc-400 font-mono text-xs sm:text-sm mt-2 tracking-wide">
                You took too long investigating {roomName}. The paranormal anomaly breached the perimeter and dragged your body into the sub-tunnels.
              </p>
            </div>

            {/* Biometric Telemetry */}
            <div className="p-3 bg-black/80 border border-red-900/60 text-left font-mono text-[11px] space-y-1.5 text-zinc-400">
              <div className="flex justify-between border-b border-zinc-900 pb-1">
                <span>VITAL SIGNS TELEMETRY:</span>
                <span className="text-red-500 font-bold animate-pulse">[ FLATLINED ]</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>TIME OF BREACH:</span>
                <span className="text-zinc-300">03:17 AM // SECTOR SHUTDOWN</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>CAUSE OF DEATH:</span>
                <span className="text-red-400">ACUTE BIOLOGICAL DISSOLUTION</span>
              </div>
            </div>

            {/* Recovery Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 py-3.5 px-4 bg-red-950 hover:bg-red-900 border-2 border-red-600 text-white font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.5)]"
              >
                <RotateCcw className="w-4 h-4 text-red-300" />
                <span>RETRY SECTOR ({DEFAULT_ROOM_TIME_SECONDS}S RESET)</span>
              </button>

              <button
                onClick={handleRetreat}
                className="flex-1 py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Map className="w-4 h-4 text-zinc-400" />
                <span>RETREAT TO FACILITY MAP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
