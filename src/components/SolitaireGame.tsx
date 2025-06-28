import React from 'react';
import { PixelButton } from './PixelButton';

interface SolitaireGameProps {
  onClose: () => void;
}

const SolitaireGame: React.FC<SolitaireGameProps> = ({ onClose }) => {
  return (
    <div className="p-2 font-sans text-mac-black flex flex-col items-center h-full">
      <h2 className="text-lg font-bold mb-4">Solitaire Game</h2>
      <div className="flex-grow mac-border-inset bg-mac-dark-gray flex items-center justify-center text-mac-white text-xl">
        {/* Placeholder for Solitaire Game */}
        <p>Solitaire game goes here!</p>
      </div>
      <div className="mt-4 text-right w-full">
        <PixelButton onClick={onClose} variant="default">Close Solitaire</PixelButton>
      </div>
    </div>
  );
};

export { SolitaireGame };