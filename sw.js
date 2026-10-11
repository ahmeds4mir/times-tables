// Bump the version whenever app files change so phones download the update.
const CACHE = 'times-tables-v6';

const MOM_STEPS = { lastCol: 6, swap: 5, split: 5, zeroOne: 6, ten: 5, unknown: 4 };
const VOICES = [
  'tables', 'chapter1', 'chapter2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10',
  ...Object.entries(MOM_STEPS).flatMap(([lesson, n]) => Array.from({ length: n }, (_, i) => `mom-${lesson}-${i}`)),
];

const APP_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'css/chapter1.css',
  'css/chapter2.css',
  'css/engine.css',
  'css/mom.css',
  'js/profile.js',
  'js/sounds.js',
  'js/confetti.js',
  'js/intros.js',
  'js/voice.js',
  'js/ui.js',
  'js/mom.js',
  'js/chapter1.js',
  'js/chapter2.js',
  'js/engine.js',
  ...[3, 4, 5, 6, 7, 8, 9, 10].map((n) => `js/chapters/ch${n}.js`),
  'js/app.js',
  ...VOICES.flatMap((v) => [`audio/ar/${v}.mp3`, `audio/en/${v}.mp3`]),
  'img/ch1/hero-ready.png',
  'img/ch1/hero-attack.png',
  'img/ch1/hero-hurt.png',
  'img/ch1/hero-victory.png',
  'img/ch1/monster-1.png',
  'img/ch1/monster-2.png',
  'img/ch1/monster-3.png',
  'img/ch1/monster-4.png',
  'img/ch1/monster-5.png',
  'img/ch1/monster-6.png',
  'img/ch1/monster-boss.png',
  'img/girl/avatar-hello.jpg',
  'img/girl/avatar-think.jpg',
  'img/girl/avatar-cheer.jpg',
  'img/girl/avatar-encourage.jpg',
  'img/girl/avatar-trophy.jpg',
  'img/girl/hero-ready.png',
  'img/girl/hero-attack.png',
  'img/girl/hero-hurt.png',
  'img/girl/hero-victory.png',
  'img/mom/mom-explain.jpg',
  'img/avatar-hello.jpg',
  'img/avatar-think.jpg',
  'img/avatar-cheer.jpg',
  'img/avatar-encourage.jpg',
  'img/avatar-trophy.jpg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok || response.type === 'opaque') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
