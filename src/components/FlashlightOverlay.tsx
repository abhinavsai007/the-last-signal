import React, { useEffect, useState } from 'react';

interface FlashlightOverlayProps {
  enabled: boolean;
  intensity?: number;
  color?: string; // e.g. white or red in red room
}

export const FlashlightOverlay: React.FC<FlashlightOverlayProps> = ({
  enabled,
  intensity = 1,
  color = 'rgba(235, 240, 255, 0.08)'
}) => {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!enabled || isTouch) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: `radial-gradient(circle 380px at ${pos.x}px ${pos.y}px, ${color} 0%, rgba(5,5,5,0) 70%)`,
        opacity: intensity
      }}
    />
  );
};
