import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle, ShieldCheck, Radio, CheckCircle, ExternalLink } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface EndingSequenceProps {
  endingType: 'A' | 'B' | 'C';
  onRestart: () => void;
  reducedMotion: boolean;
}

export const EndingSequence: React.FC<EndingSequenceProps> = ({
  endingType,
  onRestart,
  reducedMotion
}) => {
  const [phase, setPhase] = useState<'flash' | 'connection_lost' | 'status_unknown' | 'story_reveal'>('flash');

  useEffect(() => {
    // 1. Whiteout flash & audio cut
    audioEngine.stopAmbientDrone();
    audioEngine.playStaticBurst(0.8, 0.5);

    const t1 = setTimeout(() => {
      setPhase('connection_lost');
      audioEngine.playTerminalBeep('alert');
    }, 1200);

    const t2 = setTimeout(() => {
      setPhase('status_unknown');
      audioEngine.playTerminalBeep('alert');
    }, 2800);

    const t3 = setTimeout(() => {
      setPhase('story_reveal');
      if (endingType === 'A') {
        audioEngine.playTerminalBeep('success');
      } else if (endingType === 'B') {
        audioEngine.playWhisper();
      } else {
        audioEngine.playHeartbeat(false);
      }
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [endingType]);

  const endingsData = {
    A: {
      tag: 'ENDING A // ESCAPED',
      title: 'THE SURFACE OF THE EARTH',
      color: 'text-emerald-400',
      border: 'border-emerald-600',
      narrative: `The heavy pneumatic seal shudders. Hydraulic fluid sprays across the blast threshold as the four-ton vault door screeches upward.
      
Freezing dawn air rushes down the extraction shaft, clearing the taste of copper and damp concrete from your throat. You climb the rusted ladder into the autumn pine forest. 

Behind you, the concrete chimney of Sub-Level 4 sits submerged in early morning fog, completely silent. You survived the facility. The signal has gone dark.`
    },
    B: {
      tag: 'ENDING B // THE LAST TRANSMISSION',
      title: 'IT FOLLOWED YOU OUT',
      color: 'text-red-400',
      border: 'border-red-600',
      narrative: `You burst through the emergency surface hatch, gasping for breath beneath the gray morning clouds. You sprint down the gravel access road, leaving the abandoned bunker miles behind.

You reach your car. Your hands tremble as you start the ignition. 

Then, your smartphone vibrates on the passenger seat. The screen wakes with distorted analog scanlines. The audio speaker crackles with rhythmic, rhythmic breathing... followed by a distorted whisper in your own voice:

"THANK YOU FOR UNLOCKING THE DOOR."`
    },
    C: {
      tag: 'ENDING C // PERMANENT CONTAINMENT',
      title: 'SEALED IN THE DARK',
      color: 'text-amber-400',
      border: 'border-amber-600',
      narrative: `You pull the manual containment emergency lever. Massive mechanical deadbolts slam shut across the entrance and exit shafts with an earthquake-like shudder. 

You hear the heavy hydraulic cables snapping outside as surface control severs all lifelines. 

You sit against the cold steel of the generator housing. In the distance, the low hum of 433.92 MHz vibrates through the concrete floor. The lights flicker, dim, and click off one by one. You are not alone in the dark.`
    }
  }[endingType];

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-[#E8E8E8] flex flex-col justify-center items-center p-6 select-none overflow-hidden font-terminal">
      {/* Flash Phase */}
      {phase === 'flash' && (
        <div className={`fixed inset-0 z-50 bg-white ${
          reducedMotion ? 'opacity-80 transition-opacity duration-700' : 'animate-pulse opacity-95 transition-all duration-700'
        }`} />
      )}

      {/* Connection Lost Phase */}
      {phase === 'connection_lost' && (
        <div className="text-center space-y-4 animate-in zoom-in-95 duration-500">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-ping mx-auto" />
          <h2 className="text-3xl font-cinematic font-black text-red-500 tracking-widest">
            CONNECTION LOST.
          </h2>
          <p className="text-xs text-zinc-500 font-mono">SIGNAL SEVERED AT SURFACE INTERFACE</p>
        </div>
      )}

      {/* Status Unknown Phase */}
      {phase === 'status_unknown' && (
        <div className="text-center space-y-4 animate-in zoom-in-95 duration-500">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-ping mx-auto" />
          <h2 className="text-3xl font-cinematic font-black text-white tracking-widest">
            SUBJECT STATUS: UNKNOWN.
          </h2>
          <p className="text-xs text-zinc-500 font-mono">SEARCHING RELAY SATELLITE CHANNELS...</p>
        </div>
      )}

      {/* Final Cinematic Story Reveal */}
      {phase === 'story_reveal' && (
        <div className="relative z-10 max-w-2xl w-full p-8 bg-zinc-950/90 border-2 border-zinc-800 shadow-[0_0_60px_rgba(0,0,0,0.95)] backdrop-blur-md animate-in fade-in duration-700 space-y-6">
          {/* Ending Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <span className={`text-xs font-bold font-mono tracking-widest ${endingsData.color}`}>
              {endingsData.tag}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">FACILITY SIMULATION CONCLUDED</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-cinematic font-black tracking-tight text-white">
            {endingsData.title}
          </h2>

          {/* Narrative description */}
          <div className="p-5 bg-black/80 border border-zinc-900 text-zinc-300 font-serif leading-relaxed text-sm sm:text-base italic whitespace-pre-line shadow-inner">
            {endingsData.narrative}
          </div>

          {/* Action buttons: Restart & Explore Other Endings */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-8 py-3.5 bg-red-950 hover:bg-red-900 border-2 border-red-700 text-white font-cinematic font-bold text-xs tracking-widest transition-all cursor-pointer shadow-[0_0_25px_rgba(179,0,24,0.4)]"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span>[ RESTART ESCAPE INVESTIGATION ]</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
