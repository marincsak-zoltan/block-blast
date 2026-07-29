import { GRID_SIZE, grid, gameState, dragInfo, currentPieces, spawnNewPieces, checkSpawnNextRound, resetState } from './state.js';
import { canPlacePiece, placePiece, clearFullLines, getSimulatedLineClears, countPieceBlocks, getBasicClearScore, checkGameOver } from './logic.js';

// DOM elemek
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dragCanvas = document.getElementById('dragCanvas');
const dragCtx = dragCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const startGameModal = document.getElementById('start-game-modal');
const startBtn = document.getElementById('start-btn');

const pieceCanvases = [0, 1, 2].map(i => document.getElementById(`piece${i}`));
const pieceCtxs = pieceCanvases.map(c => c.getContext('2d'));

// Képek betöltése
const blockImage = new Image(); blockImage.src = 'the_object.png';
const gradHorizImage = new Image(); gradHorizImage.src = 'gradient_horizontal.png';
const gradVertImage = new Image(); gradVertImage.src = 'gradient_vertical.png';

let loaded = 0;
const onLoad = () => { if (++loaded === 3) drawAll(); };
blockImage.onload = onLoad; gradHorizImage.onload = onLoad; gradVertImage.onload = onLoad;

function getBoardCellFromCoords(clientX, clientY, piece) {
  const rect = canvas.getBoundingClientRect();
  const yOffset = gameState.cellSize * 1.5;
  const mouseX = clientX - rect.left;
  const mouseY = (clientY - yOffset) - rect.top;

  const col = Math.floor((mouseX - (piece[0].length * gameState.cellSize) / 2) / gameState.cellSize + 0.5);
  const row = Math.floor((mouseY - (piece.length * gameState.cellSize) / 2) / gameState.cellSize + 0.5);

  return { row, col };
}

function resizeCanvas() {
  const maxSize = Math.min(window.innerWidth - 20, window.innerHeight - 260, 420);
  canvas.width = maxSize;
  canvas.height = maxSize;
  gameState.cellSize = canvas.width / GRID_SIZE;

  dragCanvas.width = window.innerWidth;
  dragCanvas.height = window.innerHeight;

  pieceCanvases.forEach(pCanvas => {
    pCanvas.width = pCanvas.clientWidth || 100;
    pCanvas.height = pCanvas.clientHeight || 100;
  });

  drawAll();
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const px = c * gameState.cellSize, py = r * gameState.cellSize;
      if (grid[r][c] !== 0) {
        ctx.drawImage(blockImage, px, py, gameState.cellSize, gameState.cellSize);
      } else {
        ctx.fillStyle = '#774046';
        ctx.fillRect(px, py, gameState.cellSize, gameState.cellSize);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeRect(px, py, gameState.cellSize, gameState.cellSize);
      }
    }
  }
}

function drawDragOverlay() {
  dragCtx.clearRect(0, 0, dragCanvas.width, dragCanvas.height);
  if (!dragInfo.isDragging || dragInfo.index === null) return;

  const piece = currentPieces[dragInfo.index];
  if (!piece) return;

  const rect = canvas.getBoundingClientRect();
  const { row, col } = getBoardCellFromCoords(dragInfo.x, dragInfo.y, piece);
  const valid = canPlacePiece(piece, row, col);

  // 1. Pulzáló vonalak
  if (valid) {
    const { fullRows, fullCols } = getSimulatedLineClears(piece, row, col);
    dragCtx.save();
    dragCtx.globalAlpha = 0.7 + 0.25 * Math.sin(Date.now() / 150);

    fullRows.forEach(r => dragCtx.drawImage(gradHorizImage, rect.left, rect.top + r * gameState.cellSize, GRID_SIZE * gameState.cellSize, gameState.cellSize));
    fullCols.forEach(c => dragCtx.drawImage(gradVertImage, rect.left + c * gameState.cellSize, rect.top, gameState.cellSize, GRID_SIZE * gameState.cellSize));
    dragCtx.restore();
  }

  // 2. Shadow előnézet
  dragCtx.save();
  dragCtx.globalAlpha = 0.45;
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[0].length; c++) {
      if (piece[r][c] === 1) {
        const targetRow = row + r, targetCol = col + c;
        if (targetRow >= 0 && targetRow < GRID_SIZE && targetCol >= 0 && targetCol < GRID_SIZE) {
          const px = rect.left + targetCol * gameState.cellSize;
          const py = rect.top + targetRow * gameState.cellSize;
          if (valid) {
            dragCtx.drawImage(blockImage, px, py, gameState.cellSize, gameState.cellSize);
          } else {
            dragCtx.fillStyle = 'rgba(231, 76, 60, 0.8)';
            dragCtx.fillRect(px, py, gameState.cellSize, gameState.cellSize);
          }
        }
      }
    }
  }
  dragCtx.restore();

  // 3. Húzott elem az ujj alatt
  const yOffset = gameState.cellSize * 1.5;
  const startX = dragInfo.x - (piece[0].length * gameState.cellSize) / 2;
  const startY = (dragInfo.y - yOffset) - (piece.length * gameState.cellSize) / 2;

  dragCtx.save();
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[0].length; c++) {
      if (piece[r][c] === 1) {
        dragCtx.drawImage(blockImage, startX + c * gameState.cellSize, startY + r * gameState.cellSize, gameState.cellSize, gameState.cellSize);
      }
    }
  }
  dragCtx.restore();

  if (dragInfo.isDragging) requestAnimationFrame(drawDragOverlay);
}

