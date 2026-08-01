import { GRID_SIZE, grid, currentPieces, gameState } from './state.js';
import { getAllAvailablePieces, getRandomWeightedPiece } from './pieces.js';

// Véletlenszerű Game Over üzenetek
export const GAME_OVER_MESSAGES = [
  "Róza te amatőr",
  "Előtte se volt annyira szuper",
  "Már el is ment?",
  "Mindig ott vagy ahol mi nem",
  "Ó ba*dmeg Sára",
  "Ez izgis volt",
  "Ezek alakzatok, Zoli",
  "Nena"
];

export function getRandomGameOverMessage() {
  const randomIndex = Math.floor(Math.random() * GAME_OVER_MESSAGES.length);
  return GAME_OVER_MESSAGES[randomIndex];
}

// Pixel koordináták átszámítása rácsindexre (Sor, Oszlop)
export function getBoardCellFromCoords(clientX, clientY, piece, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / rect.width;
  const yOffset = gameState.cellSize * 1.5;

  const canvasX = (clientX - rect.left) * scale;
  const canvasY = ((clientY - yOffset) - rect.top) * scale;

  const pRows = piece.length;
  const pCols = piece[0].length;

  const col = Math.floor((canvasX - (pCols * gameState.cellSize) / 2) / gameState.cellSize + 0.5);
  const row = Math.floor((canvasY - (pRows * gameState.cellSize) / 2) / gameState.cellSize + 0.5);

  return { row, col };
}

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

/**
 * ELEMZŐ ALGORTIMUS:
 * Megkeresi azokat az alakzatokat, amik beilleszthetők a jelenlegi pályára.
 */
function analyzeBoardForSmartPieces() {
  const allPieces = getAllAvailablePieces();
  const candidates = [];

  for (const piece of allPieces) {
    let blockCount = 0;
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[0].length; c++) {
        if (piece[r][c] === 1) blockCount++;
      }
    }

    let canPlace = false;
    let clearsLine = false;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlacePiece(piece, r, c)) {
          canPlace = true;
          const sim = getSimulatedLineClears(piece, r, c);
          if (sim.fullRows.length > 0 || sim.fullCols.length > 0) {
            clearsLine = true;
            break;
          }
        }
      }
      if (clearsLine) break;
    }

    if (canPlace) {
      candidates.push({ piece, size: blockCount, clearsLine });
    }
  }

  return candidates;
}

/**
 * OKOS GENERÁTOR:
 * Legyárt 3 elemet a kombó és a pálya állapota alapján.
 */
export function generateSmartNextPieces(comboCount) {
  const nextThree = [];
  
  // 0 kombónál marad a normál sorsolás
  if (comboCount === 0) {
    for (let i = 0; i < 3; i++) {
      nextThree.push(getRandomWeightedPiece());
    }
    return nextThree;
  }

  const candidates = analyzeBoardForSmartPieces();

  // Kiszűrjük a >2 méretű elemeket (NE adjon 1x1 vagy 2-es mini blokkokat!)
  const complexClearing = candidates.filter(c => c.size > 2 && c.clearsLine);
  const complexFitting = candidates.filter(c => c.size > 2);

  const smartChance = comboCount >= 2 ? 0.8 : 0.5;

  for (let i = 0; i < 3; i++) {
    // Ha van olyan összetett elem, ami SORT ÜRÍT ÉS bejön a szerencse:
    if (complexClearing.length > 0 && Math.random() < smartChance) {
      const picked = complexClearing[Math.floor(Math.random() * complexClearing.length)];
      nextThree.push(picked.piece);
    } 
    // Ha nincs sorürítő, de van olyan összetett elem, ami legalább BEFÉR:
    else if (complexFitting.length > 0 && Math.random() < 0.6) {
      const picked = complexFitting[Math.floor(Math.random() * complexFitting.length)];
      nextThree.push(picked.piece);
    } 
    // Egyébként marad a sima sorsolás
    else {
      nextThree.push(getRandomWeightedPiece());
    }
  }

  return nextThree;
}

// Ellenőrzi, hogy a pálya teljesen üres-e (Clear Board)
export function isBoardEmpty() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== 0) return false;
    }
  }
  return true;
}