// --- ALAKZATOK ÉS SÚLYAIK (WEIGHT) ---
export const PIECES_WITH_WEIGHTS = [
  // 1. NAGYON GYAKORI (súly: 10)
  { piece: [[1, 1], [1, 1]], weight: 10 },               // 2x2 Négyzet
  { piece: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], weight: 10 },// 3x3 Négyzet
  { piece: [[1, 1, 1]], weight: 10 },                    // 3-as egyenes H
  { piece: [[1], [1], [1]], weight: 10 },                // 3-as egyenes V
  { piece: [[1, 1, 1, 1]], weight: 10 },                 // 4-es egyenes H
  { piece: [[1], [1], [1], [1]], weight: 10 },           // 4-es egyenes V
  { piece: [[1, 0], [1, 0], [1, 1]], weight: 10 },       // L alakzatok
  { piece: [[0, 1], [0, 1], [1, 1]], weight: 10 },
  { piece: [[1, 1, 1], [1, 0, 0]], weight: 10 },
  { piece: [[1, 1, 1], [0, 0, 1]], weight: 10 },
  { piece: [[1, 1, 1], [0, 1, 0]], weight: 10 },       // T alak
  { piece: [[1, 1, 0], [0, 1, 1]], weight: 10 },       // Z / S alakok
  { piece: [[0, 1, 1], [1, 1, 0]], weight: 10 },

  // 2. KEVÉSBÉ GYAKORI (súly: 5)
  { piece: [[1]], weight: 5 },                           // 1-es négyzet
  { piece: [[1, 1]], weight: 5 },                        // 2-es egyenes H
  { piece: [[1], [1]], weight: 5 },                      // 2-es egyenes V
  { piece: [[1, 0], [0, 1]], weight: 5 },                // 2-es átló 1
  { piece: [[0, 1], [1, 0]], weight: 5 },                // 2-es átló 2

  // 3. MÉG RITKÁBB (súly: 2)
  { piece: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], weight: 2 }, // 3-as átló 1
  { piece: [[0, 0, 1], [0, 1, 0], [1, 0, 0]], weight: 2 }, // 3-as átló 2

  // 4. LEGRITKÁBB (súly: 1)
  { piece: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], weight: 1 }, // 4-es átló 1
  { piece: [[0, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0], [1, 0, 0, 0]], weight: 1 }  // 4-es átló 2
];