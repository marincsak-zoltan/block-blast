const CACHE_NAME = 'block-blast-v2.5';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon.png',
  './hellokitty.png',
  './happykitty.png',
  './the_object.png',
  './gradient_horizontal.png',
  './gradient_vertical.png',
  './scripts/main.js',
  './scripts/state.js',
  './scripts/logic.js',
  './scripts/audio.js',
  
  // 🔊 HANGEFFEKTEK (Alap hangok)
  './sounds/woosh1.mp3',
  './sounds/woosh2.mp3',
  './sounds/woosh3.mp3',
  './sounds/place.mp3',
  './sounds/game_over.mp3',

  // 🎵 KOMBÓ HANGOK (1-10)
  './sounds/combo1.mp3',
  './sounds/combo2.mp3',
  './sounds/combo3.mp3',
  './sounds/combo4.mp3',
  './sounds/combo5.mp3',
  './sounds/combo6.mp3',
  './sounds/combo7.mp3',
  './sounds/combo8.mp3',
  './sounds/combo9.mp3',
  './sounds/combo10.mp3'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});
