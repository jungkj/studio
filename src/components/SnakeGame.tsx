import React from 'react';
import { PixelButton } from './PixelButton';

interface SnakeGameProps {
  onClose: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onClose }) => {
  return (
    <div className="p-2 font-sans text-mac-black flex flex-col items-center h-full">
      <h2 className="text-lg font-bold mb-4">Snake Game</h2>
      <div className="flex-grow mac-border-inset bg-mac-dark-gray flex items-center justify-center text-mac-white text-xl">
        {/* Placeholder for Snake Game */}
        <p>Snake game goes here!</p>
      </div>
      <div className="mt-4 text-right w-full">
        <PixelButton onClick={onClose} variant="default">Close Snake</PixelButton>
      </div>
    </div>
  );
};

export { SnakeGame };