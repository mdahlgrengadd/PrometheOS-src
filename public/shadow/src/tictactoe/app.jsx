import React, { useState } from "react";
import ReactDOM from 'react-dom';
import "./styles.css"


function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameStatus, setGameStatus] = useState('playing');

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (squares) => {
    for (let line of winningLines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || gameStatus !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setGameStatus(`${winner} wins!`);
    } else if (newBoard.every(square => square !== null)) {
      setGameStatus("It's a draw!");
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus('playing');
  };

  const renderSquare = (index) => {
    return (
      <button
        key={index}
        className="square"
        onClick={() => handleClick(index)}
      >
        {board[index]}
      </button>
    );
  };

  return (
    <div className="game">
      <style jsx>{`
        
      `}</style>

      <h1 className="game-title">Tic Tac Toe</h1>
      
      <div className="game-info">
        <div className="status">
          {gameStatus === 'playing' 
            ? `Next player: ${isXNext ? 'X' : 'O'}` 
            : gameStatus
          }
        </div>
      </div>

      <div className="game-board">
        {Array(9).fill(null).map((_, index) => renderSquare(index))}
      </div>

      <button className="reset-button" onClick={resetGame}>
        New Game
      </button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));