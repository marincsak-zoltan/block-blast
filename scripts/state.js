import { PIECE_CATEGORIES, SMART_COMBOS } from './pieces.js';
import { canPlacePiece } from './logic.js';

export const GRID_SIZE = 8;
export let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

export let gameState = {
  score: 0,
  highScore: parseInt(localStorage.getItem('blockBlast_highScore')) || 0, // Betöltés LocalStorage-ból
  comboCount: 0,
  comboMovesLeft: 3,
  isStarted: false,
  isGameOver: false,
  isAnimating: false,
  cellSize: 0
};

export let dragInfo = {
  isDragging: false,
  index: null,
  x: 0,
  y: 0
};

export let currentPieces = [null, null, null];

// Vízszintes sorok számlálója a 3-as szabályhoz
let horizLinesCount = 0;

// --- SEGÉDFÜGGVÉNY: Megszámolja, hány cella van elfoglalva a rácson ---
function getOccupiedCellCount() {
  let count = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== 0) count++;
    }
  }
  return count;
}

// Sorsoló logika
function getRandomPiece() {
  let pool = [
    ...PIECE_CATEGORIES.BASIC,
    ...PIECE_CATEGORIES.RARE
  ];

  // Egyenes vonal sorsolása a 3-as szabály figyelembevételével
  if (horizLinesCount >= 3) {
    // KÖTELEZŐ FÜGGŐLEGES!
    pool.push(...PIECE_CATEGORIES.LINES.VERT);
  } else {
    // Szabadon választható
    const pickHoriz = Math.random() < 0.5;
    if (pickHoriz) {
      pool.push(...PIECE_CATEGORIES.LINES.HORIZ);
    } else {
      pool.push(...PIECE_CATEGORIES.LINES.VERT);
    }
  }

  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of pool) {
    if (random < item.weight) {
      // Ha vízszintes sort sorsoltunk, növeljük a számlálót, különben nullázzuk
      if (PIECE_CATEGORIES.LINES.HORIZ.some(h => h.piece === item.piece)) {
        horizLinesCount++;
      } else if (PIECE_CATEGORIES.LINES.VERT.some(v => v.piece === item.piece)) {
        horizLinesCount = 0;
      }
      return item.piece;
    }
    random -= item.weight;
  }

  return PIECE_CATEGORIES.BASIC[0].piece;
}

// Ellenőrzi, hogy a 3 elem közül LEGALÁBB EGYET le lehet-e tenni az érvényes táblára
function isAtLeastOnePlayable(pieces) {
  for (const piece of pieces) {
    if (!piece) continue;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlacePiece(piece, r, c)) {
          return true;
        }
      }
    }
  }
  return false;
}

// --- SEGÉDFÜGGVÉNY: Keres egy olyan alakzatot, ami AZONNAL sort/oszlopot törölne ---
function findLineClearingPiece() {
  // Összegyűjtjük az összes elérhető alakzatot
  const allShapes = [
    ...PIECE_CATEGORIES.BASIC.map(p => p.piece),
    ...PIECE_CATEGORIES.LINES.HORIZ.map(p => p.piece),
    ...PIECE_CATEGORIES.LINES.VERT.map(p => p.piece)
  ];

  // Végigmegyünk az alakzatokon és a pálya minden celláján
  for (const piece of allShapes) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlacePiece(piece, r, c)) {
          // Készítünk egy ideiglenes másolatot a rácsról a teszthez
          const tempGrid = grid.map(row => [...row]);
          
          // Szimuláljuk a lerakást
          for (let pr = 0; pr < piece.length; pr++) {
            for (let pc = 0; pc < piece[0].length; pc++) {
              if (piece[pr][pc] === 1) {
                tempGrid[r + pr][c + pc] = 1;
              }
            }
          }

          // Megnézzük, hogy ez a lerakás kiütne-e legalább 1 sort vagy oszlopot
          let hasClear = false;
          // Sorok ellenőrzése
          for (let tr = 0; tr < GRID_SIZE; tr++) {
            if (tempGrid[tr].every(cell => cell !== 0)) hasClear = true;
          }
          // Oszlopok ellenőrzése
          for (let tc = 0; tc < GRID_SIZE; tc++) {
            let colFull = true;
            for (let tr = 0; tr < GRID_SIZE; tr++) {
              if (tempGrid[tr][tc] === 0) colFull = false;
            }
            if (colFull) hasClear = true;
          }

          // Ha találtunk olyan elemet, ami vonalat töröl, visszadjuk!
          if (hasClear) {
            return piece;
          }
        }
      }
    }
  }

  return null; // Ha semmilyen elem nem tudna vonalat törölni
}

// --- FRISSÍTETT GENERÁLÓ LOGIKA ---
export function spawnNewPieces() {
  const occupiedCells = getOccupiedCellCount();
  const totalCells = GRID_SIZE * GRID_SIZE; // 64
  const fillRatio = occupiedCells / totalCells;

  let testPieces = null;

  // 1. HA ÜRES A PÁLYA (< 30% foglalt) -> SMART COMBOS!
  if (fillRatio < 0.30 && Math.random() < 0.30) {
    const randomComboIndex = Math.floor(Math.random() * SMART_COMBOS.length);
    testPieces = [...SMART_COMBOS[randomComboIndex]];
  }

  // 2. HA NEM ÜRES A PÁLYA -> NORMÁL SORSOLÁS + BOARD HELPER!
  if (!testPieces) {
    testPieces = [getRandomPiece(), getRandomPiece(), getRandomPiece()];

    // 40% eséllyel adunk egy olyan elemet, ami garantáltan sort/oszlopot üt ki
    if (Math.random() < 0.40) {
      const clearingPiece = findLineClearingPiece();
      if (clearingPiece) {
        testPieces[2] = clearingPiece; // A 3. elemet kicseréljük a megmentőre
      }
    }
  }

  // 3. GARANCIA ELLENŐRZÉSE (Legalább egy elem letehető legyen)
  if (isAtLeastOnePlayable(testPieces)) {
    currentPieces = testPieces;
  } else {
    // Ha a sorsolt szett mégsem letehető, futtatunk egy biztonsági kört
    spawnNewPieces();
  }
}

export function checkSpawnNextRound() {
  if (currentPieces.every(p => p === null)) {
    spawnNewPieces();
  }
}

export function resetState() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = 0;
    }
  }
  gameState.score = 0;
  gameState.comboCount = 0;
  gameState.comboMovesLeft = 3;
  gameState.isGameOver = false;
  gameState.isStarted = true;
  horizLinesCount = 0;
  spawnNewPieces();
}

// Segédfüggvény a rekord frissítésére és mentésére
export function updateHighScore() {
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem('blockBlast_highScore', gameState.highScore);
    return true; // Visszaadja, ha ÚJ REKORD született!
  }
  return false;
}