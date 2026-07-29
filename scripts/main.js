import { GRID_SIZE, grid, gameState, dragInfo, currentPieces, spawnNewPieces, checkSpawnNextRound, resetState } from './state.js';
import { canPlacePiece, placePiece, clearFullLines, getSimulatedLineClears, countPieceBlocks, getBasicClearScore, checkGameOver } from './logic.js';
import { unlockAudio, playWooshSound, playPlaceSound, playComboSound, playGameOverSound, toggleMute } from './audio.js';

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
  // Kiszámoljuk a CSS pixel és a vászon belső pixelje közötti arányt
  const scale = canvas.width / rect.width;
  
  const yOffset = gameState.cellSize * 1.5;

  // A kattintás/érintés pozíciója a vászon belső koordináta-rendszerében:
  const canvasX = (clientX - rect.left) * scale;
  const canvasY = ((clientY - yOffset) - rect.top) * scale;

  const pRows = piece.length;
  const pCols = piece[0].length;

  const col = Math.floor((canvasX - (pCols * gameState.cellSize) / 2) / gameState.cellSize + 0.5);
  const row = Math.floor((canvasY - (pRows * gameState.cellSize) / 2) / gameState.cellSize + 0.5);

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

  // A) Alap rács és lehelyezett blokkok rajzolása
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const px = c * gameState.cellSize;
      const py = r * gameState.cellSize;

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

  // B) HÚZÁS KÖZBENI ELEMEK (Pulzáló csík + Árnyék) KÖZVETLENÜL A RÁCSRA
  if (dragInfo.isDragging && dragInfo.index !== null) {
    const piece = currentPieces[dragInfo.index];
    if (piece) {
      const { row, col } = getBoardCellFromCoords(dragInfo.x, dragInfo.y, piece);
      const valid = canPlacePiece(piece, row, col);

      // B.1) PULZÁLÓ STRIP-EK (Gradiens csíkok a teli sorokra/oszlopokra)
      if (valid) {
        const { fullRows, fullCols } = getSimulatedLineClears(piece, row, col);
        ctx.save();
        ctx.globalAlpha = 0.7 + 0.25 * Math.sin(Date.now() / 150);

        // Sorok (Tűpontosan a rács belső pixeljeire)
        fullRows.forEach(r => {
          ctx.drawImage(gradHorizImage, 0, r * gameState.cellSize, GRID_SIZE * gameState.cellSize, gameState.cellSize);
        });

        // Oszlopok
        fullCols.forEach(c => {
          ctx.drawImage(gradVertImage, c * gameState.cellSize, 0, gameState.cellSize, GRID_SIZE * gameState.cellSize);
        });

        ctx.restore();
      }

      // B.2) SHADOW / ELŐNÉZET (A rácson)
      if (valid) {
        ctx.save();
        ctx.globalAlpha = 0.45;
        for (let r = 0; r < piece.length; r++) {
          for (let c = 0; c < piece[0].length; c++) {
            if (piece[r][c] === 1) {
              const targetRow = row + r;
              const targetCol = col + c;

              if (targetRow >= 0 && targetRow < GRID_SIZE && targetCol >= 0 && targetCol < GRID_SIZE) {
                const px = targetCol * gameState.cellSize;
                const py = targetRow * gameState.cellSize;

                ctx.drawImage(blockImage, px, py, gameState.cellSize, gameState.cellSize);
              }
            }
          }
        }
        ctx.restore();
      }
    }
  }
}

function drawDragOverlay() {
  dragCtx.clearRect(0, 0, dragCanvas.width, dragCanvas.height);

  if (!dragInfo.isDragging || dragInfo.index === null) return;

  const piece = currentPieces[dragInfo.index];
  if (!piece) return;

  // Az alakzat kirajzolása a megfogott ujj/kurzor pozíciójában
  const rect = canvas.getBoundingClientRect();
  const displayCellSize = rect.width / GRID_SIZE; // A látható cellaméret a képernyőn

  const yOffset = displayCellSize * 1.5;
  const startX = dragInfo.x - (piece[0].length * displayCellSize) / 2;
  const startY = (dragInfo.y - yOffset) - (piece.length * displayCellSize) / 2;

  dragCtx.save();
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[0].length; c++) {
      if (piece[r][c] === 1) {
        dragCtx.drawImage(
          blockImage, 
          startX + c * displayCellSize, 
          startY + r * displayCellSize, 
          displayCellSize, 
          displayCellSize
        );
      }
    }
  }
  dragCtx.restore();

  if (dragInfo.isDragging) {
    requestAnimationFrame(() => {
      drawGrid(); // Folyamatosan frissítjük a pulzálást a fő rácson is!
      drawDragOverlay();
    });
  }
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
  
  // 🔓 FELÉBRESZTJÜK AZ AUDIÓT AZ ELSŐ ÉRINTÉSNÉL!
  unlockAudio();

  dragInfo.isDragging = true;
  dragInfo.index = index;
  dragInfo.x = clientX;
  dragInfo.y = clientY;

  // 🔊 RANDOM WOOSH HANG
  playWooshSound();

  drawAll();
}

const muteBtn = document.getElementById('mute-btn');

muteBtn.addEventListener('click', () => {
  const muted = toggleMute();
  
  // Ikon és stílus frissítése a gombra
  muteBtn.textContent = muted ? '🔇' : '🔊';
  if (muted) {
    muteBtn.classList.add('muted');
  } else {
    muteBtn.classList.remove('muted');
  }
});

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
        // 🔊 KOMBÓ HANG LEJÁTSZÁSA (A törlési animáció előtt)
        playComboSound(gameState.comboCount + 1);

        await animateLineClears(lineClearResult.fullRows, lineClearResult.fullCols);

        const B = getBasicClearScore(lineClearResult.clearedLinesCount);
        gameState.score += B * gameState.comboCount + B;

        gameState.comboCount++;
        gameState.comboMovesLeft = 3;
      } else {
        // 🔊 SIMA LERAKÁSI HANG (Ha nem volt törlés)
        playPlaceSound();

        gameState.comboMovesLeft--;
        if (gameState.comboMovesLeft <= 0) {
          gameState.comboCount = 0;
          gameState.comboMovesLeft = 3;
        }
      }

      scoreElement.textContent = gameState.score;
      checkSpawnNextRound();

      if (checkGameOver()) {
        gameState.isGameOver = true;
        finalScoreElement.textContent = gameState.score;
        gameOverModal.classList.remove('hidden');

        // 🔊 GAME OVER HANG
        playGameOverSound();
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