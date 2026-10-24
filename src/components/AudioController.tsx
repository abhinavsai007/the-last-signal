import React, { useState } from 'react';
import { Volume2, VolumeX, Sliders, Eye, Zap, Radio } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { GameSettings } from '../types/game';

interface AudioControllerProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onOpenSettings: () => void;
}

export const AudioController: React.FC<AudioControllerProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings
}) => {
  const [showSliders, setShowSliders] = useState(false);

  const toggleSound = () => {
    const nextState = !settings.soundEnabled;
    onUpdateSettings({ soundEnabled: nextState });
    audioEngine.setMuted(!nextState);
    if (nextState) {
      audioEngine.startAmbientDrone();
      audioEngine.playTerminalBeep('success');
    } else {
      audioEngine.stopAmbientDrone();
    }
  };

  const handleMasterVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ masterVolume: val });
    audioEngine.setMasterVolume(val);
  };

  const handleAmbientVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ ambientVolume: val });
    audioEngine.setAmbientVolume(val);
  };

  const handleMusicVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ musicVolume: val });
    audioEngine.setMusicVolume(val);
  };

  const handleSfxVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ sfxVolume: val });
    audioEngine.setSfxVolume(val);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* Radio Broadcast Status Badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-black/80 border border-zinc-800 text-[11px] font-terminal tracking-wider text-zinc-400 backdrop-blur-md rounded-none shadow-lg">
        <Radio className={`w-3.5 h-3.5 ${settings.soundEnabled ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`} />
        <span>{settings.soundEnabled ? 'OST: DANYDORY - DARK NIGHT' : 'MUTED'}</span>
      </div>

      {/* Quick Sound Toggle */}
      <button
        onClick={toggleSound}
        title={settings.soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        aria-label="Toggle Sound"
        className={`p-2.5 rounded-none border transition-all duration-200 backdrop-blur-md cursor-pointer ${
          settings.soundEnabled
            ? 'bg-red-950/40 border-red-800/80 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(179,0,24,0.3)]'
            : 'bg-zinc-900/80 border-zinc-700 text-zinc-500 hover:text-zinc-300'
        }`}
      >
        {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Sliders Dropdown Toggle */}
      <button
        onClick={() => setShowSliders(!showSliders)}
        title="Audio Channels"
        aria-label="Audio Levels"
        className="p-2.5 bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white transition-all backdrop-blur-md cursor-pointer"
      >
        <Sliders className="w-4 h-4" />
      </button>

      {/* Accessibility Settings Toggle */}
      <button
        onClick={onOpenSettings}
        title="Accessibility & Horror Parameters"
        aria-label="Accessibility Settings"
        className="p-2.5 bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-all backdrop-blur-md cursor-pointer"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Audio Sliders Flyout */}
      {showSliders && (
        <div className="absolute right-0 top-12 w-64 p-4 bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-xl text-xs font-terminal animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800 text-zinc-400">
            <span className="flex items-center gap-1.5 font-bold tracking-wider">
              <Zap className="w-3 h-3 text-red-500" /> ACOUSTIC LEVELS
            </span>
            <span className="text-[10px] text-zinc-600">NIGHTFALL OS</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>MASTER GAIN</span>
                <span className="text-red-400">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={handleMasterVol}
                className="w-full accent-red-600 bg-zinc-800 h-1 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>STRANGE HORROR OST</span>
                <span className="text-red-400">{Math.round((settings.musicVolume ?? 0.55) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume ?? 0.55}
                onChange={handleMusicVol}
                className="w-full accent-red-600 bg-zinc-800 h-1 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>AMBIENT DRONE</span>
                <span className="text-red-400">{Math.round(settings.ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.ambientVolume}
                onChange={handleAmbientVol}
                className="w-full accent-red-600 bg-zinc-800 h-1 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>SFX & GLITCH</span>
                <span className="text-red-400">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={handleSfxVol}
                className="w-full accent-red-600 bg-zinc-800 h-1 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
