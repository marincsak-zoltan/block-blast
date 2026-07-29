// --- ALAKZATOK CSOPORTOSÍTVA NEHÉZSÉG SZERINT ---

export const PIECE_CATEGORIES = {
  // 🟢 KÖNNYŰ (Kicsi, könnyen lerakható elemek)
  EASY: [
    { piece: [[1]], name: 'dot' },
    { piece: [[1, 1]], name: 'line2h' },
    { piece: [[1], [1]], name: 'line2v' },
    { piece: [[1, 0], [1, 1]], name: 'smallL1' },
    { piece: [[0, 1], [1, 1]], name: 'smallL2' },
    { piece: [[1, 1], [1, 1]], name: 'square2x2' }
  ],

  // 🟡 NORMÁL (Közepes méretű alap alakzatok)
  MEDIUM: [
    { piece: [[1, 1, 1]], name: 'line3h' },
    { piece: [[1], [1], [1]], name: 'line3v' },
    { piece: [[1, 1, 1, 1]], name: 'line4h' },
    { piece: [[1], [1], [1], [1]], name: 'line4v' },
    { piece: [[1, 0], [1, 0], [1, 1]], name: 'L1' },
    { piece: [[0, 1], [0, 1], [1, 1]], name: 'L2' },
    { piece: [[1, 1, 1], [0, 1, 0]], name: 'T1' },
    { piece: [[1, 1, 0], [0, 1, 1]], name: 'Z1' }
  ],

  // 🔴 NEHÉZ (Nagy terjedelmű vagy trükkös átlós elemek)
  HARD: [
    { piece: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], name: 'square3x3' },
    { piece: [[1, 0], [0, 1]], name: 'diag2_1' },
    { piece: [[0, 1], [1, 0]], name: 'diag2_2' },
    { piece: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], name: 'diag3_1' },
    { piece: [[0, 0, 1], [0, 1, 0], [1, 0, 0]], name: 'diag3_2' },
    { piece: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], name: 'diag4_1' },
    { piece: [[0, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0], [1, 0, 0, 0]], name: 'diag4_2' }
  ]
};

// --- PREMADE SMART COMBOS (ÜRES PÁLYÁRA) ---
export const SMART_COMBOS = [
  // 1. A te ötleted: 2 db 3x3-as + 1 db 2x3-as (vagy 3x2-es)
  [
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // 3x3
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // 3x3
    [[1, 1, 1], [1, 1, 1]]             // 2x3
  ],
  // 2. Teli sorok azonnali kiütése: 3 db 4-es egyenes
  [
    [[1, 1, 1, 1]],
    [[1, 1, 1, 1]],
    [[1, 1, 1, 1]]
  ],
  // 3. Nagy L-kombó + 2x2 négyzet
  [
    [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
    [[1, 1], [1, 1]]
  ]
];