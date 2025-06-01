import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const initialGrid = [
  [0, 2, 6, 0, 3, 0, 4, 7, 0],
  [0, 0, 0, 2, 0, 0, 5, 1, 0],
  [7, 0, 0, 9, 0, 0, 0, 2, 0],
  [5, 0, 9, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 5, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 3, 0, 7],
  [0, 8, 0, 0, 0, 9, 0, 0, 1],
  [0, 3, 4, 0, 0, 6, 0, 0, 0],
  [0, 9, 5, 0, 7, 0, 6, 4, 0],
];

// Check if num can be placed at grid[row][col]
function isValid(grid, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

// Standard backtracking solver
function solveSudoku(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) {
              return true;
            }
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

const App = () => {
  const [grid, setGrid] = useState(initialGrid);

  const handleSolve = () => {
    const copy = grid.map(r => [...r]);
    if (solveSudoku(copy)) {
      setGrid(copy);
    } else {
      alert('No solution exists for this puzzle.');
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(9, 40px)',
    gridTemplateRows: 'repeat(9, 40px)',
    gap: '1px',
    margin: '20px 0'
  };

  const cellStyle = {
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    fontFamily: 'sans-serif',
    background: '#fff',
    border: '1px solid #333',
    boxSizing: 'border-box'
  };

  return (
    <div className="app" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Sudoku Solver</h1>
      <div style={gridStyle}>
        {grid.map((row, i) =>
          row.map((val, j) => (
            <div
              key={`${i}-${j}`}
              style={{
                ...cellStyle,
                borderTop: i % 3 === 0 ? '2px solid #000' : cellStyle.border,
                borderLeft: j % 3 === 0 ? '2px solid #000' : cellStyle.border,
                borderRight: j === 8 ? '2px solid #000' : '',
                borderBottom: i === 8 ? '2px solid #000' : ''
              }}
            >
              {val !== 0 ? val : ''}
            </div>
          ))
        )}
      </div>
      <button
        onClick={handleSolve}
        style={{
          padding: '10px 20px',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Solve Sudoku
      </button>
    </div>
  );
};

const container = document.getElementById('app');
createRoot(container).render(<App />);
