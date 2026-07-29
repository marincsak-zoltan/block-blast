// --- MOBILBARÁT AUDIO POOL ÉS UNLOCK ---

// Előre betöltött hangok gyűjteménye
const sounds = {
  place: [new Audio('../sounds/place.mp3'), new Audio('../sounds/place.mp3')],
  gameOver: new Audio('../sounds/game_over.mp3'),
  wooshes: [
    new Audio('../sounds/woosh1.mp3'),
    new Audio('../sounds/woosh2.mp3'),
    new Audio('../sounds/woosh3.mp3')
  ],
  combos: Array.from({ length: 10 }, (_, i) => [
    new Audio(`../sounds/combo${i + 1}.mp3`),
    new Audio(`../sounds/combo${i + 1}.mp3`)
  ])
};

let isAudioUnlocked = false;

// 1. ELSŐ ÉRINTÉSKOR FELÉBRESZTJÜK A HANGOKAT (iOS Safari / Android fix)
export function unlockAudio() {
  if (isAudioUnlocked) return;

  // Egy néma lejátszási kísérlet az első koppintásnál feloldja az autoplays tiltást
  const unlockPromises = [];
  
  sounds.wooshes.forEach(a => {
    a.volume = 0.001;
    unlockPromises.push(a.play().then(() => { a.pause(); a.currentTime = 0; a.volume = 0.6; }).catch(() => {}));
  });

  Promise.all(unlockPromises).then(() => {
    isAudioUnlocked = true;
  });
}

// Új némitási állapotváltozó
export let isMuted = false;

export function toggleMute() {
  isMuted = !isMuted;
  return isMuted;
}

// A playSound függvény elejére tegyük be a némitás ellenőrzését:
function playSound(audioOrArray) {
  if (isMuted) return; // 🔇 Ha némitva van, nem játszunk le semmit!

  let audioToPlay;
  if (Array.isArray(audioOrArray)) {
    audioToPlay = audioOrArray.find(a => a.paused) || audioOrArray[0];
  } else {
    audioToPlay = audioOrArray;
  }

  if (!audioToPlay) return;

  audioToPlay.currentTime = 0;
  audioToPlay.volume = 0.6;
  audioToPlay.play().catch(err => {
    console.log("Audio play blocked:", err);
  });
}

// --- HANGKAPCSOLÓ FÜGGVÉNYEK ---

export function playWooshSound() {
  const randomIndex = Math.floor(Math.random() * sounds.wooshes.length);
  playSound(sounds.wooshes[randomIndex]);
}

export function playPlaceSound() {
  playSound(sounds.place);
}

export function playComboSound(comboIndex) {
  const safeIndex = Math.min(Math.max(comboIndex, 1), 10) - 1;
  playSound(sounds.combos[safeIndex]);
}

export function playGameOverSound() {
  playSound(sounds.gameOver);
}