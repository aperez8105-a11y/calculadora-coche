// Guarda la app en el móvil para que funcione sin conexión.
// Al publicar una versión nueva, cambia el número de CACHE para que los móviles la actualicen.
const CACHE = 'coste-coche-v2';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icono-192.png', './icono-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero lo guardado (rápido y sin conexión); a la vez se descarga la versión nueva para la próxima vez.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const guardada = await cache.match(req, { ignoreSearch: true });
      const red = fetch(req)
        .then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => guardada);
      return guardada || red;
    })
  );
});
