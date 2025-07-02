import React, { useState, useEffect, useCallback } from 'react';
import { PixelButton } from './PixelButton';
import { cn } from '@/lib/utils';

interface SudokuGameProps {
  onClose: () => void;
}

type SudokuGrid = (number | null)[][];

// Pre-made Sudoku puzzles (easy to medium difficulty)
const SAMPLE_PUZZLES: SudokuGrid[] = [
  [
    [5, 3, null, null, 7, null, null, null, null],
    [6, null, null, 1, 9, 5, null, null, null],
    [null, 9, 8, null, null, null, null, 6, null],
    [8, null, null, null, 6, null, null, null, 3],
    [4, null, null, 8, null, 3, null, null, 1],
    [7, null, null, null, 2, null, null, null, 6],
    [null, 6, null, null, null, null, 2, 8, null],
    [null, null, null, 4, 1, 9, null, null, 5],
    [null, null, null, null, 8, null, null, 7, 9],
  ],
  [
    [null, null, null, 6, null, null, 4, null, null],
    [7, null, null, null, null, 3, 6, null, null],
    [null, null, null, null, 9, 1, null, 8, null],
    [null, null, null, null, null, null, null, null, null],
    [null, 5, null, 1, 8, null, null, null, 3],
    [null, null, null, 3, null, 6, null, 4, 5],
    [null, 4, null, 2, null, null, null, 6, null],
    [9, null, 3, null, null, null, null, null, null],
    [null, 2, null, null, null, null, 1, null, null],
  ],
  [
    [null, null, 1, null, null, null, null, null, null],
    [null, null, null, null, null, 3, null, 8, 5],
    [null, null, null, 1, null, 6, null, null, null],
    [null, null, null, null, null, 9, null, null, null],
    [null, null, null, null, 2, null, null, null, null],
    [null, null, null, 5, null, null, null, null, null],
    [null, null, null, null, null, null, 2, null, null],
    [5, 2, null, 6, null, null, null, null, null],
    [null, null, null, null, null, null, 5, null, null],
  ]
];

