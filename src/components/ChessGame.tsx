'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';

type Square = string;
type Move = any;

interface ChessGameProps {
  onClose?: () => void;
}

// Chess piece unicode symbols - all filled for better visibility
const PIECE_SYMBOLS = {
  'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟',  // White pieces
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'   // Black pieces (same symbols)
};

interface DragState {
  isDragging: boolean;
  piece: any | null;
  fromSquare: string | null;
  currentX: number;
  currentY: number;
}

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
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  
  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    piece: null,
    fromSquare: null,
    currentX: 0,
    currentY: 0
  });
  
  const boardRef = useRef<HTMLDivElement>(null);

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
      let selectedMove: Move;
      
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
      const result = newGame.move(selectedMove);
      if (result) {
        setGame(newGame);
        setLastMove({ from: result.from, to: result.to });
        
        // Add increment (1 second)
        if (newGame.turn() === 'w') {
          setBlackTime(prev => prev + 1);
        }
        
        // Update move history
        setMoveHistory(prev => [...prev, result.san]);
      }
    }, 500 + Math.random() * 1000); // Random delay 0.5-1.5s
  }, [playerColor, isGameActive]);

  // Handle mouse down on piece
  const handleMouseDown = (e: React.MouseEvent, square: string) => {
    if (!isGameActive || game.turn() !== playerColor) return;
    
    const piece = game.get(square as any);
    if (!piece || piece.color !== playerColor) return;
    
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate possible moves
    const moves = game.moves({ square: square as any, verbose: true });
    setPossibleMoves(moves.map(m => m.to));
    
    setDragState({
      isDragging: true,
      piece,
      fromSquare: square,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top
    });
    
    e.preventDefault();
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !boardRef.current) return;
      
      const rect = boardRef.current.getBoundingClientRect();
      setDragState(prev => ({
        ...prev,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top
      }));
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!dragState.isDragging || !boardRef.current || !dragState.fromSquare) {
        setDragState({
          isDragging: false,
          piece: null,
          fromSquare: null,
          currentX: 0,
          currentY: 0
        });
        setPossibleMoves([]);
        return;
      }
      
      const rect = boardRef.current.getBoundingClientRect();
      const squareSize = rect.width / 8;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate which square was dropped on
      let col = Math.floor(x / squareSize);
      let row = Math.floor(y / squareSize);
      
      // Clamp to board bounds
      col = Math.max(0, Math.min(7, col));
      row = Math.max(0, Math.min(7, row));
      
      // Flip coordinates if playing as black
      if (playerColor === 'b') {
        col = 7 - col;
        row = 7 - row;
      }
      
      const toSquare = getSquare(row, col);
      
      // Try to make the move
      try {
        const move = game.move({
          from: dragState.fromSquare,
          to: toSquare,
          promotion: 'q' // Always promote to queen for simplicity
        });
        
        if (move) {
          // Add increment
          if (playerColor === 'w') {
            setWhiteTime(prev => prev + 1);
          } else {
            setBlackTime(prev => prev + 1);
          }
          
          setLastMove({ from: move.from, to: move.to });
          setMoveHistory(prev => [...prev, move.san]);
          
          // Make bot move
          makeBotMove(game);
        }
      } catch (err) {
        // Invalid move - piece snaps back
      }
      
      // Reset drag state
      setDragState({
        isDragging: false,
        piece: null,
        fromSquare: null,
        currentX: 0,
        currentY: 0
      });
      setPossibleMoves([]);
    };
    
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, dragState.fromSquare, game, playerColor, makeBotMove]);

  // Handle square click (for non-drag moves)
  const handleSquareClick = (square: string) => {
    if (!isGameActive || game.turn() !== playerColor || dragState.isDragging) return;

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
          
          setLastMove({ from: move.from, to: move.to });
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

  // Get square color - using chess.com-like colors
  const getSquareColor = (row: number, col: number, square: string) => {
    const isLight = (row + col) % 2 === 0;
    const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
    const isSelected = selectedSquare === square;
    const isPossibleMove = possibleMoves.includes(square);
    
    let baseColor = isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';
    
    if (isLastMoveSquare) {
      baseColor = isLight ? 'bg-[#ced26b]' : 'bg-[#a9a23a]';
    }
    
    if (isSelected) {
      baseColor = isLight ? 'bg-[#f6f669]' : 'bg-[#baca2b]';
    }
    
    return baseColor;
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
      <div 
        ref={boardRef}
        className="relative grid grid-cols-8 gap-0 border-4 border-mac-darker-gray shadow-md select-none"
        style={{ cursor: dragState.isDragging ? 'grabbing' : 'default' }}
      >
        {board.map((row, rowIndex) => 
          row.map((piece, colIndex) => {
            const displayRow = isFlipped ? 7 - rowIndex : rowIndex;
            const displayCol = isFlipped ? 7 - colIndex : colIndex;
            const square = getSquare(rowIndex, colIndex);
            const isPossibleMove = possibleMoves.includes(square);
            const isPossibleCapture = isPossibleMove && piece;
            const isDragOrigin = dragState.fromSquare === square;
            
            return (
              <div
                key={`${displayRow}-${displayCol}`}
                className={`
                  aspect-square flex items-center justify-center relative
                  ${getSquareColor(displayRow, displayCol, square)}
                  ${!dragState.isDragging ? 'hover:brightness-110' : ''}
                  transition-all duration-75
                `}
                onClick={() => handleSquareClick(square)}
                onMouseDown={(e) => handleMouseDown(e, square)}
              >
                {/* File labels */}
                {rowIndex === 7 && (
                  <div className="absolute bottom-0.5 right-1 text-xs font-bold opacity-60 pointer-events-none"
                    style={{ color: (displayRow + displayCol) % 2 === 0 ? '#b58863' : '#f0d9b5' }}>
                    {String.fromCharCode(97 + colIndex)}
                  </div>
                )}
                
                {/* Rank labels */}
                {colIndex === 0 && (
                  <div className="absolute top-0.5 left-1 text-xs font-bold opacity-60 pointer-events-none"
                    style={{ color: (displayRow + displayCol) % 2 === 0 ? '#b58863' : '#f0d9b5' }}>
                    {8 - rowIndex}
                  </div>
                )}
                
                {/* Piece */}
                {piece && !isDragOrigin && (
                  <span 
                    className={`text-6xl leading-none`}
                    style={{ 
                      cursor: piece.color === playerColor && game.turn() === playerColor ? 'grab' : 'default',
                      userSelect: 'none',
                      color: piece.color === 'w' ? '#FFFFFF' : '#000000',
                      textShadow: piece.color === 'w' 
                        ? '0 0 3px #000, 1px 1px 2px rgba(0,0,0,0.8)' 
                        : '0 0 2px #fff, 1px 1px 1px rgba(255,255,255,0.3)',
                      WebkitTextStroke: piece.color === 'w' ? '1px black' : '0.5px white'
                    }}
                  >
                    {PIECE_SYMBOLS[`${piece.color === 'w' ? piece.type.toUpperCase() : piece.type}`]}
                  </span>
                )}
                
                {/* Possible move indicator */}
                {isPossibleMove && !piece && (
                  <div className="absolute w-1/3 h-1/3 bg-black opacity-10 rounded-full" />
                )}
                
                {/* Possible capture indicator */}
                {isPossibleCapture && (
                  <div className="absolute inset-0 border-4 border-black opacity-10 rounded-full" />
                )}
              </div>
            );
          })
        )}
        
        {/* Dragged piece */}
        {dragState.isDragging && dragState.piece && (
          <div
            className="absolute pointer-events-none z-50"
            style={{
              left: dragState.currentX - 40,
              top: dragState.currentY - 40,
              width: 80,
              height: 80
            }}
          >
            <span 
              className={`text-6xl leading-none`}
              style={{ 
                color: dragState.piece.color === 'w' ? '#FFFFFF' : '#000000',
                textShadow: dragState.piece.color === 'w' 
                  ? '0 0 3px #000, 2px 2px 4px rgba(0,0,0,0.8)' 
                  : '0 0 2px #fff, 2px 2px 3px rgba(255,255,255,0.3)',
                WebkitTextStroke: dragState.piece.color === 'w' ? '1px black' : '0.5px white'
              }}
            >
              {PIECE_SYMBOLS[`${dragState.piece.color === 'w' ? dragState.piece.type.toUpperCase() : dragState.piece.type}`]}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full bg-mac-medium-gray p-4">
      <div className="flex flex-col flex-1">
        {/* Timer and status */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className={`px-3 py-1 border-2 ${game.turn() === 'b' && isGameActive ? 'border-black bg-mac-light-gray' : 'border-mac-darker-gray bg-white'}`}>
            <div className="text-xs">Black</div>
            <div className="text-xl font-mono font-bold">{formatTime(blackTime)}</div>
          </div>
          <div className="text-lg font-bold text-center">
            {gameStatus || (game.turn() === 'w' ? "White to move" : "Black to move")}
          </div>
          <div className={`px-3 py-1 border-2 ${game.turn() === 'w' && isGameActive ? 'border-black bg-mac-light-gray' : 'border-mac-darker-gray bg-white'}`}>
            <div className="text-xs">White</div>
            <div className="text-xl font-mono font-bold">{formatTime(whiteTime)}</div>
          </div>
        </div>
        
        {/* Chess board */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[600px]">
            {renderBoard()}
          </div>
        </div>
        
        {/* Player indicator */}
        <div className="mt-4 text-center text-sm">
          You are playing as <strong>{playerColor === 'w' ? 'White' : 'Black'}</strong>
        </div>
      </div>
      
      {/* Move history sidebar */}
      <div className="w-56 ml-4 bg-white border-2 border-mac-darker-gray p-4">
        <h3 className="font-bold mb-3 text-center">Moves</h3>
        <div className="overflow-y-auto max-h-[450px] bg-mac-light-gray border border-mac-darker-gray p-2">
          <div className="grid grid-cols-2 gap-x-2 text-sm font-mono">
            {moveHistory.map((move, index) => (
              <div key={index} className={`py-1 px-2`}>
                {index % 2 === 0 && <span className="opacity-60">{Math.floor(index / 2) + 1}.</span>}
                {' '}{move}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};