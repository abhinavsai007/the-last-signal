import React, { useState, useEffect } from 'react';
import { Radio, AlertOctagon, FileText, Activity, ShieldAlert, Terminal, Compass, ArrowRight } from 'lucide-react';
import { CCTVMonitor } from './CCTVMonitor';
import { audioEngine } from '../services/audioEngine';

interface LandingPageProps {
  onEnterFacility: () => void;
  onOpenIncidentReport: () => void;
  onOpenTransmissionLog: () => void;
  reducedMotion: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterFacility,
  onOpenIncidentReport,
  onOpenTransmissionLog,
  reducedMotion
}) => {
  const [clockTime, setClockTime] = useState('03:17:19 AM');
  const [shadowAnomaly, setShadowAnomaly] = useState(false);

  useEffect(() => {
    // Clock with subtle second progression around the fateful 03:17 AM hour
    let seconds = 19;
    const interval = setInterval(() => {
      seconds = (seconds + 1) % 60;
      const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
      setClockTime(`03:17:${secStr} AM`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Rare supernatural anomaly on the landing page
  useEffect(() => {
    const shadowTimer = setTimeout(() => {
      setShadowAnomaly(true);
      audioEngine.playWhisper();

      const resetTimer = setTimeout(() => {
        setShadowAnomaly(false);
      }, 4000);

      return () => clearTimeout(resetTimer);
    }, 12000);

    return () => clearTimeout(shadowTimer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-[#E8E8E8] flex flex-col justify-between overflow-hidden">
      {/* Dynamic Corridor Atmosphere in Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        {/* Perspective hallway lines */}
        <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2="50%" y2="50%" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="100%" y1="0" x2="50%" y2="50%" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="100%" x2="50%" y2="50%" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="100%" y1="100%" x2="50%" y2="50%" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Architectural ribs along corridor */}
            <rect x="20%" y="20%" width="60%" height="60%" fill="none" stroke="#111827" strokeWidth="1" />
            <rect x="35%" y="35%" width="30%" height="30%" fill="none" stroke="#1a202c" strokeWidth="1" />
            <rect x="45%" y="45%" width="10%" height="10%" fill="#0a0a0a" stroke="#7f1d1d" strokeWidth="1" />
          </svg>

          {/* Flickering Red Beacon at the end of the hall */}
          <div className="absolute top-[49.5%] left-[49.5%] w-3 h-3 bg-red-600 rounded-full animate-flicker shadow-[0_0_40px_#dc2626]" />

          {/* Rare Hallway Silhouette Event */}
          {shadowAnomaly && (
            <div className={`absolute top-[42%] left-[48.5%] w-8 h-28 bg-black/95 rounded-t-full shadow-[0_0_30px_rgba(0,0,0,1)] z-10 transition-opacity duration-1000 ${
              reducedMotion ? 'opacity-90' : 'animate-pulse opacity-90'
            }`}>
              <div className="w-4 h-4 bg-black rounded-full mx-auto mt-1" />
              <div className="flex justify-center gap-1.5 -mt-2">
                <div className="w-1 h-1 bg-red-600 rounded-full" />
                <div className="w-1 h-1 bg-red-600 rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header bar */}
      <header className="relative z-20 px-6 py-5 flex flex-wrap items-center justify-between border-b border-zinc-900 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span className="font-cinematic tracking-widest text-sm font-bold text-red-500">
            SECTOR 4 // NIGHTFALL RESEARCH FACILITY
          </span>
        </div>

        {/* Digital Clock with subtle flicker */}
        <div className="flex items-center gap-4 text-xs font-terminal">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400">
            <Activity className="w-3.5 h-3.5 text-red-500" />
            <span className="text-zinc-500">FACILITY TIME:</span>
            <span className="text-red-400 font-bold animate-flicker">{clockTime}</span>
          </div>
        </div>
      </header>

      {/* Main Hero Centerpiece */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-6 py-12 text-center max-w-5xl mx-auto w-full">
        {/* Emergency Classification Bar */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-red-950/40 border border-red-900/80 text-red-400 text-xs font-terminal tracking-widest">
          <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />
          <span>LEVEL 5 BIO-ANOMALOUS QUARANTINE ACTIVE</span>
        </div>

        {/* Large Facility Title */}
        <h1 className="font-cinematic text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white mb-4 drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
          THE LAST SIGNAL
        </h1>

        {/* Chilling Subtext */}
        <div className="space-y-2 mb-8 max-w-2xl">
          <p className="font-cinematic text-lg sm:text-2xl text-zinc-300 font-bold tracking-wider">
            "THE FACILITY WAS ABANDONED.<br />
            <span className="text-red-500">THE EXPERIMENT WAS NOT."</span>
          </p>
          <p className="font-terminal text-sm sm:text-base text-zinc-400 tracking-wide">
            You entered to solve the mystery. Now find a way out.
          </p>
        </div>

        {/* Primary Interactive Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={onEnterFacility}
            className="group relative flex items-center gap-3 px-8 py-4 bg-red-950 hover:bg-red-900 border-2 border-red-700 hover:border-red-500 text-white font-cinematic font-bold tracking-widest text-base shadow-[0_0_40px_rgba(179,0,24,0.45)] transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Compass className="w-5 h-5 text-red-400 group-hover:rotate-45 transition-transform" />
            <span>[ ENTER THE FACILITY ]</span>
            <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenIncidentReport}
            className="flex items-center gap-2 px-6 py-4 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-terminal text-sm transition-all cursor-pointer shadow-lg"
          >
            <FileText className="w-4 h-4 text-zinc-500" />
            <span>[ THE INCIDENT REPORT ]</span>
          </button>

          <button
            onClick={onOpenTransmissionLog}
            className="flex items-center gap-2 px-6 py-4 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-terminal text-sm transition-all cursor-pointer shadow-lg"
          >
            <Radio className="w-4 h-4 text-red-500" />
            <span>[ TRANSMISSION LOG ]</span>
          </button>
        </div>

        {/* Bottom Section: Emergency Status Panel & Live CCTV Feed in Corner */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4 text-left">
          {/* Emergency Status Panel */}
          <div className="p-5 bg-zinc-950/90 border border-zinc-900 shadow-xl font-terminal text-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-900">
              <span className="flex items-center gap-2 font-bold text-zinc-300 tracking-wider">
                <ShieldAlert className="w-4 h-4 text-red-500" /> FACILITY TELEMETRY
              </span>
              <span className="text-[10px] text-red-500 font-bold">GRID COMPROMISED</span>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-zinc-400">
              <div>
                <span className="text-zinc-600 block text-[10px]">FACILITY STATUS:</span>
                <span className="text-red-400 font-bold">COMPROMISED</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-[10px]">LIFE SIGNS:</span>
                <span className="text-amber-400 font-bold">UNKNOWN</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-[10px]">CONTAINMENT:</span>
                <span className="text-red-500 font-bold">FAILED</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-[10px]">LAST TRANSMISSION:</span>
                <span className="text-zinc-300 font-bold">03:17 AM</span>
              </div>
            </div>
          </div>

          {/* CCTV Mini Surveillance Camera Feed */}
          <div className="flex justify-center md:justify-end">
            <CCTVMonitor compact={true} />
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="relative z-20 px-6 py-4 border-t border-zinc-900 bg-black/80 flex flex-wrap items-center justify-between text-xs font-terminal text-zinc-500">
        <div>
          <span>PROJECT NIGHTFALL // ALL EXTERNAL COMMS REDIRECTED</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 font-mono">STATUS: ISOLATED // PROTOCOL: SURVIVE</span>
        </div>
      </footer>
    </div>
  );
};