function drawPieces() {
  pieceCanvases.forEach((pCanvas, index) => {
    const pCtx = pieceCtxs[index];
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    if (dragInfo.isDragging && dragInfo.index === index) return;

    const piece = currentPieces[index];
    if (!piece) return;

    const miniCellSize = Math.min((pCanvas.width - 24) / piece[0].length, (pCanvas.height - 24) / piece.length, 30);
    const offsetX = (pCanvas.width - piece[0].length * miniCellSize) / 2;
    const offsetY = (pCanvas.height - piece.length * miniCellSize) / 2;

    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[0].length; c++) {
        if (piece[r][c] === 1) {
          pCtx.drawImage(blockImage, offsetX + c * miniCellSize, offsetY + r * miniCellSize, miniCellSize, miniCellSize);
        }
      }
    }
  });
}

function drawAll() {
  drawGrid();
  drawPieces();
  drawDragOverlay();
}

async function animateLineClears(fullRows, fullCols) {
  gameState.isAnimating = true;
  for (let step = 0; step < GRID_SIZE; step++) {
    fullRows.forEach(r => grid[r][step] = 0);
    fullCols.forEach(c => grid[step][c] = 0);
    drawGrid();
    await new Promise(res => setTimeout(res, 30));
  }
  gameState.isAnimating = false;
}

// Eseménykezelők
function handleStart(clientX, clientY, index) {
  if (!gameState.isStarted || gameState.isGameOver || gameState.isAnimating || currentPieces[index] === null) return;
  dragInfo.isDragging = true;
  dragInfo.index = index;
  dragInfo.x = clientX;
  dragInfo.y = clientY;
  drawAll();
}

function handleMove(clientX, clientY) {
  if (!dragInfo.isDragging) return;
  dragInfo.x = clientX;
  dragInfo.y = clientY;
  drawAll();
}

async function handleEnd() {
  if (!dragInfo.isDragging || gameState.isGameOver || gameState.isAnimating) return;

  const piece = currentPieces[dragInfo.index];
  if (piece) {
    const { row, col } = getBoardCellFromCoords(dragInfo.x, dragInfo.y, piece);

    if (canPlacePiece(piece, row, col)) {
      placePiece(piece, row, col);

      const blockCount = countPieceBlocks(piece);
      const multiplier = gameState.comboCount > 0 ? gameState.comboCount : 1;
      gameState.score += blockCount * multiplier;

      currentPieces[dragInfo.index] = null;
      dragInfo.isDragging = false;
      dragInfo.index = null;
      drawAll();

      const lineClearResult = clearFullLines();
      if (lineClearResult.clearedLinesCount > 0) {
        await animateLineClears(lineClearResult.fullRows, lineClearResult.fullCols);
        const B = getBasicClearScore(lineClearResult.clearedLinesCount);
        gameState.score += B * gameState.comboCount + B;
        gameState.comboCount++;
      } else {
        gameState.comboCount = 0;
      }

      scoreElement.textContent = gameState.score;
      checkSpawnNextRound();

      if (checkGameOver()) {
        gameState.isGameOver = true;
        finalScoreElement.textContent = gameState.score;
        gameOverModal.classList.remove('hidden');
      }
    } else {
      dragInfo.isDragging = false;
      dragInfo.index = null;
    }
  }
  drawAll();
}

// Listener-ek csatolása
pieceCanvases.forEach((pCanvas, index) => {
  pCanvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY, index));
  pCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX, e.touches[0].clientY, index);
  }, { passive: false });
});

window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
window.addEventListener('mouseup', handleEnd);
window.addEventListener('touchmove', (e) => {
  if (dragInfo.isDragging) {
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: false });
window.addEventListener('touchend', handleEnd);

startBtn.addEventListener('click', () => {
  gameState.isStarted = true;
  startGameModal.classList.add('hidden');
});

restartBtn.addEventListener('click', () => {
  resetState();
  scoreElement.textContent = 0;
  gameOverModal.classList.add('hidden');
  startGameModal.classList.add('hidden');
  drawAll();
});

window.addEventListener('resize', resizeCanvas);

spawnNewPieces();
resizeCanvas();