// --- ELEMEK ÉS KONTEXTUSOK ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ÚJ UI ELEMEK DOM REFRESH ---
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const startGameModal = document.getElementById('start-game-modal');
const startBtn = document.getElementById('start-btn');

let isGameStarted = false; // Alapból hamis, amíg rá nem kattint a Start Game-re

let isGameOver = false;

// Felső lebegő canvas
const dragCanvas = document.getElementById('dragCanvas');
const dragCtx = dragCanvas.getContext('2d');

const scoreElement = document.getElementById('score');

const pieceCanvases = [
  document.getElementById('piece0'),
  document.getElementById('piece1'),
  document.getElementById('piece2')
];
const pieceCtxs = pieceCanvases.map(c => c.getContext('2d'));

// Textúra
const blockImage = new Image();
blockImage.src = 'the_object.png';
blockImage.onload = () => {
  drawAll();
};

// --- JÁTÉKBEÁLLÍTÁSOK ---
const GRID_SIZE = 8;
let cellSize = 0;
let score = 0;

const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

const PIECES = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  [[1, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 1], [1, 1]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 1], [0, 1, 0]]
];

let currentPieces = [null, null, null];

// Drag & Drop állapot
let draggedPieceIndex = null;
let dragX = 0;
let dragY = 0;
let isDragging = false;

// --- LOGIKA ---

function spawnNewPieces() {
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * PIECES.length);
    currentPieces[i] = PIECES[randomIndex];
  }
}

function checkSpawnNextRound() {
  if (currentPieces.every(p => p === null)) {
    spawnNewPieces();
  }
}

function canPlacePiece(piece, startRow, startCol) {
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

function placePiece(piece, startRow, startCol) {
  const pRows = piece.length;
  const pCols = piece[0].length;

  for (let r = 0; r < pRows; r++) {
    for (let c = 0; c < pCols; c++) {
      if (piece[r][c] === 1) {
        grid[startRow + r][startCol + c] = 1;
      }
    }
  }
}

// --- SOR ÉS OSZLOPTÖRLŐ ALGORITMUS ---
function clearFullLines() {
  let fullRows = [];
  let fullCols = [];

  // 1. Teli sorok keresése
  for (let r = 0; r < GRID_SIZE; r++) {
    let isFull = true;
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        isFull = false;
        break;
      }
    }
    if (isFull) fullRows.push(r);
  }

  // 2. Teli oszlopok keresése
  for (let c = 0; c < GRID_SIZE; c++) {
    let isFull = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] === 0) {
        isFull = false;
        break;
      }
    }
    if (isFull) fullCols.push(c);
  }

  // 3. Teli sorok törlése
  fullRows.forEach(r => {
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = 0;
    }
  });

  // 4. Teli oszlopok törlése
  fullCols.forEach(c => {
    for (let r = 0; r < GRID_SIZE; r++) {
      grid[r][c] = 0;
    }
  });

  // Visszaadjuk a törölt vonalak számát (később a pontozáshoz)
  return {
    clearedLinesCount: fullRows.length + fullCols.length,
    rowsCleared: fullRows.length,
    colsCleared: fullCols.length
  };
}

// --- PONTOZÁSI ÁLLAPOT ---
let comboCount = 0; // Egymást követő sikeres törlések száma

// Lehelyezett alakzat celláinak megszámolása
function countPieceBlocks(piece) {
  let count = 0;
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[0].length; c++) {
      if (piece[r][c] === 1) count++;
    }
  }
  return count;
}

// Alap törlési érték (B) kiszámítása a törölt sorok/oszlopok száma alapján
function getBasicClearScore(linesCount) {
  switch (linesCount) {
    case 1: return 10;
    case 2: return 20;
    case 3: return 60;
    case 4: return 120;
    case 5: return 200;
    default:
      // Ha esetleg 5-nél is több vonalat törölne egyszerre (pl. 6)
      return linesCount > 5 ? 200 + (linesCount - 5) * 100 : 0;
  }
}

// UI Pontszám frissítése
function updateScoreUI() {
  scoreElement.textContent = score;
}

// Rács koordináta kiszámítása a képernyő abszolút (clientX, clientY) alapján
function getBoardCellFromCoords(clientX, clientY, piece) {
  const rect = canvas.getBoundingClientRect();
  const yOffset = cellSize * 1.5;

  const mouseX = clientX - rect.left;
  const mouseY = (clientY - yOffset) - rect.top;

  const pRows = piece.length;
  const pCols = piece[0].length;

  const col = Math.round((mouseX - (pCols * cellSize) / 2) / cellSize);
  const row = Math.round((mouseY - (pRows * cellSize) / 2) / cellSize);

  return { row, col };
}

