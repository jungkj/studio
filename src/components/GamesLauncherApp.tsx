import React from 'react';
import { PixelButton } from './PixelButton';
import { TicTacToe } from './TicTacToe'; // Keep TicTacToe as an example game

interface GamesLauncherAppProps {
  onClose: () => void;
  onLaunchGame: (gameName: 'ticTacToe' | 'snake' | 'sudoku' | 'solitaire') => void;
}

const GamesLauncherApp: React.FC<GamesLauncherAppProps> = ({ onClose, onLaunchGame }) => {
  return (
    <div className="p-2 font-sans text-mac-black flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">Games</h2>
      <div className="flex-grow mac-border-inset bg-mac-light-gray p-3 flex flex-col space-y-2">
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
      <div className="mt-4 text-right">
        <PixelButton onClick={onClose} variant="default">Close Games Launcher</PixelButton>
      </div>
    </div>
  );
};

export { GamesLauncherApp };