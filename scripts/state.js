import { PIECES } from './pieces.js';

export const GRID_SIZE = 8;
export let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

export let gameState = {
  score: 0,
  comboCount: 0,
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

export function spawnNewPieces() {
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * PIECES.length);
    currentPieces[i] = PIECES[randomIndex];
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
  gameState.isGameOver = false;
  gameState.isStarted = true;
  spawnNewPieces();
}