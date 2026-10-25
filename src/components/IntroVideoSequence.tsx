import React, { useRef, useState, useEffect } from 'react';
import { FastForward, Volume2, VolumeX, Play } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface IntroVideoSequenceProps {
  onComplete: () => void;
  reducedMotion?: boolean;
}

export const IntroVideoSequence: React.FC<IntroVideoSequenceProps> = ({
  onComplete,
  reducedMotion = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [needsClickToPlay, setNeedsClickToPlay] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt autoplay
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setNeedsClickToPlay(false);
        })
        .catch(() => {
          // Autoplay was prevented by browser policy
          setNeedsClickToPlay(true);
        });
    }

    audioEngine.startAmbientDrone();
  }, []);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setNeedsClickToPlay(false);
        })
        .catch(() => {
          setHasError(true);
        });
    }
  };

  const handleVideoEnded = () => {
    setIsEnding(true);
    audioEngine.playMetalClang();
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  const handleSkip = () => {
    setIsEnding(true);
    audioEngine.playTerminalBeep('key');
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center overflow-hidden select-none transition-opacity duration-700 ${
      isEnding ? 'opacity-0 scale-95' : 'opacity-100'
    }`}>
      {/* Ambient background atmosphere */}
      <div className="absolute inset-0 bg-red-950/20 pointer-events-none z-10" />
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none z-10" />
      <div className="absolute inset-0 crt-vignette pointer-events-none z-10" />

      {/* Main Horror Video */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          src="/assets/aistudio/horror_opening_1438c73b.mp4"
          className="w-full h-full object-cover sm:object-contain max-h-screen"
          playsInline
          autoPlay
          onEnded={handleVideoEnded}
          onError={() => setHasError(true)}
        />

        {/* Play Overlay if browser prevented autoplay */}
        {needsClickToPlay && !hasError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-6 text-center space-y-4">
            <div className="p-4 rounded-full bg-red-950/60 border-2 border-red-600 animate-pulse">
              <Play className="w-10 h-10 text-red-500 fill-red-500" />
            </div>
            <h2 className="font-cinematic font-black text-2xl text-red-500 tracking-wider">
              NIGHTFALL TRANSMISSION READY
            </h2>
            <p className="font-terminal text-xs text-zinc-400 max-w-md">
              Click below to initiate facility security intro playback.
            </p>
            <button
              onClick={handlePlayClick}
              className="px-8 py-3 bg-red-900 hover:bg-red-800 border border-red-500 text-white font-cinematic font-bold text-sm tracking-widest cursor-pointer shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all"
            >
              [ START FACILITY TRANSMISSION ]
            </button>
          </div>
        )}

        {/* Fallback error if video fails to load */}
        {hasError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center space-y-4 font-terminal text-xs text-zinc-400">
            <p className="text-red-500 font-bold text-base">VIDEO TRANSMISSION INTERRUPTED</p>
            <p>Entering facility directly...</p>
            <button
              onClick={handleSkip}
              className="px-6 py-2 bg-zinc-900 border border-zinc-700 text-white font-bold cursor-pointer"
            >
              PROCEED TO FACILITY MAP
            </button>
          </div>
        )}
      </div>

      {/* Top Header bar over video */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 border border-red-900/70 text-xs font-terminal text-red-400 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span className="font-bold">SECTOR 4 // INTRO TRANSMISSION</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2 bg-black/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white backdrop-blur-sm cursor-pointer transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-black/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-terminal text-zinc-300 hover:text-white backdrop-blur-sm cursor-pointer transition-all"
          >
            <span>SKIP INTRO</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Subtitle / Status bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="px-4 py-1.5 bg-black/80 border border-zinc-900 text-[11px] font-terminal text-zinc-400 backdrop-blur-sm">
          CLASSIFIED CAMERA REEL #0317
        </div>
        <div className="px-4 py-1.5 bg-black/80 border border-zinc-900 text-[11px] font-terminal text-red-500 font-bold backdrop-blur-sm animate-pulse">
          ELEVATION: -140m // ANOMALY DETECTED
        </div>
      </div>
    </div>
  );
};
