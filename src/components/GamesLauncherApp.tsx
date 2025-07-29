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
              bg-white border-2 border-mac-darker-gray
              hover:bg-mac-light-gray active:bg-mac-medium-gray
              transition-colors duration-150
              shadow-md hover:shadow-lg active:shadow-inner
              flex flex-col items-center justify-center
              min-h-[160px] p-6
              relative overflow-hidden
            `}
          >
            {/* Classic Mac OS window-style header */}
            <div className="absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-white to-mac-light-gray border-b border-mac-darker-gray flex items-center px-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-mac-medium-gray border border-mac-darker-gray"></div>
                <div className="w-2 h-2 rounded-full bg-mac-medium-gray border border-mac-darker-gray"></div>
                <div className="w-2 h-2 rounded-full bg-mac-medium-gray border border-mac-darker-gray"></div>
              </div>
            </div>
            
            <div className="text-5xl mb-3 mt-4">{game.icon}</div>
            <h3 className="font-bold text-lg mb-1 text-black">{game.name}</h3>
            <p className="text-sm text-gray-700">{game.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};