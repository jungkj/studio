'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface BreakoutGameProps {
  onClose?: () => void;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  hits: number;
  maxHits: number;
}

export const BreakoutGame: React.FC<BreakoutGameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'gameOver'>('ready');
  const [level, setLevel] = useState(1);
  
  // Game dimensions
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  
  // Paddle settings
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 10;
  const PADDLE_SPEED = 8;
  
  // Ball settings
  const BALL_RADIUS = 8;
  const INITIAL_BALL_SPEED = 5;
  
  // Brick settings
  const BRICK_WIDTH = 75;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 5;
  const BRICK_OFFSET_TOP = 60;
  const BRICK_OFFSET_LEFT = 35;
  const BRICK_ROWS = 5;
  const BRICK_COLS = 9;
  
  // Game objects refs
  const ballRef = useRef<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    dy: -INITIAL_BALL_SPEED,
    radius: BALL_RADIUS
  });
  
  const paddleRef = useRef<Paddle>({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
  });
  
  const bricksRef = useRef<Brick[]>([]);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  
  // Initialize bricks
  const initializeBricks = useCallback(() => {
    const bricks: Brick[] = [];
    const colors = ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#3498db'];
    
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const hits = BRICK_ROWS - r; // Top rows need more hits
        bricks.push({
          x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: colors[r],
          points: (BRICK_ROWS - r) * 10,
          hits: 0,
          maxHits: Math.min(hits, 3)
        });
      }
    }
    
    bricksRef.current = bricks;
  }, []);
  
  // Reset ball position
  const resetBall = () => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: -INITIAL_BALL_SPEED,
      radius: BALL_RADIUS
    };
    paddleRef.current.x = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = true;
      if (e.key === 'ArrowRight') keysRef.current.right = true;
      if (e.key === ' ' && gameState === 'ready') {
        setGameState('playing');
      }
      if (e.key === 'p' && (gameState === 'playing' || gameState === 'paused')) {
        setGameState(gameState === 'playing' ? 'paused' : 'playing');
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);
  
  // Initialize game
  useEffect(() => {
    initializeBricks();
    resetBall();
  }, [initializeBricks]);
  
  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Update paddle
    const paddle = paddleRef.current;
    if (keysRef.current.left && paddle.x > 0) {
      paddle.x -= PADDLE_SPEED;
    }
    if (keysRef.current.right && paddle.x < CANVAS_WIDTH - paddle.width) {
      paddle.x += PADDLE_SPEED;
    }
    
    // Update ball
    const ball = ballRef.current;
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Ball collision with walls
    if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }
    
    // Ball collision with paddle
    if (
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      ball.dy = -ball.dy;
      
      // Add spin based on where ball hits paddle
      const hitPos = (ball.x - paddle.x) / paddle.width;
      ball.dx = 8 * (hitPos - 0.5);
    }
    
    // Ball out of bounds
    if (ball.y - ball.radius > CANVAS_HEIGHT) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives === 0) {
          setGameState('gameOver');
        } else {
          resetBall();
          setGameState('ready');
        }
        return newLives;
      });
    }
    
    // Ball collision with bricks
    const bricks = bricksRef.current;
    let activeBricks = 0;
    
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (brick.hits >= brick.maxHits) continue;
      
      activeBricks++;
      
      if (
        ball.x > brick.x &&
        ball.x < brick.x + brick.width &&
        ball.y > brick.y &&
        ball.y < brick.y + brick.height
      ) {
        ball.dy = -ball.dy;
        brick.hits++;
        
        if (brick.hits >= brick.maxHits) {
          setScore(prev => prev + brick.points);
        }
      }
    }
    
    // Check win condition
    if (activeBricks === 0) {
      setLevel(prev => prev + 1);
      initializeBricks();
      resetBall();
      setGameState('ready');
      // Increase ball speed for next level
      ballRef.current.dx *= 1.1;
      ballRef.current.dy *= 1.1;
    }
    
    // Draw paddle
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ecf0f1';
    ctx.fill();
    ctx.closePath();
    
    // Draw bricks
    for (const brick of bricks) {
      if (brick.hits >= brick.maxHits) continue;
      
      const opacity = 1 - (brick.hits / brick.maxHits) * 0.7;
      ctx.fillStyle = brick.color;
      ctx.globalAlpha = opacity;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      ctx.globalAlpha = 1;
      
      // Brick border
      ctx.strokeStyle = '#34495e';
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    }
    
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, initializeBricks]);
  
  // Start/stop game loop
  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(gameLoop);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState, gameLoop]);
  
  return (
    <div className="h-full bg-[#2c3e50] flex flex-col items-center justify-center p-4">
      {/* Game Header */}
      <div className="mb-4 text-white text-center">
        <div className="flex gap-8 justify-center mb-2">
          <div>Score: <span className="font-mono font-bold">{score}</span></div>
          <div>Level: <span className="font-mono font-bold">{level}</span></div>
          <div>Lives: <span className="font-mono font-bold">{'❤️'.repeat(lives)}</span></div>
        </div>
      </div>
      
      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-600 rounded-lg shadow-lg"
        />
        
        {/* Game States Overlay */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Ready?</h2>
              <p className="text-lg">Press SPACE to start</p>
              <p className="text-sm mt-2 opacity-80">Use ← → arrows to move</p>
            </div>
          </div>
        )}
        
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Paused</h2>
              <p className="text-lg">Press P to resume</p>
            </div>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-white text-center">
              <h2 className="text-4xl font-bold mb-4">Game Over</h2>
              <p className="text-2xl mb-4">Final Score: {score}</p>
              <button
                onClick={() => {
                  setScore(0);
                  setLives(3);
                  setLevel(1);
                  initializeBricks();
                  resetBall();
                  setGameState('ready');
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-white text-center text-sm opacity-80">
        <p>← → Move paddle | SPACE Start | P Pause</p>
      </div>
    </div>
  );
};