import React, { useState, useCallback } from 'react';

// Chess piece class to handle movement and validation
class ChessPiece {
  constructor(type, color) {
    this.type = type;
    this.color = color;
    this.hasMoved = false;
  }

  // Validate moves based on piece type
  isValidMove(board, fromRow, fromCol, toRow, toCol) {
    const target = board[toRow][toCol];
    
    // Can't capture own pieces
    if (target && target.color === this.color) return false;

    switch(this.type) {
      case 'king':
        return this.validateKingMove(board, fromRow, fromCol, toRow, toCol);
      case 'queen':
        return this.validateQueenMove(board, fromRow, fromCol, toRow, toCol);
      case 'rook':
        return this.validateRookMove(board, fromRow, fromCol, toRow, toCol);
      case 'bishop':
        return this.validateBishopMove(board, fromRow, fromCol, toRow, toCol);
      case 'knight':
        return this.validateKnightMove(fromRow, fromCol, toRow, toCol);
      case 'pawn':
        return this.validatePawnMove(board, fromRow, fromCol, toRow, toCol);
    }
  }

  validateKingMove(board, fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    // Normal move: one square in any direction
    if (rowDiff <= 1 && colDiff <= 1) return true;

    // Castling
    if (rowDiff === 0 && colDiff === 2 && !this.hasMoved) {
      const isKingSide = toCol > fromCol;
      const rookCol = isKingSide ? 7 : 0;
      const rook = board[fromRow][rookCol];

      if (rook && rook.type === 'rook' && !rook.hasMoved) {
        // Check path is clear
        const step = isKingSide ? 1 : -1;
        for (let col = fromCol + step; col !== rookCol; col += step) {
          if (board[fromRow][col]) return false;
        }
        return true;
      }
    }

    return false;
  }

  validateQueenMove(board, fromRow, fromCol, toRow, toCol) {
    return this.validateRookMove(board, fromRow, fromCol, toRow, toCol) || 
           this.validateBishopMove(board, fromRow, fromCol, toRow, toCol);
  }

  validateRookMove(board, fromRow, fromCol, toRow, toCol) {
    // Must be on same row or same column
    if (fromRow !== toRow && fromCol !== toCol) return false;

    // Check path is clear
    const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);

    let checkRow = fromRow + rowStep;
    let checkCol = fromCol + colStep;

    while (checkRow !== toRow || checkCol !== toCol) {
      if (board[checkRow][checkCol]) return false;
      checkRow += rowStep;
      checkCol += colStep;
    }

    return true;
  }

  validateBishopMove(board, fromRow, fromCol, toRow, toCol) {
    // Must move diagonally
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;

    // Check path is clear
    const rowStep = toRow > fromRow ? 1 : -1;
    const colStep = toCol > fromCol ? 1 : -1;

    let checkRow = fromRow + rowStep;
    let checkCol = fromCol + colStep;

    while (checkRow !== toRow && checkCol !== toCol) {
      if (board[checkRow][checkCol]) return false;
      checkRow += rowStep;
      checkCol += colStep;
    }

    return true;
  }

  validateKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  validatePawnMove(board, fromRow, fromCol, toRow, toCol) {
    const direction = this.color === 'white' ? -1 : 1;
    const startRow = this.color === 'white' ? 6 : 1;
    const target = board[toRow][toCol];

    // Forward move
    if (fromCol === toCol) {
      // First move can go 2 squares
      if (fromRow === startRow && 
          toRow === fromRow + 2 * direction && 
          !board[fromRow + direction][fromCol] && 
          !target) {
        return true;
      }
      
      // Regular forward move
      return toRow === fromRow + direction && !target;
    }

    // Diagonal capture
    if (Math.abs(fromCol - toCol) === 1 && 
        toRow === fromRow + direction && 
        target && target.color !== this.color) {
      return true;
    }

    return false;
  }
}

