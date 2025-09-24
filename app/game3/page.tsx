'use client'

import React, { useState, useCallback } from 'react';

// 定義棋子的型別
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type PieceColor = 'white' | 'black';

// 定義棋盤的型別
type Board = (ChessPiece | null)[][];

// Chess piece class to handle movement and validation
class ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;

  constructor(type: PieceType, color: PieceColor) {
    this.type = type;
    this.color = color;
    this.hasMoved = false;
  }

  // Validate moves based on piece type
  isValidMove(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const target = board[toRow]?.[toCol];
    
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
      default:
        return false;
    }
  }

  validateKingMove(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
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

  validateQueenMove(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    return this.validateRookMove(board, fromRow, fromCol, toRow, toCol) ||
           this.validateBishopMove(board, fromRow, fromCol, toRow, toCol);
  }

  validateRookMove(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    if (fromRow !== toRow && fromCol !== toCol) return false;

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

  validateBishopMove(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;

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

  validateKnightMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  validatePawnMove(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const direction = this.color === 'white' ? -1 : 1;
    const startRow = this.color === 'white' ? 6 : 1;
    const target = board[toRow]?.[toCol];

    // Forward move
    if (fromCol === toCol) {
      // First move can go 2 squares
      if (fromRow === startRow &&
          toRow === fromRow + 2 * direction &&
          !board[fromRow + direction]?.[fromCol] &&
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
  const pieceMap: Record<string, string> = {
    'br': '♜', 'bn': '♞', 'bb': '♝', 'bq': '♛', 'bk': '♚', 'bp': '♟',
    'wr': '♖', 'wn': '♘', 'wb': '♗', 'wq': '♕', 'wk': '♔', 'wp': '♙'
  };

  const createInitialBoard = (): Board => [
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
    Array(8).fill(null).map(() => new ChessPiece('pawn', 'black')),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null).map(() => new ChessPiece('pawn', 'white')),
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

  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [isWhiteTurn, setIsWhiteTurn] = useState<boolean>(true);
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null);
  const [gameStatus, setGameStatus] = useState<string>("White's Turn");

  const isPieceOwner = (piece: ChessPiece | null) => {
    return piece && piece.color === (isWhiteTurn ? 'white' : 'black');
  };

  const checkGameEnd = (capturedPiece: ChessPiece) => {
    if (capturedPiece && capturedPiece.type === 'king') {
      const winner = capturedPiece.color === 'white' ? 'Black' : 'White';
      setGameStatus(`${winner} Wins!`);
      return true;
    }
    return false;
  };

  const movePiece = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    
    if (!piece) {
      return false;
    }

    if (!piece.isValidMove(newBoard, fromRow, fromCol, toRow, toCol)) {
      return false;
    }

    const capturedPiece = newBoard[toRow][toCol];

    if (piece.type === 'king' && Math.abs(fromCol - toCol) === 2) {
      const isKingSide = toCol > fromCol;
      const rookCol = isKingSide ? 7 : 0;
      const rookDestCol = isKingSide ? toCol - 1 : toCol + 1;
      
      const rook = newBoard[fromRow][rookCol];
      if (rook) {
        newBoard[fromRow][rookDestCol] = rook;
        newBoard[fromRow][rookCol] = null;
        rook.hasMoved = true;
      }
    }

    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
    piece.hasMoved = true;

    setBoard(newBoard);
    
    if (capturedPiece && checkGameEnd(capturedPiece)) {
      // Game has ended, don't switch turns
      return true; 
    }

    return true;
  }, [board, checkGameEnd]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    const clickedPiece = board[row][col];

    if (gameStatus.includes('Wins!')) {
      return;
    }

    if (!selectedPiece) {
      if (isPieceOwner(clickedPiece)) {
        setSelectedPiece({ row, col });
      }
      return;
    }

    if (selectedPiece.row === row && selectedPiece.col === col) {
      setSelectedPiece(null);
      return;
    }

    const success = movePiece(selectedPiece.row, selectedPiece.col, row, col);
    
    if (success) {
      if (!gameStatus.includes('Wins!')) {
        setIsWhiteTurn(!isWhiteTurn);
        setGameStatus(`${!isWhiteTurn ? 'White' : 'Black'}'s Turn`);
      }
    }

    setSelectedPiece(null);
  }, [board, selectedPiece, isWhiteTurn, gameStatus, movePiece, isPieceOwner]);

  const resetGame = () => {
    setBoard(createInitialBoard());
    setIsWhiteTurn(true);
    setSelectedPiece(null);
    setGameStatus("White's Turn");
  };

  return (
    <div className="flex flex-col items-center py-8 bg-gray-900 text-white min-h-screen">
      <h2 className="text-4xl font-bold mb-4 text-orange-400">西洋棋</h2>
      <div className="font-bold mb-4 text-xl">{gameStatus}</div>
      
      {/* Chessboard */}
      <div className="grid grid-cols-8 border-2 border-gray-400 w-96 h-96">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isWhiteSquare = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedPiece && 
              selectedPiece.row === rowIndex && 
              selectedPiece.col === colIndex;
            
            let squareClass = `w-12 h-12 flex items-center justify-center text-3xl cursor-pointer transition-colors ${
              isWhiteSquare ? 'bg-gray-100 text-black' : 'bg-gray-700 text-white'
            }`;
            
            if (isSelected) {
              squareClass += ' bg-yellow-300';
            }

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
      <div className="mt-8">
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
        >
          重新開始
        </button>
      </div>
    </div>
  );
};

export default ChessGame;