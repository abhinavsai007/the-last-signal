import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, ArrowRight, FastForward } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface OpeningSequenceProps {
  onComplete: () => void;
  reducedMotion: boolean;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({
  onComplete,
  reducedMotion
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showEnterButton, setShowEnterButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const lines = [
    'INITIALIZING EMERGENCY BROADCAST...',
    'SEARCHING FOR SURVIVING PERSONNEL...',
    'SIGNAL FOUND.',
    'CONNECTION ESTABLISHED.'
  ];

  useEffect(() => {
    if (stepIndex < lines.length) {
      const fullLine = lines[stepIndex];
      let charIndex = 0;
      setIsTyping(true);
      setCurrentText('');

      const timer = setInterval(() => {
        if (charIndex < fullLine.length) {
          setCurrentText(fullLine.substring(0, charIndex + 1));
          charIndex++;
          audioEngine.playTerminalBeep('key');
        } else {
          clearInterval(timer);
          setIsTyping(false);
          // Pause before moving to next line
          setTimeout(() => {
            setStepIndex(prev => prev + 1);
          }, 650);
        }
      }, 35);

      return () => clearInterval(timer);
    } else if (stepIndex === lines.length) {
      // Pause then reveal ominous warning
      const warnTimer = setTimeout(() => {
        setShowWarning(true);
        audioEngine.playTerminalBeep('alert');
        audioEngine.playStaticBurst(0.6, 0.35);

        // Then show Enter button
        setTimeout(() => {
          setShowEnterButton(true);
        }, 1200);
      }, 800);

      return () => clearTimeout(warnTimer);
    }
  }, [stepIndex]);

  const handleEnter = () => {
    audioEngine.startAmbientDrone();
    audioEngine.playMetalClang();
    audioEngine.playStaticBurst(0.4, 0.4);
    setIsTransitioning(true);
    setTimeout(() => {
      onComplete();
    }, 850);
  };

  const handleSkip = () => {
    audioEngine.startAmbientDrone();
    onComplete();
  };

  return (
    <div className={`relative min-h-screen w-full bg-[#050505] text-[#E8E8E8] flex flex-col justify-center items-center p-6 select-none overflow-hidden ${
      isTransitioning ? (reducedMotion ? 'opacity-0 transition-opacity duration-700' : 'animate-glitch scale-105 opacity-0 transition-all duration-700') : ''
    }`}>
      {/* CRT Scanline and Vignette Overlays */}
      <div className="absolute inset-0 scanlines opacity-60 pointer-events-none" />
      <div className="absolute inset-0 crt-vignette pointer-events-none" />

      {/* Top Controls: Skip Intro & Frequency */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-xs font-terminal text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
          <span>EMERGENCY BEACON // RELAY FREQ 433.92 MHz</span>
        </div>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-terminal transition-all cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>SKIP INTRO</span>
        </button>
      </div>

      {/* Main Terminal Output Center */}
      <div className="relative z-10 max-w-2xl w-full p-8 bg-zinc-950/80 border border-zinc-800/90 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-sm">
        {/* Blinking Red Beacon Indicator */}
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-900 pb-4">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
          </div>
          <span className="font-terminal text-xs tracking-widest text-red-500 font-bold">
            FACILITY ANOMALY DETECTION UNIT
          </span>
          <span className="ml-auto font-terminal text-[11px] text-zinc-600">SYS_REV: 04.09.1986</span>
        </div>

        {/* Display previous completed lines */}
        <div className="space-y-2 mb-4 font-terminal text-sm md:text-base text-zinc-400">
          {lines.slice(0, stepIndex).map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-emerald-500 text-xs">✔</span>
              <span className="text-zinc-300">{line}</span>
            </div>
          ))}

          {/* Currently typing line */}
          {stepIndex < lines.length && (
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="text-red-500">&gt;</span>
              <span>{currentText}</span>
              <span className="w-2 h-4 bg-emerald-400 inline-block animate-pulse ml-0.5" />
            </div>
          )}
        </div>

        {/* Warning Section */}
        {showWarning && (
          <div className="mt-8 pt-6 border-t border-red-950/80 animate-in fade-in duration-700">
            <div className="flex items-start gap-3 p-4 bg-red-950/30 border border-red-900/60 text-red-400">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-cinematic font-black tracking-widest text-lg md:text-xl text-red-400">
                  WARNING: SOMETHING IS STILL INSIDE.
                </p>
                <p className="font-terminal text-xs text-zinc-400 mt-1">
                  Unauthorized biological signature detected in Sector D. Facility integrity: 14%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enter Facility Button */}
        {showEnterButton && (
          <div className="mt-8 flex justify-center animate-in zoom-in-95 duration-500">
            <button
              onClick={handleEnter}
              className="group relative flex items-center gap-3 px-8 py-4 bg-red-950 hover:bg-red-900 border-2 border-red-700 hover:border-red-500 text-white font-cinematic font-bold tracking-widest text-base shadow-[0_0_30px_rgba(179,0,24,0.4)] transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Radio className="w-5 h-5 text-red-400 group-hover:animate-pulse" />
              <span>[ ENTER THE FACILITY ]</span>
              <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Footer System Disclaimer */}
      <div className="absolute bottom-6 text-center text-[11px] font-terminal text-zinc-600">
        NIGHTFALL OS // SECURE PROTOCOL TERMINAL // AUDIO IMMERSION RECOMMENDED
      </div>
    </div>
  );
};
