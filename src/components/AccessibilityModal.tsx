import React, { useState } from 'react';
import { X, ShieldAlert, Sparkles, Moon, Zap, RotateCcw, Check } from 'lucide-react';
import { GameSettings } from '../types/game';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onResetGame: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetGame
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 bg-zinc-950 border border-zinc-800 text-zinc-300 font-terminal shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold tracking-wider text-white">SAFETY & ACCESSIBILITY PROTOCOLS</h2>
        </div>

        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          The Last Signal utilizes analog distortion, low-frequency soundscapes, and lighting fluctuations. Adjust parameters below to tailor the physiological comfort of the experience.
        </p>

        <div className="space-y-4 mb-6">
          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 font-semibold text-zinc-200 text-sm">
                <Moon className="w-4 h-4 text-zinc-400" />
                <span>Reduced Motion Mode</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Disables camera sway, glitch vibrations, and intense screen shakes.</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                settings.reducedMotion
                  ? 'bg-red-950 border-red-700 text-red-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              {settings.reducedMotion ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Low Intensity Visuals */}
          <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 font-semibold text-zinc-200 text-sm">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span>Low Visual Intensity</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Attenuates CRT scanlines, chromatic shifts, and sudden lighting flickers.</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ lowIntensityVisuals: !settings.lowIntensityVisuals })}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                settings.lowIntensityVisuals
                  ? 'bg-red-950 border-red-700 text-red-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              {settings.lowIntensityVisuals ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Flashlight Lighting */}
          <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 font-semibold text-zinc-200 text-sm">
                <Zap className="w-4 h-4 text-zinc-400" />
                <span>Cursor Flashlight Beam</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Dynamic light cone responsive to cursor movements in darkness.</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ flashlightEffect: !settings.flashlightEffect })}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                settings.flashlightEffect
                  ? 'bg-red-950 border-red-700 text-red-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              {settings.flashlightEffect ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Reset Section */}
        <div className="pt-4 border-t border-zinc-800/80">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Facility Progress & Save State...</span>
            </button>
          ) : (
            <div className="p-3 bg-red-950/40 border border-red-800 text-xs">
              <p className="text-red-300 font-bold mb-2">Are you sure? All keys, codes, and room progress will be purged.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetGame();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-red-800 text-white font-bold hover:bg-red-700 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> CONFIRM PURGE
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