// --- JÁTÉK INDÍTÁSA ---
function startGame() {
  isGameStarted = true;
  startGameModal.classList.add('hidden');
}

// Start gomb eseménykezelője
startBtn.addEventListener('click', startGame);

// --- GAME OVER ELLENŐRZŐ ALGORITMUS ---
function checkGameOver() {
  // 1. Megnézzük az összes még fel nem használt alakzatot
  for (let i = 0; i < currentPieces.length; i++) {
    const piece = currentPieces[i];
    if (piece !== null) {
      // 2. Végigpróbáljuk a rács összes celláját
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          // Ha akár EGYETLEN alakzatot le lehet rakni BÁRHOVA, nincs game over!
          if (canPlacePiece(piece, r, c)) {
            return false;
          }
        }
      }
    }
  }

  // Ha ide elér a kód, egyetlen megmaradt alakzatot sem lehet elhelyezni sem hova
  return true;
}

function triggerGameOver() {
  isGameOver = true;
  finalScoreElement.textContent = score;
  gameOverModal.classList.remove('hidden');
}

// --- JÁTÉK ÚJRAINDÍTÁSA (RESET) ---
function resetGame() {
  // Rács ürítése
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = 0;
    }
  }

  score = 0;
  comboCount = 0;
  isGameOver = false;
  isGameStarted = true;

  updateScoreUI();
  gameOverModal.classList.add('hidden');

  spawnNewPieces();
  drawAll();
}

// Újraindítás gomb eseménykezelője
restartBtn.addEventListener('click', resetGame);

// --- MÉRETEZÉS ---

function resizeCanvas() {
  const windowPadding = 20;
  const availableHeight = window.innerHeight - 240;
  const availableWidth = window.innerWidth - windowPadding;
  const maxSize = Math.min(availableWidth, availableHeight, 420);

  canvas.width = maxSize;
  canvas.height = maxSize;
  cellSize = canvas.width / GRID_SIZE;

  // Teljes képernyős lebegő canvas felbontása
  dragCanvas.width = window.innerWidth;
  dragCanvas.height = window.innerHeight;

  pieceCanvases.forEach(pCanvas => {
    pCanvas.width = pCanvas.clientWidth || 110;
    pCanvas.height = pCanvas.clientHeight || 110;
  });

  drawAll();
}

// --- RAJZOLÁS ---

// 1. A fő 8x8-as tábla rajzolása (stabile)
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const px = c * cellSize;
      const py = r * cellSize;

      if (grid[r][c] !== 0) {
        if (blockImage.complete && blockImage.naturalWidth !== 0) {
          ctx.drawImage(blockImage, px, py, cellSize, cellSize);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px, py, cellSize, cellSize);
        }
      } else {
        ctx.fillStyle = '#774046';
        ctx.fillRect(px, py, cellSize, cellSize);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeRect(px, py, cellSize, cellSize);
      }
    }
  }
}

// 2. A felső lebegő réteg rajzolása (Shadow + Húzott elem)
function drawDragOverlay() {
  dragCtx.clearRect(0, 0, dragCanvas.width, dragCanvas.height);

  if (!isDragging || draggedPieceIndex === null) return;

  const piece = currentPieces[draggedPieceIndex];
  if (!piece) return;

  const rect = canvas.getBoundingClientRect();
  const { row, col } = getBoardCellFromCoords(dragX, dragY, piece);
  const valid = canPlacePiece(piece, row, col);

  // A) ELŐNÉZET / ÁRNYÉK A PÁLYÁN (Abszolút képernyőpozícióval)
  dragCtx.save();
  dragCtx.globalAlpha = 0.4;

  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[0].length; c++) {
      if (piece[r][c] === 1) {
        const targetRow = row + r;
        const targetCol = col + c;

        if (targetRow >= 0 && targetRow < GRID_SIZE && targetCol >= 0 && targetCol < GRID_SIZE) {
          const px = rect.left + targetCol * cellSize;
          const py = rect.top + targetRow * cellSize;

          if (valid) {
            if (blockImage.complete && blockImage.naturalWidth !== 0) {
              dragCtx.drawImage(blockImage, px, py, cellSize, cellSize);
            } else {
              dragCtx.fillStyle = '#ffffff';
              dragCtx.fillRect(px, py, cellSize, cellSize);
            }
          } else {
            dragCtx.fillStyle = 'rgba(231, 76, 60, 0.8)';
            dragCtx.fillRect(px, py, cellSize, cellSize);
          }
        }
      }
    }
  }
  dragCtx.restore();

  // B) AZ ÉPPEN HÚZOTT ALAKZAT AZ UJJ ALATT (Teljesen szabadon lebeg bárhol)
  const yOffset = cellSize * 1.5;
  const pRows = piece.length;
  const pCols = piece[0].length;
  const pieceWidth = pCols * cellSize;
  const pieceHeight = pRows * cellSize;

  const startX = dragX - pieceWidth / 2;
  const startY = (dragY - yOffset) - pieceHeight / 2;

  dragCtx.save();
  for (let r = 0; r < pRows; r++) {
    for (let c = 0; c < pCols; c++) {
      if (piece[r][c] === 1) {
        const px = startX + c * cellSize;
        const py = startY + r * cellSize;

        if (blockImage.complete && blockImage.naturalWidth !== 0) {
          dragCtx.drawImage(blockImage, px, py, cellSize, cellSize);
        } else {
          dragCtx.fillStyle = '#ffffff';
          dragCtx.fillRect(px, py, cellSize, cellSize);
        }
      }
    }
  }
  dragCtx.restore();
}

