import { PIECES_WITH_WEIGHTS } from './pieces.js';

// --- JÁTÉKBEÁLLÍTÁSOK ÉS RÁCS ---
export const GRID_SIZE = 8;
export let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

// --- GLOBÁLIS JÁTÉKÁLLAPOT ---
export let gameState = {
  score: 0,
  comboCount: 0,
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

// --- SÚLYOZOTT VÉLETLEN ALAKZAT SORSOLÓ ALGORITMUS ---
function getRandomPieceWeighted() {
  // 1. Összeszámoljuk a teljes súlymennyiséget
  const totalWeight = PIECES_WITH_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);

  // 2. Generálunk egy véletlen számot 0 és a totalWeight között
  let random = Math.random() * totalWeight;

  // 3. Kiválasztjuk a megfelelő alakzatot a súlyok alapján
  for (const item of PIECES_WITH_WEIGHTS) {
    if (random < item.weight) {
      return item.piece;
    }
    random -= item.weight;
  }

  // Biztonsági tartalék
  return PIECES_WITH_WEIGHTS[0].piece;
}

// Új 3 alakzat generálása
export function spawnNewPieces() {
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
  gameState.isGameOver = false;
  gameState.isStarted = true;
  spawnNewPieces();
}