const SudokuGame: React.FC<SudokuGameProps> = ({ onClose }) => {
  const [grid, setGrid] = useState<SudokuGrid>(() => 
    Array(9).fill(null).map(() => Array(9).fill(null))
  );
  const [initialGrid, setInitialGrid] = useState<SudokuGrid>(() => 
    Array(9).fill(null).map(() => Array(9).fill(null))
  );
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [errors, setErrors] = useState<{row: number, col: number}[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Initialize a new puzzle
  const newPuzzle = useCallback(() => {
    const puzzle = SAMPLE_PUZZLES[Math.floor(Math.random() * SAMPLE_PUZZLES.length)];
    const newGrid = puzzle.map(row => [...row]);
    setGrid(newGrid);
    setInitialGrid(newGrid.map(row => [...row]));
    setGameComplete(false);
    setErrors([]);
    setHintsUsed(0);
    setSelectedCell(null);
  }, []);

  // Initialize first puzzle on component mount
  useEffect(() => {
    newPuzzle();
  }, [newPuzzle]);

  // Check if a number is valid in a specific position
  const isValidMove = useCallback((grid: SudokuGrid, row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (x !== col && grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (x !== row && grid[x][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const currentRow = boxRow + i;
        const currentCol = boxCol + j;
        if (currentRow !== row && currentCol !== col && grid[currentRow][currentCol] === num) {
          return false;
        }
      }
    }

    return true;
  }, []);

  // Check if puzzle is complete
  const checkComplete = useCallback((grid: SudokuGrid): boolean => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === null) return false;
      }
    }
    return true;
  }, []);

  // Find all errors in current grid
  const findErrors = useCallback((grid: SudokuGrid): {row: number, col: number}[] => {
    const errorCells: {row: number, col: number}[] = [];
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const num = grid[row][col];
        if (num !== null && !isValidMove(grid, row, col, num)) {
          errorCells.push({ row, col });
        }
      }
    }
    
    return errorCells;
  }, [isValidMove]);

  // Handle cell input
  const handleCellInput = useCallback((row: number, col: number, value: string) => {
    if (initialGrid[row][col] !== null) return; // Can't modify initial numbers
    
    const num = value === '' ? null : parseInt(value);
    if (num !== null && (num < 1 || num > 9)) return; // Invalid number

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    
    setGrid(newGrid);
    
    // Check for errors
    const newErrors = findErrors(newGrid);
    setErrors(newErrors);
    
    // Check if complete
    if (checkComplete(newGrid) && newErrors.length === 0) {
      setGameComplete(true);
    }
  }, [grid, initialGrid, findErrors, checkComplete]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      
      const { row, col } = selectedCell;
      
      if (e.key >= '1' && e.key <= '9') {
        handleCellInput(row, col, e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleCellInput(row, col, '');
      } else if (e.key === 'ArrowUp' && row > 0) {
        setSelectedCell({ row: row - 1, col });
      } else if (e.key === 'ArrowDown' && row < 8) {
        setSelectedCell({ row: row + 1, col });
      } else if (e.key === 'ArrowLeft' && col > 0) {
        setSelectedCell({ row, col: col - 1 });
      } else if (e.key === 'ArrowRight' && col < 8) {
        setSelectedCell({ row, col: col + 1 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, handleCellInput]);

  // Solve using backtracking (for hints)
  const solveSudoku = useCallback((grid: SudokuGrid): SudokuGrid | null => {
    const newGrid = grid.map(row => [...row]);
    
    const solve = (): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (newGrid[row][col] === null) {
            for (let num = 1; num <= 9; num++) {
              if (isValidMove(newGrid, row, col, num)) {
                newGrid[row][col] = num;
                if (solve()) return true;
                newGrid[row][col] = null;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    
    return solve() ? newGrid : null;
  }, [isValidMove]);

  // Give hint
  const giveHint = useCallback(() => {
    if (gameComplete) return;
    
    const solution = solveSudoku(grid);
    if (!solution) return;
    
    // Find empty cells
    const emptyCells: {row: number, col: number}[] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null && initialGrid[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) return;
    
    // Pick random empty cell and fill it
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = grid.map(r => [...r]);
    newGrid[randomCell.row][randomCell.col] = solution[randomCell.row][randomCell.col];
    
    setGrid(newGrid);
    setHintsUsed(prev => prev + 1);
    
    // Check if complete
    if (checkComplete(newGrid)) {
      setGameComplete(true);
    }
  }, [grid, initialGrid, solveSudoku, gameComplete, checkComplete]);

  return (
    <div className="p-3 font-sans text-mac-black flex flex-col items-center h-full">
      <div className="flex items-center justify-between w-full mb-3">
        <h2 className="text-base font-bold">Sudoku</h2>
        <div className="text-xs text-right">
          <div>Hints Used: {hintsUsed}</div>
          <div>Errors: {errors.length}</div>
        </div>
      </div>

      {/* Sudoku Grid */}
      <div className="mac-border-outset bg-mac-light-gray p-2 mb-3">
        <div className="grid grid-cols-9 gap-0 bg-mac-dark-gray" style={{ width: '270px', height: '270px' }}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isInitial = initialGrid[rowIndex][colIndex] !== null;
              const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
              const hasError = errors.some(e => e.row === rowIndex && e.col === colIndex);
              const isInSameRow = selectedCell?.row === rowIndex;
              const isInSameCol = selectedCell?.col === colIndex;
              const isInSameBox = selectedCell && 
                Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) &&
                Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3);

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "w-7 h-7 border border-mac-dark-gray flex items-center justify-center text-xs cursor-pointer",
                    isInitial ? "bg-mac-medium-gray font-bold" : "bg-mac-white",
                    isSelected && "bg-blue-200",
                    (isInSameRow || isInSameCol || isInSameBox) && !isSelected && "bg-blue-50",
                    hasError && "bg-red-200",
                    // Thicker borders for 3x3 boxes
                    rowIndex % 3 === 0 && "border-t-2 border-t-mac-black",
                    colIndex % 3 === 0 && "border-l-2 border-l-mac-black",
                    rowIndex === 8 && "border-b-2 border-b-mac-black",
                    colIndex === 8 && "border-r-2 border-r-mac-black"
                  )}
                  onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                >
                  {cell || ''}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Game Complete Message */}
      {gameComplete && (
        <div className="text-center mb-3 p-2 bg-green-100 mac-border-outset">
          <div className="text-sm font-bold text-green-800">🎉 Congratulations!</div>
          <div className="text-xs text-green-700">Puzzle completed with {hintsUsed} hints!</div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-mac-dark-gray text-center mb-3">
        <div>🎯 Click cell and type 1-9, or use arrow keys to navigate</div>
        <div>📋 Fill all cells with numbers 1-9 (no repeats in rows, columns, or 3×3 boxes)</div>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <PixelButton
            key={num}
            variant="secondary"
            className="w-8 h-8 text-xs"
            onClick={() => {
              if (selectedCell) {
                handleCellInput(selectedCell.row, selectedCell.col, num.toString());
              }
            }}
          >
            {num}
          </PixelButton>
        ))}
        <PixelButton
          variant="secondary"
          className="w-8 h-8 text-xs"
          onClick={() => {
            if (selectedCell) {
              handleCellInput(selectedCell.row, selectedCell.col, '');
            }
          }}
        >
          ×
        </PixelButton>
      </div>

      {/* Bottom Buttons */}
      <div className="flex space-x-2">
        <PixelButton onClick={giveHint} variant="secondary" disabled={gameComplete}>
          Hint
        </PixelButton>
        <PixelButton onClick={newPuzzle} variant="secondary">
          New Puzzle
        </PixelButton>
        <PixelButton onClick={onClose} variant="default">
          Close Sudoku
        </PixelButton>
      </div>
    </div>
  );
};

export { SudokuGame };