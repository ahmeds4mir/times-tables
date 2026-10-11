// Bump the version whenever app files change so phones download the update.
const CACHE = 'times-tables-v2';

const APP_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'css/chapter1.css',
  'js/sounds.js',
  'js/confetti.js',
  'js/chapter1.js',
  'js/app.js',
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
