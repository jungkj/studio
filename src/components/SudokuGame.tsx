import React from 'react';
import { PixelButton } from './PixelButton';

interface SudokuGameProps {
  onClose: () => void;
}

const SudokuGame: React.FC<SudokuGameProps> = ({ onClose }) => {
  return (
    <div className="p-1 font-sans text-mac-black flex flex-col items-center h-full"> {/* Adjusted padding */}
      <h2 className="text-base mb-2">Sudoku Game</h2> {/* Adjusted font size, removed bold */}
      <div className="flex-grow mac-border-inset bg-mac-dark-gray flex items-center justify-center text-mac-white text-base"> {/* Adjusted font size */}
        {/* Placeholder for Sudoku Game */}
        <p>Sudoku game goes here!</p>
      </div>
      <div className="mt-2 text-right w-full"> {/* Adjusted margin-top */}
        <PixelButton onClick={onClose} variant="default">Close Sudoku</PixelButton>
      </div>
    </div>
  );
};

export { SudokuGame };