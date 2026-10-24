import React, { useState, useEffect } from 'react';
import { Camera, Radio, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface CCTVMonitorProps {
  onSilhouetteSeen?: () => void;
  compact?: boolean;
}

export const CCTVMonitor: React.FC<CCTVMonitorProps> = ({
  onSilhouetteSeen,
  compact = false
}) => {
  const [activeCam, setActiveCam] = useState<number>(1);
  const [isStaticGlitch, setIsStaticGlitch] = useState(false);
  const [hasSilhouette, setHasSilhouette] = useState(false);
  const [visitedCount, setVisitedCount] = useState(0);

  const cameras = [
    { id: 1, name: 'CAM-01: RECEPTION', status: 'SIGNAL DEGRADED', color: 'text-amber-500' },
    { id: 2, name: 'CAM-02: MAIN CORRIDOR', status: 'ANOMALY DETECTED', color: 'text-red-500' },
    { id: 3, name: 'CAM-03: RESEARCH LAB', status: 'FEED DESTABILIZED', color: 'text-zinc-500' },
    { id: 4, name: 'CAM-04: PATIENT WARD', status: 'OFFLINE / RECONNECTING', color: 'text-red-400' }
  ];

  const switchCamera = (camId: number) => {
    if (camId === activeCam) return;
    audioEngine.playStaticBurst(0.25, 0.2);
    audioEngine.playTerminalBeep('key');
    setIsStaticGlitch(true);
    setActiveCam(camId);
    setVisitedCount(prev => prev + 1);

    setTimeout(() => {
      setIsStaticGlitch(false);
    }, 280);
  };

  // Silhouette logic: when returning to CAM-02 after visiting other cameras, chance of silhouette
  useEffect(() => {
    if (activeCam === 2 && visitedCount > 1) {
      if (Math.random() < 0.65 && !hasSilhouette) {
        setHasSilhouette(true);
        audioEngine.playHeartbeat(true);
        onSilhouetteSeen?.();

        // Silhouette vanishes after 3 seconds
        const timer = setTimeout(() => {
          setHasSilhouette(false);
        }, 3200);
        return () => clearTimeout(timer);
      }
    }
  }, [activeCam, visitedCount]);

  const currentCamInfo = cameras.find(c => c.id === activeCam) || cameras[0];

  return (
    <div className={`relative bg-black border border-zinc-800 shadow-2xl overflow-hidden font-terminal ${
      compact ? 'w-full md:w-80 h-52' : 'w-full max-w-xl h-80'
    }`}>
      {/* CRT Scanlines Overlay */}
      <div className="absolute inset-0 scanlines opacity-70 pointer-events-none z-10" />
      <div className="absolute inset-0 crt-vignette pointer-events-none z-10" />

      {/* Screen Glitch overlay */}
      {isStaticGlitch && (
        <div className="absolute inset-0 bg-white/20 z-20 pointer-events-none animate-glitch" />
      )}

      {/* Camera Scene Rendering */}
      <div className="relative w-full h-full flex flex-col justify-between p-3 bg-zinc-950">
        {/* Background Visual Simulation per Camera */}
        <div className="absolute inset-0 z-0 bg-[#070b09] overflow-hidden">
          {activeCam === 1 && (
            <div className="w-full h-full relative opacity-60">
              {/* Reception view: Overturned desk silhouette */}
              <div className="absolute bottom-4 left-8 w-32 h-16 bg-zinc-900 border-t border-zinc-700" />
              <div className="absolute top-12 left-20 w-8 h-8 bg-zinc-800 border border-zinc-700" />
              <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black to-transparent" />
            </div>
          )}

          {activeCam === 2 && (
            <div className="w-full h-full relative opacity-70">
              {/* Corridor vanishing point lines */}
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="0" x2="50%" y2="50%" stroke="#1f2937" strokeWidth="1" />
                <line x1="100%" y1="0" x2="50%" y2="50%" stroke="#1f2937" strokeWidth="1" />
                <line x1="0" y1="100%" x2="50%" y2="50%" stroke="#1f2937" strokeWidth="1" />
                <line x1="100%" y1="100%" x2="50%" y2="50%" stroke="#1f2937" strokeWidth="1" />
                <rect x="44%" y="40%" width="12%" height="20%" fill="#111827" stroke="#374151" strokeWidth="1" />
              </svg>

              {/* Red flicker light at end of hallway */}
              <div className="absolute top-[48%] left-[49%] w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_15px_#dc2626]" />

              {/* Creepy Silhouette apparition */}
              {hasSilhouette && (
                <div className="absolute top-[36%] left-[47%] w-7 h-24 bg-black/95 rounded-t-full shadow-[0_0_25px_rgba(0,0,0,1)] animate-pulse z-10 flex flex-col items-center">
                  <div className="w-4 h-4 bg-black rounded-full mt-1" />
                  <div className="w-6 h-14 bg-black mt-0.5" />
                  <div className="flex gap-2 -mt-10">
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCam === 3 && (
            <div className="w-full h-full relative opacity-50">
              {/* Lab: broken containment cylinders */}
              <div className="absolute bottom-6 left-12 w-14 h-28 border border-emerald-900 bg-emerald-950/20" />
              <div className="absolute bottom-6 left-32 w-14 h-28 border border-emerald-900/60 bg-emerald-950/10 border-dashed" />
              <div className="absolute bottom-6 right-16 w-20 h-16 bg-zinc-900 border border-zinc-700" />
            </div>
          )}

          {activeCam === 4 && (
            <div className="w-full h-full relative opacity-45 flex items-center justify-center">
              {/* Hospital beds and curtains */}
              <div className="absolute bottom-8 left-10 w-24 h-12 bg-zinc-900 border-t-2 border-zinc-600" />
              <div className="absolute top-8 left-1/2 w-0.5 h-32 bg-zinc-800" />
              <div className="absolute top-10 left-[48%] w-16 h-28 bg-zinc-900/80 border-r border-zinc-700 -rotate-3" />
            </div>
          )}

          {/* Random noise static bands */}
          <div className="absolute inset-0 bg-repeat opacity-10 pointer-events-none film-grain" />
        </div>

        {/* Top Camera Status Overlay */}
        <div className="relative z-20 flex justify-between items-start text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold tracking-wider text-emerald-400">
              <Camera className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              {currentCamInfo.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className={currentCamInfo.color}>{currentCamInfo.status}</span>
            <span className="text-zinc-500 font-mono">03:17:42 AM</span>
          </div>
        </div>

        {/* Center alert notification if silhouette spotted */}
        {hasSilhouette && (
          <div className="relative z-20 self-center px-2 py-0.5 bg-red-950/80 border border-red-700 text-red-400 text-[10px] tracking-widest font-bold animate-pulse">
            [ MOTION OVERRIDE: UNIDENTIFIED SUBJECT ]
          </div>
        )}

        {/* Bottom Camera Selector Bar */}
        <div className="relative z-20 flex items-center justify-between pt-2 border-t border-zinc-800/80">
          <div className="flex gap-1">
            {cameras.map(cam => (
              <button
                key={cam.id}
                onClick={() => switchCamera(cam.id)}
                className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                  activeCam === cam.id
                    ? 'bg-red-950 border-red-600 text-red-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                CAM 0{cam.id}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-zinc-600 flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            <span>FEED 14.8 FPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
