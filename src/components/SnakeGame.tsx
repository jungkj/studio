import React, { useState, useEffect, useCallback } from 'react';
import { PixelButton } from './PixelButton';
import { cn } from '@/lib/utils';

interface SnakeGameProps {
  onClose: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 16;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const GAME_SPEED = 150;

const SnakeGame: React.FC<SnakeGameProps> = ({ onClose }) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake-high-score');
    return saved ? parseInt(saved) : 0;
  });

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
  }, [generateFood]);

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snake-high-score', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, generateFood, highScore]);

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && e.code === 'Space') {
        setGameStarted(true);
        return;
      }

      if (gameOver) return;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="p-4 mac-system-font text-mac-black flex flex-col items-center h-full bg-mac-light-gray">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4 mac-border-inset bg-mac-white p-2">
        <div className="flex items-center space-x-3">
          <div className="text-lg font-bold">🐍 SNAKE</div>
          <div className="text-xs">
            <div>Score: <span className="font-bold">{score}</span></div>
            <div>High: <span className="font-bold text-green-800">{highScore}</span></div>
          </div>
        </div>
        <div className="text-xs text-right">
          <div>Speed: {GAME_SPEED}ms</div>
          <div>Length: {snake.length}</div>
        </div>
      </div>

      {/* Game Board */}
      <div className="mac-border-inset bg-black p-2 mb-4 relative">
        <div 
          className="relative mac-screen"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            background: 'linear-gradient(135deg, #001100 0%, #003300 50%, #001100 100%)',
          }}
        >
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #00ff00 1px, transparent 1px),
                linear-gradient(to bottom, #00ff00 1px, transparent 1px)
              `,
              backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
            }}
          />

          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={cn(
                "absolute border",
                index === 0 
                  ? "bg-green-400 border-green-200" // Head - brighter green
                  : "bg-green-600 border-green-400"  // Body - darker green
              )}
              style={{
                left: segment.x * CELL_SIZE + 1,
                top: segment.y * CELL_SIZE + 1,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                boxShadow: index === 0 
                  ? "0 0 4px #00ff00, inset 0 0 2px #ffffff" 
                  : "inset 0 0 2px rgba(255,255,255,0.3)"
              }}
            >
              {/* Snake head eyes */}
              {index === 0 && (
                <>
                  <div 
                    className="absolute bg-white rounded-full"
                    style={{
                      width: '3px',
                      height: '3px',
                      top: '3px',
                      left: direction === 'RIGHT' ? '9px' : direction === 'LEFT' ? '2px' : '4px',
                    }}
                  />
                  <div 
                    className="absolute bg-white rounded-full"
                    style={{
                      width: '3px',
                      height: '3px',
                      top: '3px',
                      right: direction === 'RIGHT' ? '2px' : direction === 'LEFT' ? '9px' : '4px',
                    }}
                  />
                </>
              )}
            </div>
          ))}

          {/* Food */}
          <div
            className="absolute bg-red-500 border border-red-300 animate-pulse"
            style={{
              left: food.x * CELL_SIZE + 2,
              top: food.y * CELL_SIZE + 2,
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              borderRadius: '50%',
              boxShadow: '0 0 6px #ff0000, inset 0 0 3px #ffffff',
            }}
          />

          {/* Overlay Messages */}
          {!gameStarted && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
              <div className="text-center p-4 mac-border-outset bg-mac-light-gray">
                <div className="text-lg mb-3 font-bold">🐍 CLASSIC SNAKE</div>
                <div className="text-sm mb-2">Eat the red dots to grow!</div>
                <div className="text-xs mb-4 text-mac-dark-gray">
                  Use ⬆️⬇️⬅️➡️ or WASD to move
                </div>
                <PixelButton onClick={startGame} variant="primary" className="mb-2">
                  🎮 Start Game
                </PixelButton>
                <div className="text-xs">Press SPACE to begin</div>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
              <div className="text-center p-4 mac-border-outset bg-mac-light-gray">
                <div className="text-lg mb-2 font-bold">💀 GAME OVER</div>
                <div className="text-sm mb-2">Final Score: <span className="font-bold">{score}</span></div>
                <div className="text-sm mb-2">Snake Length: <span className="font-bold">{snake.length}</span></div>
                {score === highScore && score > 0 && (
                  <div className="text-xs mb-3 p-2 bg-yellow-200 mac-border-inset">
                    🏆 NEW HIGH SCORE! 🏆
                  </div>
                )}
                <PixelButton onClick={resetGame} variant="primary" className="mb-2">
                  🔄 Play Again
                </PixelButton>
                <div className="text-xs">Your snake crashed!</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls Info */}
      <div className="mac-border-inset bg-mac-white p-3 mb-4 w-full">
        <div className="text-center text-xs space-y-1">
          <div className="font-bold mb-2">🎮 CONTROLS</div>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <div>🎯 Move: Arrow Keys</div>
              <div>🎯 Move: W A S D</div>
            </div>
            <div>
              <div>▶️ Start: SPACE</div>
              <div>🔄 Reset: Click button</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex space-x-3">
        <PixelButton onClick={resetGame} variant="secondary" className="font-bold">
          🆕 New Game
        </PixelButton>
        <PixelButton onClick={onClose} variant="default" className="font-bold">
          ❌ Close Snake
        </PixelButton>
      </div>
    </div>
  );
};

export { SnakeGame };