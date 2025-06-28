import React, { useState } from 'react';
import { PixelButton } from './PixelButton';
import { TicTacToe } from './TicTacToe'; // Import TicTacToe

interface GamesAppProps {
  onClose: () => void;
}

type ActiveGame = 'none' | 'ticTacToe';

const GamesApp: React.FC<GamesAppProps> = ({ onClose }) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('none');

  const renderGame = () => {
    switch (activeGame) {
      case 'ticTacToe':
        return <TicTacToe />;
      default:
        return (
          <div className="p-2 font-sans text-mac-black">
            <h2 className="text-lg font-bold mb-4">Select a Game</h2>
            <div className="space-y-2">
              <PixelButton onClick={() => setActiveGame('ticTacToe')} variant="default" className="w-full">
                Tic-Tac-Toe
              </PixelButton>
              {/* Add more game buttons here */}
            </div>
            <div className="mt-6 text-right">
              <PixelButton onClick={onClose} variant="default">Close Games</PixelButton>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {activeGame !== 'none' && (
        <div className="mb-4 text-right">
          <PixelButton onClick={() => setActiveGame('none')} variant="secondary">
            Back to Games List
          </PixelButton>
        </div>
      )}
      <div className="flex-grow overflow-auto">
        {renderGame()}
      </div>
    </div>
  );
};

export { GamesApp };