const ChessGame = () => {
  // Unicode piece symbols
  const pieceMap = {
    'br': '♜', 'bn': '♞', 'bb': '♝', 'bq': '♛', 'bk': '♚', 'bp': '♟',
    'wr': '♖', 'wn': '♘', 'wb': '♗', 'wq': '♕', 'wk': '♔', 'wp': '♙'
  };

  // Initial board setup with full piece objects
  const createInitialBoard = () => [
    [
      new ChessPiece('rook', 'black'), 
      new ChessPiece('knight', 'black'), 
      new ChessPiece('bishop', 'black'), 
      new ChessPiece('queen', 'black'), 
      new ChessPiece('king', 'black'), 
      new ChessPiece('bishop', 'black'), 
      new ChessPiece('knight', 'black'), 
      new ChessPiece('rook', 'black')
    ],
    Array(8).fill().map(() => new ChessPiece('pawn', 'black')),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill().map(() => new ChessPiece('pawn', 'white')),
    [
      new ChessPiece('rook', 'white'), 
      new ChessPiece('knight', 'white'), 
      new ChessPiece('bishop', 'white'), 
      new ChessPiece('queen', 'white'), 
      new ChessPiece('king', 'white'), 
      new ChessPiece('bishop', 'white'), 
      new ChessPiece('knight', 'white'), 
      new ChessPiece('rook', 'white')
    ]
  ];

  // Game state
  const [board, setBoard] = useState(() => createInitialBoard());
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [gameStatus, setGameStatus] = useState("White's Turn");

  // Check if piece belongs to current player
  const isPieceOwner = (piece) => {
    return piece && piece.color === (isWhiteTurn ? 'white' : 'black');
  };

  // Check for game end
  const checkGameEnd = (capturedPiece) => {
    if (capturedPiece && capturedPiece.type === 'king') {
      const winner = capturedPiece.color === 'white' ? 'Black' : 'White';
      setGameStatus(`${winner} Wins!`);
      return true;
    }
    return false;
  };

  // Move piece on the board
  const movePiece = useCallback((fromRow, fromCol, toRow, toCol) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    
    // Validate the move
    if (!piece || !piece.isValidMove(newBoard, fromRow, fromCol, toRow, toCol)) {
      return false;
    }

    // Capture check
    const capturedPiece = newBoard[toRow][toCol];

    // Special move: Castling
    if (piece.type === 'king' && Math.abs(fromCol - toCol) === 2) {
      const isKingSide = toCol > fromCol;
      const rookCol = isKingSide ? 7 : 0;
      const rookDestCol = isKingSide ? toCol - 1 : toCol + 1;
      
      const rook = newBoard[fromRow][rookCol];
      newBoard[fromRow][rookDestCol] = rook;
      newBoard[fromRow][rookCol] = null;
      rook.hasMoved = true;
    }

    // Perform the move
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
    piece.hasMoved = true;

    setBoard(newBoard);

    // Check for game end
    if (capturedPiece && checkGameEnd(capturedPiece)) {
      return false;
    }

    return true;
  }, [board]);

  // Handle square click
  const handleSquareClick = useCallback((row, col) => {
    const clickedPiece = board[row][col];

    // Check if game has ended
    if (gameStatus.includes('Wins!')) {
      return;
    }

    // If no piece is selected
    if (!selectedPiece) {
      // Select a piece if it belongs to the current player
      if (isPieceOwner(clickedPiece)) {
        setSelectedPiece({ row, col });
      }
      return;
    }

    // If clicking the same piece, deselect
    if (selectedPiece.row === row && selectedPiece.col === col) {
      setSelectedPiece(null);
      return;
    }

    // Attempt to move the selected piece
    const success = movePiece(selectedPiece.row, selectedPiece.col, row, col);
    
    if (success) {
      // Switch turns
      setIsWhiteTurn(!isWhiteTurn);
      setGameStatus(`${!isWhiteTurn ? 'White' : 'Black'}'s Turn`);
    }

    // Clear selection
    setSelectedPiece(null);
  }, [board, selectedPiece, isWhiteTurn, gameStatus, movePiece]);

  // Reset game
  const resetGame = () => {
    setBoard(createInitialBoard());
    setIsWhiteTurn(true);
    setSelectedPiece(null);
    setGameStatus("White's Turn");
  };

  return (
    <div className="flex flex-col items-center py-8">
      <h2 className="text-2xl font-bold mb-4">Chess Game</h2>
      <div className="font-bold mb-4 text-lg">{gameStatus}</div>
      
      {/* Chessboard */}
      <div className="grid grid-cols-8 border-2 border-gray-800 w-96 h-96">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isWhiteSquare = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedPiece && 
              selectedPiece.row === rowIndex && 
              selectedPiece.col === colIndex;
            
            let squareClass = `w-12 h-12 flex items-center justify-center text-3xl cursor-pointer transition-colors ${
              isWhiteSquare ? 'bg-white' : 'bg-gray-300'
            }`;
            
            if (isSelected) {
              squareClass += ' bg-yellow-300';
            }

            // Get piece symbol
            let pieceSymbol = '';
            if (piece) {
              const pieceKey = `${piece.color[0]}${piece.type[0]}`;
              pieceSymbol = pieceMap[pieceKey] || '';
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={squareClass}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              >
                {pieceSymbol}
              </div>
            );
          })
        )}
      </div>
      
      {/* Controls */}
      <div className="mt-4">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default ChessGame;