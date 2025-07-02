import React, { useState, useEffect } from 'react';

interface MacLoadingScreenProps {
  onLoadingComplete: () => void;
}

const MacLoadingScreen: React.FC<MacLoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const bootMessages = [
    "System 7.5.3 starting up...",
    "Checking memory...",
    "Loading extensions...", 
    "Initializing Finder...",
    "Loading desktop...",
    "Starting applications...",
    "Welcome to Andy's Portfolio"
  ];

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Loading progress
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 8 + 2;
        
        // Update loading text based on progress
        if (newProgress < 15) {
          setLoadingText(bootMessages[0]);
        } else if (newProgress < 30) {
          setLoadingText(bootMessages[1]);
        } else if (newProgress < 45) {
          setLoadingText(bootMessages[2]);
        } else if (newProgress < 60) {
          setLoadingText(bootMessages[3]);
        } else if (newProgress < 75) {
          setLoadingText(bootMessages[4]);
        } else if (newProgress < 90) {
          setLoadingText(bootMessages[5]);
        } else if (newProgress < 100) {
          setLoadingText(bootMessages[6]);
        }

        if (newProgress >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => setIsComplete(true), 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(progressTimer);
  }, []);

  // Handle continue after completion
  useEffect(() => {
    if (isComplete) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.type === 'click') {
          e.preventDefault();
          onLoadingComplete();
        }
      };

      const handleClick = () => onLoadingComplete();

      window.addEventListener('keydown', handleKeyPress);
      window.addEventListener('click', handleClick);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('click', handleClick);
      };
    }
  }, [isComplete, onLoadingComplete]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-mac-medium-gray flex items-center justify-center z-50 overflow-hidden">
      <div className="text-center">
        {/* Classic Mac Monitor - Even Bigger Size */}
        <div className="flex justify-center">
          <div className="w-[28rem] h-96 bg-mac-light-gray mac-border-outset flex flex-col items-center justify-center relative">
            {/* CRT Screen - Larger */}
            <div className="w-96 h-64 bg-black mac-border-inset flex flex-col items-center justify-center relative mb-4">
              {!isComplete ? (
                /* Terminal Loading */
                <div className="text-green-400 text-center mac-system-font text-sm leading-relaxed p-6 w-full">
                  <div className="mb-6 text-base">Andy's Retro Mac</div>
                  <div className="text-xs mb-8 opacity-80">
                    © 2001 - present Andy Jung
                  </div>
                  
                  {/* Loading Status */}
                  <div className="font-mono text-xs mb-6">
                    <div className="mb-4 h-4 flex items-center">
                      {loadingText}
                      <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>_</span>
                    </div>
                    
                    {/* ASCII Progress Bar */}
                    <div className="flex items-center justify-center mb-3">
                      <span className="mr-2 text-green-300">[</span>
                      <div className="w-32 flex">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <span key={i} className={progress >= (i + 1) * 6.25 ? 'text-green-400' : 'text-gray-700'}>
                            ▓
                          </span>
                        ))}
                      </div>
                      <span className="ml-2 text-green-300">]</span>
                    </div>
                    <div className="text-xs text-green-300">{Math.round(progress)}% complete</div>
                  </div>
                  
                  {/* Loading dots animation */}
                  <div className="flex justify-center space-x-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`text-green-400 transition-opacity duration-500 ${
                          Math.floor(Date.now() / 400) % 3 === i ? 'opacity-100' : 'opacity-30'
                        }`}
                      >
                        ●
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                                 /* Completion Screen with Finder */
                 <div className="text-green-400 text-center mac-system-font text-sm leading-relaxed p-6 w-full animate-fade-in">
                   <div className="mb-6">
                     {/* Finder Icon */}
                     <div className="mb-4 flex justify-center">
                       <img 
                         src="/finder.png" 
                         alt="Finder" 
                         className="w-16 h-16"
                         style={{ imageRendering: 'pixelated' }}
                       />
                     </div>
                     <div className="text-base mb-2">Welcome!</div>
                     <div className="text-xs mb-6 opacity-80">
                       System ready • Andy's Portfolio
                     </div>
                   </div>
                  
                  <div className="animate-pulse">
                    <div className="text-xs mb-3">
                      Click anywhere or press spacebar to continue
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-xs px-2 py-1 border border-green-400">SPACE</span>
                      <span className={`text-xs ${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mac Base */}
            <div className="w-80 h-16 bg-mac-medium-gray mac-border-inset flex items-center justify-center relative">
              <div className="w-56 h-3 bg-mac-dark-gray rounded-sm"></div>
              {/* Floppy slot */}
              <div className="absolute bottom-3 w-28 h-1 bg-mac-dark-gray"></div>
            </div>
          </div>
        </div>
        
        {/* Author Info */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-sm mac-system-font text-mac-dark-gray font-bold">
            Andy Jung
          </div>
        </div>
      </div>
    </div>
  );
};

export { MacLoadingScreen }; 