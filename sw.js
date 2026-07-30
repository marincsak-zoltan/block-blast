const CACHE_NAME = 'block-blast-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './hellokitty.png',
  './happykitty.png',
  './the_object.png',
  './gradient_horizontal.png',
  './gradient_vertical.png',
  './scripts/main.js',
  './scripts/state.js',
  './scripts/logic.js',
  './scripts/pieces.js',
  './scripts/audio.js',
  './sounds/place.mp3',
  './sounds/game_over.mp3',
  './sounds/woosh1.mp3',
  './sounds/woosh2.mp3',
  './sounds/woosh3.mp3'
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