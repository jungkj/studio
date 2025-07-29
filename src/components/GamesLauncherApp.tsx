'use client';

import React from 'react';

interface GamesLauncherAppProps {
  onClose?: () => void;
  onLaunchGame: (gameName: 'chess' | 'breakout') => void;
}

export const GamesLauncherApp: React.FC<GamesLauncherAppProps> = ({ onClose, onLaunchGame }) => {
  const games = [
    {
      id: 'chess',
      name: 'Chess',
      description: '3|1 Rapid Chess vs Bot',
      icon: '♟️',
      color: 'bg-[#302e2b]'
    },
    {
      id: 'breakout',
      name: 'Breakout',
      description: 'Classic Brick Breaking',
      icon: '🧱',
      color: 'bg-[#2c3e50]'
    }
  ];

  return (
    <div className="h-full bg-mac-light-gray p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Games</h1>
      
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onLaunchGame(game.id as 'chess' | 'breakout')}
            className={`
              ${game.color} text-white rounded-lg p-6
              hover:brightness-110 active:brightness-95
              transition-all duration-150 transform hover:scale-105
              shadow-md hover:shadow-lg
              flex flex-col items-center justify-center
              min-h-[160px]
            `}
          >
            <div className="text-5xl mb-3">{game.icon}</div>
            <h3 className="font-bold text-lg mb-1">{game.name}</h3>
            <p className="text-sm opacity-80">{game.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};