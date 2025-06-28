import React, { useState, useEffect } from 'react';
import { PixelButton } from './PixelButton';
import { cn } from '@/lib/utils';

type Board = (string | null)[];

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const winner = calculateWinner(board);
    if (winner) {
      setStatus(`Winner: ${winner}`);
    } else if (board.every(Boolean)) {
      setStatus('Draw!');
    } else {
      setStatus(`Next player: ${xIsNext ? 'X' : 'O'}`);
    }
  }, [board, xIsNext]);

  const handleClick = (i: number) => {
    const squares = [...board];
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = xIsNext ? 'X' : 'O';
    setBoard(squares);
    setXIsNext(!xIsNext);
  };

  const renderSquare = (i: number) => (
    <button
      className={cn(
        "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20", // Responsive sizing
        "bg-mac-light-gray mac-border-outset active:mac-border-inset",
        "flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold",
        "text-mac-black cursor-pointer"
      )}
      onClick={() => handleClick(i)}
    >
      {board[i]}
    </button>
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="p-2 font-sans text-mac-black flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Tic-Tac-Toe</h3>
      <div className="mb-4 text-sm">{status}</div>
      <div className="grid grid-cols-3 grid-rows-3 gap-1 mb-4">
        {Array.from({ length: 9 }).map((_, i) => renderSquare(i))}
      </div>
      <PixelButton onClick={resetGame} variant="default">Reset Game</PixelButton>
    </div>
  );
};

function calculateWinner(squares: Board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export { TicTacToe };