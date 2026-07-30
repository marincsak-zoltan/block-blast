import { GRID_SIZE, grid, currentPieces } from './state.js';

export function canPlacePiece(piece, startRow, startCol) {
  const pRows = piece.length;
  const pCols = piece[0].length;

  if (startRow + pRows > GRID_SIZE || startCol + pCols > GRID_SIZE) return false;
  if (startRow < 0 || startCol < 0) return false;

  for (let r = 0; r < pRows; r++) {
    for (let c = 0; c < pCols; c++) {
      if (piece[r][c] === 1 && grid[startRow + r][startCol + c] !== 0) {
        return false;
      }
    }
  }
  return true;
}

export function placePiece(piece, startRow, startCol) {
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[0].length; c++) {
      if (piece[r][c] === 1) {
        grid[startRow + r][startCol + c] = 1;
      }
    }
  }
}

export function clearFullLines() {
  let fullRows = [];
  let fullCols = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every(cell => cell !== 0)) fullRows.push(r);
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    let isFull = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] === 0) { isFull = false; break; }
    }
    if (isFull) fullCols.push(c);
  }

  return { clearedLinesCount: fullRows.length + fullCols.length, fullRows, fullCols };
}

export function getSimulatedLineClears(piece, startRow, startCol) {
  const tempGrid = grid.map(row => [...row]);
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[0].length; c++) {
      if (piece[r][c] === 1) tempGrid[startRow + r][startCol + c] = 1;
    }
  }

  let fullRows = [], fullCols = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    if (tempGrid[r].every(cell => cell !== 0)) fullRows.push(r);
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    let isFull = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (tempGrid[r][c] === 0) { isFull = false; break; }
    }
    if (isFull) fullCols.push(c);
  }

  return { fullRows, fullCols };
}

// Alap lerakási pont: 10 pont cellánként
export function countPieceBlocks(piece) {
  let count = 0;
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[0].length; c++) {
      if (piece[r][c] === 1) count++;
    }
  }
  return count * 10;
}

// Nagyobb pontok a sor/oszlop kiütésekért!
export function getBasicClearScore(clearedLinesCount) {
  switch (clearedLinesCount) {
    case 1: return 100;
    case 2: return 300;
    case 3: return 700;
    case 4: return 1500;
    default: return clearedLinesCount * 500;
  }
}

export function checkGameOver() {
  for (let piece of currentPieces) {
    if (piece !== null) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlacePiece(piece, r, c)) return false;
        }
      }
    }
  }
  return true;
}