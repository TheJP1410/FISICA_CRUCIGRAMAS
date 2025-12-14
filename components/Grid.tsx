import React, { useRef, useEffect } from 'react';
import { CellData } from '../types';

interface GridProps {
  grid: CellData[][];
  onCellChange: (row: number, col: number, value: string) => void;
  width: number;
  height: number;
}

export const Grid: React.FC<GridProps> = ({ grid, onCellChange, width, height }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Initialize refs array
  if (inputRefs.current.length !== height) {
    inputRefs.current = Array(height).fill(null).map(() => Array(width).fill(null));
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    // Arrow key navigation
    if (e.key === 'ArrowRight') {
      let nextCol = col + 1;
      while (nextCol < width && !grid[row][nextCol].isActive) nextCol++;
      if (nextCol < width) inputRefs.current[row][nextCol]?.focus();
    } else if (e.key === 'ArrowLeft') {
      let prevCol = col - 1;
      while (prevCol >= 0 && !grid[row][prevCol].isActive) prevCol--;
      if (prevCol >= 0) inputRefs.current[row][prevCol]?.focus();
    } else if (e.key === 'ArrowDown') {
      let nextRow = row + 1;
      while (nextRow < height && !grid[nextRow][col].isActive) nextRow++;
      if (nextRow < height) inputRefs.current[nextRow][col]?.focus();
    } else if (e.key === 'ArrowUp') {
      let prevRow = row - 1;
      while (prevRow >= 0 && !grid[prevRow][col].isActive) prevRow--;
      if (prevRow >= 0) inputRefs.current[prevRow][col]?.focus();
    } else if (e.key === 'Backspace') {
        if (grid[row][col].userChar === '') {
            // Move back if empty
             // Try moving left first if valid
            let prevCol = col - 1;
             while (prevCol >= 0 && !grid[row][prevCol].isActive) prevCol--;
             if (prevCol >= 0) {
                 inputRefs.current[row][prevCol]?.focus();
             }
        } else {
             onCellChange(row, col, '');
        }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    const val = e.target.value.slice(-1).toUpperCase(); // Take last char only
    
    // Only allow letters
    if (val && !/[A-ZÑ]/.test(val)) return;

    onCellChange(row, col, val);

    if (val) {
      // Auto-advance logic (prefer across, unless strictly a down word intersection logic is complex, simplify to right)
      // Simple heuristic: Try right, then down? No, just right for now is standard web behavior unless intelligent direction tracking is added.
      // Let's implement simple "skip to next active cell to the right"
       let nextCol = col + 1;
       if (nextCol < width && grid[row][nextCol].isActive) {
           inputRefs.current[row][nextCol]?.focus();
       }
    }
  };

  return (
    <div 
      className="grid gap-0.5 bg-slate-800 p-1 border-2 border-slate-800 rounded-lg shadow-xl mx-auto w-full max-w-[500px]"
      style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}
    >
      {grid.map((row, rIndex) => (
        <React.Fragment key={rIndex}>
          {row.map((cell, cIndex) => {
            if (!cell.isActive) {
              return <div key={`${rIndex}-${cIndex}`} className="bg-slate-900 aspect-square w-full" />;
            }

            let bgColor = "bg-white";
            let textColor = "text-slate-800";
            
            if (cell.isCorrect) {
                bgColor = "bg-green-100";
                textColor = "text-green-700";
            } else if (cell.isError) {
                bgColor = "bg-red-100";
                textColor = "text-red-700";
            }

            return (
              <div key={`${rIndex}-${cIndex}`} className="relative aspect-square w-full">
                {cell.number && (
                  <span className="absolute top-0.5 left-0.5 text-[0.55rem] md:text-xs font-bold text-slate-500 pointer-events-none select-none z-10">
                    {cell.number}
                  </span>
                )}
                <input
                  ref={el => inputRefs.current[rIndex][cIndex] = el}
                  type="text"
                  maxLength={1}
                  value={cell.userChar}
                  onChange={(e) => handleChange(e, rIndex, cIndex)}
                  onKeyDown={(e) => handleKeyDown(e, rIndex, cIndex)}
                  className={`w-full h-full text-center text-lg md:text-2xl font-bold uppercase outline-none focus:bg-blue-50 transition-colors ${bgColor} ${textColor}`}
                />
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
