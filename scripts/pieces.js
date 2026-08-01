// --- KATEGÓRIÁK ÉS ALAKZATOK ---
export const PIECE_CATEGORIES = {
  // ALAP ALAKZATOK (Gyakoriak)
  BASIC: [
    { piece: [[1, 1], [1, 1]], weight: 25 },               // 2x2
    { piece: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], weight: 15 },// 3x3
    
    // NAGY L-ALAKOK (4 blokk)
    { piece: [[1, 0], [1, 0], [1, 1]], weight: 20 },       
    { piece: [[0, 1], [0, 1], [1, 1]], weight: 20 },
    { piece: [[1, 1, 1], [1, 0, 0]], weight: 20 },
    { piece: [[1, 1, 1], [0, 0, 1]], weight: 20 },

    // KIS L-ALAKOK / SAROK-ELEMEK (3 blokk - EZ HIÁNYZOTT!)
    { piece: [[1, 0], [1, 1]], weight: 5 },
    { piece: [[0, 1], [1, 1]], weight: 5 },
    { piece: [[1, 1], [1, 0]], weight: 5 },
    { piece: [[1, 1], [0, 1]], weight: 5 },

    { piece: [[1, 1, 1], [0, 1, 0]], weight: 20 },       // T
    { piece: [[1, 1, 0], [0, 1, 1]], weight: 15 },       // Z / S
    { piece: [[0, 1, 1], [1, 1, 0]], weight: 15 }
  ],

  // EGYENESEK (Vízszintes / Függőleges)
  LINES: {
    HORIZ: [
      { piece: [[1, 1, 1]], weight: 20 },
      { piece: [[1, 1, 1, 1]], weight: 20 },
      { piece: [[1, 1, 1, 1, 1]], weight: 10 }
    ],
    VERT: [
      { piece: [[1], [1], [1]], weight: 20 },
      { piece: [[1], [1], [1], [1]], weight: 20 },
      { piece: [[1], [1], [1], [1], [1]], weight: 10 }
    ]
  },

  // RITKA ELEMEK (Átlók súlya minimálisra csökkentve!)
  RARE: [
    { piece: [[1]], weight: 1 },                           // 1-es négyzet
    { piece: [[1, 1]], weight: 2 },                        // 2-es egyenes H
    { piece: [[1], [1]], weight: 2 },                      // 2-es egyenes V
    { piece: [[1, 0], [0, 1]], weight: 1 },                // 2-es átló
    { piece: [[0, 1], [1, 0]], weight: 1 },
    { piece: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], weight: 1 }, // 3-as átló
    { piece: [[0, 0, 1], [0, 1, 0], [1, 0, 0]], weight: 1 }
    // A 4-es átlók teljesen törölve lettek a játékmenet javítása érdekében!
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
    [[1, 1, 1], [1, 1, 1]],
    [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
    [[1, 1], [1, 1]]
  ],
  
  [
    [[1, 1, 1], [1, 1, 1]],
    [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 1]]
  ]
];

// ÖSSZES ALAKZAT KIGYŰJTÉSE EGY CSOPORTBA
export function getAllAvailablePieces() {
  const all = [];
  
  PIECE_CATEGORIES.BASIC.forEach(item => all.push(item.piece));
  PIECE_CATEGORIES.LINES.HORIZ.forEach(item => all.push(item.piece));
  PIECE_CATEGORIES.LINES.VERT.forEach(item => all.push(item.piece));
  PIECE_CATEGORIES.RARE.forEach(item => all.push(item.piece));

  return all;
}

// Súlyozott véletlenszerű elem húzása (Alapértelmezett sorsolás)
export function getRandomWeightedPiece() {
  const pool = [];
  
  const addCategory = (list) => {
    list.forEach(item => {
      for (let i = 0; i < item.weight; i++) {
        pool.push(item.piece);
      }
    });
  };

  addCategory(PIECE_CATEGORIES.BASIC);
  addCategory(PIECE_CATEGORIES.LINES.HORIZ);
  addCategory(PIECE_CATEGORIES.LINES.VERT);
  addCategory(PIECE_CATEGORIES.RARE);

  return pool[Math.floor(Math.random() * pool.length)];
}