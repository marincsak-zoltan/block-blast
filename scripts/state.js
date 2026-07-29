import { PIECE_CATEGORIES, SMART_COMBOS } from './pieces.js';

// --- JÁTÉKBEÁLLÍTÁSOK ÉS RÁCS ---
export const GRID_SIZE = 8;
export let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

// --- GLOBÁLIS JÁTÉKÁLLAPOT ---
export let gameState = {
  score: 0,
  comboCount: 0,
  comboMovesLeft: 3, // Hátralévő lépések száma a kombó elvesztéséig
  isStarted: false,
  isGameOver: false,
  isAnimating: false,
  cellSize: 0
};

// --- HÚZÁSI ÁLLAPOT (DRAG & DROP) ---
export let dragInfo = {
  isDragging: false,
  index: null,
  x: 0,
  y: 0
};

// Az éppen elérhető 3 alakzat
export let currentPieces = [null, null, null];

// --- DINAMIKUS ALAKZAT SORSOLÓ LOGIKA ---
function getRandomPieceWeighted() {
  const score = gameState.score;
  let pool = [];

  // 1. NEHÉZSÉGI SZINTEK MEGHATÁROZÁSA PONTSZÁM ALAPJÁN
  if (score < 200) {
    // 🟢 KEZDŐ: 70% könnyű, 30% normál, 0% nehéz
    pool = [
      ...PIECE_CATEGORIES.EASY.map(item => ({ ...item, weight: 70 })),
      ...PIECE_CATEGORIES.MEDIUM.map(item => ({ ...item, weight: 30 }))
    ];
  } else if (score < 600) {
    // 🟡 KÖZÉPHALADÓ: 30% könnyű, 50% normál, 20% nehéz
    pool = [
      ...PIECE_CATEGORIES.EASY.map(item => ({ ...item, weight: 30 })),
      ...PIECE_CATEGORIES.MEDIUM.map(item => ({ ...item, weight: 50 })),
      ...PIECE_CATEGORIES.HARD.map(item => ({ ...item, weight: 20 }))
    ];
  } else {
    // 🔴 HALADÓ (600+ pont): kiegyensúlyozottabb, de több nehéz elemmel
    pool = [
      ...PIECE_CATEGORIES.EASY.map(item => ({ ...item, weight: 20 })),
      ...PIECE_CATEGORIES.MEDIUM.map(item => ({ ...item, weight: 45 })),
      ...PIECE_CATEGORIES.HARD.map(item => ({ ...item, weight: 35 }))
    ];
  }

  // 2. SÚLYOZOTT SORSOLÁS
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of pool) {
    if (random < item.weight) {
      return item.piece;
    }
    random -= item.weight;
  }

  return PIECE_CATEGORIES.EASY[0].piece;
}

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

// Új 3 alakzat generálása (Dinamikus + Smart Combo)
export function spawnNewPieces() {
  const occupiedCells = getOccupiedCellCount();
  const totalCells = GRID_SIZE * GRID_SIZE; // 64
  const fillRatio = occupiedCells / totalCells;

  // 🧠 SMART COMBO CHECK:
  // Ha a pálya kevesebb mint 30%-a van tele (< 19 cella) ÉS 30% eséllyel bepörög:
  if (fillRatio < 0.30 && Math.random() < 0.30) {
    const randomComboIndex = Math.floor(Math.random() * SMART_COMBOS.length);
    const chosenCombo = SMART_COMBOS[randomComboIndex];

    // Berakjuk a 3 előre összehangolt elemet!
    for (let i = 0; i < 3; i++) {
      currentPieces[i] = chosenCombo[i];
    }
    return; // Kilépünk, megvan a smart leosztás!
  }

  // Ha nem váltott be a smart combo, a normál súlyozott sorsoló fut le
  for (let i = 0; i < 3; i++) {
    currentPieces[i] = getRandomPieceWeighted();
  }
}

// Új kör ellenőrzése (ha mind a 3 elem elfogyott)
export function checkSpawnNextRound() {
  if (currentPieces.every(p => p === null)) {
    spawnNewPieces();
  }
}

// Játék újraindítása (Reset)
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
  spawnNewPieces();
}