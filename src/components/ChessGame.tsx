'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';

type Square = string;
type Move = any;

interface ChessGameProps {
  onClose?: () => void;
}

// Chess piece unicode symbols
const PIECE_SYMBOLS = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

export const ChessGame: React.FC<ChessGameProps> = ({ onClose }) => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [gameStatus, setGameStatus] = useState<string>('');
  const [whiteTime, setWhiteTime] = useState(180); // 3 minutes in seconds
  const [blackTime, setBlackTime] = useState(180);
  const [isGameActive, setIsGameActive] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  // Initialize game on mount
  useEffect(() => {
    // Randomly assign player color
    const randomColor = Math.random() < 0.5 ? 'w' : 'b';
    setPlayerColor(randomColor);
    
    // Start new game
    const newGame = new Chess();
    setGame(newGame);
    setIsGameActive(true);
    
    // If player is black, make first move for white
    if (randomColor === 'b') {
      setTimeout(() => makeBotMove(newGame), 500);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isGameActive) return;

    const interval = setInterval(() => {
      const currentTurn = game.turn();
      if (currentTurn === 'w') {
        setWhiteTime(prev => {
          if (prev <= 0) {
            setGameStatus('Black wins on time!');
            setIsGameActive(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 0) {
            setGameStatus('White wins on time!');
            setIsGameActive(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameActive, game]);

  // Check game status
  useEffect(() => {
    if (game.isGameOver()) {
      setIsGameActive(false);
      if (game.isCheckmate()) {
        setGameStatus(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`);
      } else if (game.isDraw()) {
        setGameStatus('Draw!');
      } else if (game.isStalemate()) {
        setGameStatus('Stalemate!');
      }
    } else if (game.inCheck()) {
      setGameStatus('Check!');
    } else {
      setGameStatus('');
    }
  }, [game]);

  // Bot move logic (1200 rating simulation)
  const makeBotMove = useCallback((currentGame: Chess) => {
    if (!isGameActive || currentGame.turn() === playerColor) return;

    setTimeout(() => {
      const moves = currentGame.moves({ verbose: true });
      if (moves.length === 0) return;

      // Simple evaluation for 1200 rating bot
      let selectedMove: any;
      
      // 20% chance of making a random move (simulating mistakes)
      if (Math.random() < 0.2) {
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
      } else {
        // Basic move evaluation
        const evaluatedMoves = moves.map(move => {
          let score = 0;
          
          // Prioritize captures
          if (move.captured) {
            const captureValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9 };
            score += captureValues[move.captured] || 0;
          }
          
          // Prioritize center control
          if (['e4', 'e5', 'd4', 'd5'].includes(move.to)) {
            score += 0.5;
          }
          
          // Avoid moving the king early
          if (move.piece === 'k' && currentGame.history().length < 10) {
            score -= 1;
          }
          
          // Castle if possible
          if (move.flags.includes('k') || move.flags.includes('q')) {
            score += 2;
          }
          
          return { move, score };
        });
        
        // Sort by score and pick from top moves
        evaluatedMoves.sort((a, b) => b.score - a.score);
        const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
        selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)].move;
      }

      const newGame = new Chess(currentGame.fen());
      newGame.move(selectedMove);
      setGame(newGame);
      
      // Add increment (1 second)
      if (newGame.turn() === 'w') {
        setBlackTime(prev => prev + 1);
      }
      
      // Update move history
      setMoveHistory(prev => [...prev, selectedMove.san]);
    }, 500 + Math.random() * 1000); // Random delay 0.5-1.5s
  }, [playerColor, isGameActive]);

  // Handle square click
  const handleSquareClick = (square: string) => {
    if (!isGameActive || game.turn() !== playerColor) return;

    const piece = game.get(square as any);
    
    if (selectedSquare) {
      // Try to make move
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q' // Always promote to queen for simplicity
        });
        
        if (move) {
          // Add increment
          if (playerColor === 'w') {
            setWhiteTime(prev => prev + 1);
          } else {
            setBlackTime(prev => prev + 1);
          }
          
          // Update move history
          setMoveHistory(prev => [...prev, move.san]);
          
          // Clear selection
          setSelectedSquare(null);
          setPossibleMoves([]);
          
          // Make bot move
          makeBotMove(game);
        }
      } catch {
        // Invalid move, select new piece if it's player's
        if (piece && piece.color === playerColor) {
          setSelectedSquare(square);
          const moves = game.moves({ square: square as any, verbose: true });
          setPossibleMoves(moves.map(m => m.to));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      // Select piece
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as any, verbose: true });
        setPossibleMoves(moves.map(m => m.to));
      }
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get square color
  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    return isLight ? 'bg-cream-200' : 'bg-cream-600';
  };

  // Get square from row/col
  const getSquare = (row: number, col: number): string => {
    const file = String.fromCharCode(97 + col); // a-h
    const rank = String(8 - row); // 8-1
    return `${file}${rank}`;
  };

  // Render board
  const renderBoard = () => {
    const board = game.board();
    const isFlipped = playerColor === 'b';
    
    return (
      <div className="grid grid-cols-8 gap-0 border-4 border-mac-darker-gray">
        {board.map((row, rowIndex) => 
          row.map((piece, colIndex) => {
            const displayRow = isFlipped ? 7 - rowIndex : rowIndex;
            const displayCol = isFlipped ? 7 - colIndex : colIndex;
            const square = getSquare(rowIndex, colIndex);
            const isSelected = selectedSquare === square;
            const isPossibleMove = possibleMoves.includes(square);
            
            return (
              <div
                key={`${displayRow}-${displayCol}`}
                className={`
                  aspect-square flex items-center justify-center text-4xl cursor-pointer
                  ${getSquareColor(displayRow, displayCol)}
                  ${isSelected ? 'ring-4 ring-apple-blue' : ''}
                  ${isPossibleMove ? 'ring-2 ring-apple-green' : ''}
                  hover:opacity-80 transition-opacity
                `}
                onClick={() => handleSquareClick(square)}
              >
                {piece && (
                  <span className={piece.color === 'w' ? 'text-gray-100 drop-shadow-md' : 'text-gray-900 drop-shadow-md'}>
                    {PIECE_SYMBOLS[`${piece.color === 'w' ? piece.type.toUpperCase() : piece.type}`]}
                  </span>
                )}
                {isPossibleMove && !piece && (
                  <div className="w-3 h-3 bg-apple-green rounded-full opacity-50" />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full bg-mac-light-gray p-4">
      <div className="flex flex-col flex-1">
        {/* Timer and status */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className={`text-lg font-mono ${game.turn() === 'b' ? 'font-bold' : ''}`}>
            Black: {formatTime(blackTime)}
          </div>
          <div className="text-lg font-bold text-center">
            {gameStatus || (game.turn() === 'w' ? "White's turn" : "Black's turn")}
          </div>
          <div className={`text-lg font-mono ${game.turn() === 'w' ? 'font-bold' : ''}`}>
            White: {formatTime(whiteTime)}
          </div>
        </div>
        
        {/* Chess board */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[500px]">
            {renderBoard()}
          </div>
        </div>
        
        {/* Player indicator */}
        <div className="mt-4 text-center text-sm">
          You are playing as {playerColor === 'w' ? 'White' : 'Black'}
        </div>
      </div>
      
      {/* Move history sidebar */}
      <div className="w-48 ml-4 bg-white border-2 border-mac-darker-gray p-2">
        <h3 className="font-bold mb-2 text-center">Moves</h3>
        <div className="overflow-y-auto max-h-[400px] text-xs font-mono">
          {moveHistory.map((move, index) => (
            <span key={index}>
              {index % 2 === 0 && `${Math.floor(index / 2) + 1}. `}
              {move}{' '}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};