// 3. Alsó kártyák
function drawPieces() {
  pieceCanvases.forEach((pCanvas, index) => {
    const pCtx = pieceCtxs[index];
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    if (isDragging && draggedPieceIndex === index) return;

    const piece = currentPieces[index];
    if (!piece) return;

    const pRows = piece.length;
    const pCols = piece[0].length;

    const padding = 12;
    const availableW = pCanvas.width - padding * 2;
    const availableH = pCanvas.height - padding * 2;
    const miniCellSize = Math.min(availableW / pCols, availableH / pRows, 30);

    const totalWidth = pCols * miniCellSize;
    const totalHeight = pRows * miniCellSize;
    const offsetX = (pCanvas.width - totalWidth) / 2;
    const offsetY = (pCanvas.height - totalHeight) / 2;

    for (let r = 0; r < pRows; r++) {
      for (let c = 0; c < pCols; c++) {
        if (piece[r][c] === 1) {
          const px = offsetX + c * miniCellSize;
          const py = offsetY + r * miniCellSize;

          if (blockImage.complete && blockImage.naturalWidth !== 0) {
            pCtx.drawImage(blockImage, px, py, miniCellSize, miniCellSize);
          } else {
            pCtx.fillStyle = '#ffffff';
            pCtx.fillRect(px, py, miniCellSize, miniCellSize);
          }
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

// --- ESEMÉNYKEZELŐK ---

function handleStart(clientX, clientY, index) {
  if (!isGameStarted || isGameOver || currentPieces[index] === null) return;
  if (currentPieces[index] === null) return;
  isDragging = true;
  draggedPieceIndex = index;
  dragX = clientX;
  dragY = clientY;
  drawAll();
}

function handleMove(clientX, clientY) {
  if (!isDragging) return;
  dragX = clientX;
  dragY = clientY;
  drawAll();
}

function handleEnd() {
  if (!isDragging || isGameOver) return;

  const piece = currentPieces[draggedPieceIndex];
  if (piece) {
    const { row, col } = getBoardCellFromCoords(dragX, dragY, piece);

    if (canPlacePiece(piece, row, col)) {
      // 1. Blokk lehelyezése
      placePiece(piece, row, col);

      // 2. Pont hozzáadása a lehelyezett blokkokért (1pt / cella)
      const pieceSizePoints = countPieceBlocks(piece);
      score += pieceSizePoints;

      currentPieces[draggedPieceIndex] = null;

      // 3. Sorok és oszlopok törlése
      const lineClearResult = clearFullLines();
      const linesCleared = lineClearResult.clearedLinesCount;

      // 4. Kombó és pontszám kalkuláció
      if (linesCleared > 0) {
        const B = getBasicClearScore(linesCleared);
        const linePoints = B * comboCount + B;
        score += linePoints;
        comboCount++;
      } else {
        comboCount = 0;
      }

      updateScoreUI();

      // 5. Új alakzatok adása (ha mind a 3 elfogyott)
      checkSpawnNextRound();

      // 6. GAME OVER ELLENŐRZÉS
      if (checkGameOver()) {
        triggerGameOver();
      }
    }
  }

  isDragging = false;
  draggedPieceIndex = null;
  drawAll();
}

pieceCanvases.forEach((pCanvas, index) => {
  pCanvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY, index));
  pCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY, index);
  }, { passive: false });
});

window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
window.addEventListener('mouseup', handleEnd);

window.addEventListener('touchmove', (e) => {
  if (isDragging) {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }
}, { passive: false });

window.addEventListener('touchend', handleEnd);

// --- INICIALIZÁLÁS ---
window.addEventListener('resize', resizeCanvas);

spawnNewPieces();
resizeCanvas();