// Service worker: app shell in cache per funzionare offline (campo senza rete).
// Strategia stale-while-revalidate: risponde subito dalla cache e aggiorna in
// background, quindi le modifiche arrivano al caricamento successivo.
// Cambiare CACHE_VERSION ad ogni rilascio: il browser rileva il nuovo sw.js,
// lo installa e l'app mostra il banner "Aggiorna" (vedi app.js).
const CACHE_VERSION = 'padel-score-2027-11-16-v1.0';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // cache: 'reload' bypassa la cache HTTP per scaricare davvero i file nuovi
      cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: 'reload' })))
    )
  );
  // Niente skipWaiting automatico: il nuovo SW resta in attesa finché
  // l'utente non conferma l'aggiornamento dal banner.
});

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (type === 'SKIP_WAITING') self.skipWaiting();
  // La pagina chiede la versione per mostrarla nel footer
  if (type === 'GET_VERSION' && event.ports[0]) event.ports[0].postMessage(CACHE_VERSION);
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
