import React, { useState, useEffect } from 'react';

interface MacLoadingScreenProps {
  onLoadingComplete: () => void;
}

const MacLoadingScreen: React.FC<MacLoadingScreenProps> = ({ onLoadingComplete }) => {
  const [showCursor, setShowCursor] = useState(true);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  // Spinner animation
  useEffect(() => {
    const spinnerInterval = setInterval(() => {
      setSpinnerFrame(prev => (prev + 1) % spinnerChars.length);
    }, 80);

    return () => clearInterval(spinnerInterval);
  }, [spinnerChars.length]);

  // Auto-complete after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          onLoadingComplete();
        }, 300);
      }, 800);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  // Handle immediate skip on click/spacebar
  useEffect(() => {
    const handleSkip = (e: KeyboardEvent | MouseEvent) => {
      if (e.type === 'click' || (e as KeyboardEvent).code === 'Space') {
        e.preventDefault();
        setFadeOut(true);
        setTimeout(() => {
          onLoadingComplete();
        }, 300);
      }
    };

    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);
    
    return () => {
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [onLoadingComplete]);

  return (
    <div 
      className={`fixed inset-0 w-screen h-screen bg-black flex items-center justify-center z-50 overflow-hidden transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* Minimal retro terminal loading */}
        <div className="font-mono text-green-400 text-sm">
          {!isComplete ? (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">{spinnerChars[spinnerFrame]}</span>
              <span>Loading</span>
              <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>_</span>
            </div>
          ) : (
            <div className="animate-fade-in">
              <span>Ready</span>
              <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>_</span>
            </div>
          )}
        </div>
        
        {/* Skip hint - subtle and minimal */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="font-mono text-green-400 text-xs opacity-50">
            Press space to skip
          </div>
        </div>
      </div>
    </div>
  );
};

export { MacLoadingScreen };