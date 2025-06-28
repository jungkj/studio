import React from 'react';
import { PixelButton } from './PixelButton';

interface SudokuGameProps {
  onClose: () => void;
}

const SudokuGame: React.FC<SudokuGameProps> = ({ onClose }) => {
  return (
    <div className="p-2 font-sans text-mac-black flex flex-col items-center h-full">
      <h2 className="text-lg font-bold mb-4">Sudoku Game</h2>
      <div className="flex-grow mac-border-inset bg-mac-dark-gray flex items-center justify-center text-mac-white text-xl">
        {/* Placeholder for Sudoku Game */}
        <p>Sudoku game goes here!</p>
      </div>
      <div className="mt-4 text-right w-full">
        <PixelButton onClick={onClose} variant="default">Close Sudoku</PixelButton>
      </div>
    </div>
  );
};

export { SudokuGame };