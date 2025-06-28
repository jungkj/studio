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
        "w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16", // Responsive sizing, adjusted smaller
        "bg-mac-light-gray mac-border-outset active:mac-border-inset",
        "flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-sans", // Adjusted font size, removed bold
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
    <div className="p-1 font-sans text-mac-black flex flex-col items-center"> {/* Adjusted padding */}
      <h3 className="text-base mb-1">Tic-Tac-Toe</h3> {/* Adjusted font size, removed bold */}
      <div className="mb-2 text-xs">{status}</div> {/* Adjusted margin and font size */}
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 mb-2"> {/* Adjusted gap and margin */}
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