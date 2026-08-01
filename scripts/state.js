import { SMART_COMBOS } from './pieces.js';
import { canPlacePiece, generateSmartNextPieces } from './logic.js';

export const GRID_SIZE = 8;
export let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

export let gameState = {
  score: 0,
  highScore: parseInt(localStorage.getItem('blockBlast_highScore')) || 0,
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

let horizLinesCount = 0;

// Segédfüggvény: Megszámolja, hány cella van elfoglalva a rácson
function getOccupiedCellCount() {
  let count = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== 0) count++;
    }
  }
  return count;
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

// GENERÁLÓ LOGIKA
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

  // 2. HA NEM ÜRES A PÁLYA -> OKOS SORSOLÁS A KOMBÓ ALAPJÁN
  if (!testPieces) {
    testPieces = generateSmartNextPieces(gameState.comboCount);
  }

  // 3. GARANCIA ELLENŐRZÉSE (Legalább egy elem letehető legyen)
  if (isAtLeastOnePlayable(testPieces)) {
    currentPieces = testPieces;
  } else {
    spawnNewPieces();
  }
}

export function checkSpawnNextRound() {
  if (currentPieces.every(p => p === null)) {
    spawnNewPieces();
  }
}

export function resetState() {
  clearSavedGame();
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

// Rekord frissítése és mentése
export function updateHighScore() {
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem('blockBlast_highScore', gameState.highScore);
    return true;
  }
  return false;
}

// --- AUTO-SAVE LOGIKA ---

const SAVE_KEY = 'blockBlast_savedGame';

// State elmentése LocalStorage-ba
export function saveGameState() {
  // Ha épp Game Over van vagy el sem kezdődött, ne mentsünk aktív játékot
  if (!gameState.isStarted || gameState.isGameOver) {
    clearSavedGame();
    return;
  }

  const saveData = {
    grid,
    score: gameState.score,
    comboCount: gameState.comboCount,
    comboMovesLeft: gameState.comboMovesLeft,
    currentPieces
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

// Mentett játék betöltése (ha létezik)
export function loadSavedGame() {
  const dataRaw = localStorage.getItem(SAVE_KEY);
  if (!dataRaw) return false;

  try {
    const saveData = JSON.parse(dataRaw);

    // Grid visszaállítása
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        grid[r][c] = saveData.grid[r][c];
      }
    }

    // Állapotok visszaállítása
    gameState.score = saveData.score;
    gameState.comboCount = saveData.comboCount;
    gameState.comboMovesLeft = saveData.comboMovesLeft;
    gameState.isStarted = true;
    gameState.isGameOver = false;

    // Aktuális 3 elem visszaállítása
    for (let i = 0; i < 3; i++) {
      currentPieces[i] = saveData.currentPieces[i];
    }

    return true;
  } catch (e) {
    console.error("Mentés betöltése sikertelen:", e);
    clearSavedGame();
    return false;
  }
}

// Mentés törlése
export function clearSavedGame() {
  localStorage.removeItem(SAVE_KEY);
}