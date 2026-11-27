const CACHE_NAME = 'wz-tracker-cache-v60';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './meta.json',
  './defis.json',
  './camos.json',
  './mw4_warzone_camos-v4_2.json',
  './rewards-system.js',
  './generateur_png.html',
  './assets/camos/completionist/gold.png',
  './assets/camos/completionist/platinum.png',
  './assets/camos/completionist/harmonic_break.png',
  './assets/camos/prestige/pyroclast.png',
  './assets/camos/prestige/pyroclast_terminus.png',
  './assets/camos/prestige/pyroclast_scatter.png',
  './assets/camos/prestige/pyroclast_cascade.png',
  './assets/camos/warzone/divergence.png',
  './assets/camos/warzone/parallax.png',
  './assets/camos/warzone/damascus_reforged.png',
  './assets/camos/warzone/empyros.png',
  './assets/camos/warzone/renaissance.png',
  './assets/camos/warzone/violet_striker.png',
  './assets/camos/warzone/neutral_ground.png',
  './assets/camos/warzone/classified_weapon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
