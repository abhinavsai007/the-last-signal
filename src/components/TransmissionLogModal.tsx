import React, { useState } from 'react';
import { X, Radio, Play, Pause, Volume2, Shield } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface TransmissionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Transmission {
  id: string;
  timestamp: string;
  source: string;
  frequency: string;
  transcript: string;
  status: 'CORRUPTED' | 'PARTIAL' | 'RESTRICTED';
}

export const TransmissionLogModal: React.FC<TransmissionLogModalProps> = ({
  isOpen,
  onClose
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const transmissions: Transmission[] = [
    {
      id: 'tx-01',
      timestamp: '03:17:02 AM',
      source: 'SUB-LEVEL 4 // LAB TERMINAL 03',
      frequency: '433.92 MHz',
      transcript: '...they said it was a containment failure. It wasn\'t. It broke the seal from outside the chamber. The glass didn\'t burst outward... it imploded. It was hungry for the light...',
      status: 'PARTIAL'
    },
    {
      id: 'tx-02',
      timestamp: '03:18:44 AM',
      source: 'SECURITY POST ALPHA // SGT. MERCER',
      frequency: '144.80 MHz',
      transcript: '...all monitors are cycling between static and faces. I swear I saw Kane standing in corridor 2, but Kane is locked in the cleanroom. Whoever is walking out there has Kane\'s badge...',
      status: 'CORRUPTED'
    },
    {
      id: 'tx-03',
      timestamp: '03:22:15 AM',
      source: 'MAINTENANCE SHAFT // AUTOMATED BEACON',
      frequency: '88.30 MHz',
      transcript: '...EMERGENCY BROADCAST: AUXILIARY GENERATOR DISCONNECTED. MANUAL NODE COUPLING REQUIRED IN THE TUNNEL. WARNING: SHADOW BIOMASS SENSITIVE TO AUDIO EXCITATION...',
      status: 'RESTRICTED'
    }
  ];

  const handlePlayTransmission = (tx: Transmission) => {
    if (playingId === tx.id) {
      setPlayingId(null);
      return;
    }

    setPlayingId(tx.id);
    audioEngine.playStaticBurst(0.6, 0.3);
    audioEngine.playTerminalBeep('alert');
    audioEngine.playWhisper();

    setTimeout(() => {
      setPlayingId(null);
    }, 4500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-zinc-950 border border-zinc-800 text-zinc-300 font-terminal shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-base font-bold tracking-wider text-white">
              RADIO INTERCEPT LOGS // 433.92 MHz
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <p className="text-zinc-400 mb-2">
            Recovered emergency audio fragments broadcast across shortwave channels following the facility blackout:
          </p>

          {transmissions.map(tx => (
            <div
              key={tx.id}
              className="p-4 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 font-bold text-zinc-200">
                  <span className="text-red-400">{tx.timestamp}</span>
                  <span className="text-zinc-600">//</span>
                  <span>{tx.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                    {tx.frequency}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-red-950 text-red-400 border border-red-900">
                    {tx.status}
                  </span>
                </div>
              </div>

              <p className="text-zinc-300 italic mb-4 pl-3 border-l-2 border-red-800/80 leading-relaxed font-sans text-sm">
                "{tx.transcript}"
              </p>

              <button
                onClick={() => handlePlayTransmission(tx)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                  playingId === tx.id
                    ? 'bg-red-950 border-red-600 text-red-300 animate-pulse'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                }`}
              >
                {playingId === tx.id ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>BROADCASTING INTERCEPT...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PLAY RECONSTRUCTED AUDIO</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs tracking-wider cursor-pointer"
          >
            DISCONNECT RELAY
          </button>
        </div>
      </div>
    </div>
  );
};
