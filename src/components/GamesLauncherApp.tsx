import React from 'react';
import { PixelButton } from './PixelButton';
// import { TicTacToe } from './TicTacToe'; // Keep TicTacToe as an example game - no need to import here

interface GamesLauncherAppProps {
  onClose: () => void;
  onLaunchGame: (gameName: 'ticTacToe' | 'snake' | 'sudoku' | 'solitaire') => void;
}

const GamesLauncherApp: React.FC<GamesLauncherAppProps> = ({ onClose, onLaunchGame }) => {
  return (
    <div className="p-1 font-sans text-mac-black flex flex-col h-full"> {/* Adjusted padding */}
      <h2 className="text-base mb-2">Games</h2> {/* Adjusted font size, removed bold */}
      <div className="flex-grow mac-border-inset bg-mac-light-gray p-2 flex flex-col space-y-1"> {/* Adjusted padding and space-y */}
        <PixelButton onClick={() => { onLaunchGame('ticTacToe'); onClose(); }} variant="default" className="w-full">
          Tic-Tac-Toe
        </PixelButton>
        <PixelButton onClick={() => { onLaunchGame('snake'); onClose(); }} variant="default" className="w-full">
          Snake
        </PixelButton>
        <PixelButton onClick={() => { onLaunchGame('sudoku'); onClose(); }} variant="default" className="w-full">
          Sudoku
        </PixelButton>
        <PixelButton onClick={() => { onLaunchGame('solitaire'); onClose(); }} variant="default" className="w-full">
          Solitaire
        </PixelButton>
      </div>
      <div className="mt-2 text-right"> {/* Adjusted margin-top */}
        <PixelButton onClick={onClose} variant="default">Close Games Launcher</PixelButton>
      </div>
    </div>
  );
};

export { GamesLauncherApp };