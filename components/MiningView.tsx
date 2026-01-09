
import React, { useState, useRef } from 'react';

interface MiningViewProps {
  balance: number;
  energy: number;
  maxEnergy: number;
  onTap: (x: number, y: number) => boolean;
}

const MiningView: React.FC<MiningViewProps> = ({ balance, energy, maxEnergy, onTap }) => {
  const [isTapping, setIsTapping] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, x: number, y: number, text: string}[]>([]);
  // Use a ref to throttle redirects so we don't spam popups on every fast-tap
  const lastRedirectRef = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    
    // Check energy first
    const success = onTap(e.clientX, e.clientY);
    
    if (success) {
      // Open the requested site. 
      // We throttle this to once every 5 seconds so the browser doesn't block the popups
      // and the user can still enjoy the tapping gameplay.
      if (now - lastRedirectRef.current > 5000) {
        window.open("https://otieu.com/4/10183879", "_blank");
        lastRedirectRef.current = now;
      }

      setIsTapping(true);
      // Visual feedback: +Coins
      const newFloating = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY - 40,
        text: `+${(Math.floor(Math.log10(balance + 1)) + 1).toString()}` 
      };
      setFloatingTexts(prev => [...prev, newFloating]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(f => f.id !== newFloating.id)), 800);
      
      // Haptic feedback for mobile devices
      if (window.navigator.vibrate) {
        window.navigator.vibrate(20);
      }
    }
  };

  const handlePointerUp = () => setIsTapping(false);

  const energyPercentage = (energy / maxEnergy) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      {/* Floating Taps */}
      {floatingTexts.map(f => (
        <div 
          key={f.id} 
          className="floating-text text-2xl"
          style={{ left: f.x, top: f.y }}
        >
          {f.text}
        </div>
      ))}

      {/* Main Star Button */}
      <div 
        className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-transform duration-75 cursor-pointer
          ${isTapping ? 'scale-95' : 'scale-100'}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Background glow circle */}
        <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* The Star Asset */}
        <div className="relative z-10 text-9xl star-glow">
          ⭐
        </div>
      </div>

      {/* Energy System Display */}
      <div className="mt-12 w-full max-w-[280px]">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">⚡</span>
            <span className="font-bold text-sm">{Math.floor(energy)} / {maxEnergy}</span>
          </div>
          <span className="text-gray-500 text-xs font-medium">Auto-mining Active</span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-300 ease-out"
            style={{ width: `${energyPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-8 text-center px-8">
        <p className="text-gray-400 text-sm leading-relaxed">
          Tap the star to visit our sponsor and <span className="text-yellow-500 font-bold">mine stars</span>!
        </p>
      </div>
    </div>
  );
};

export default MiningView;
