const CACHE_NAME = "unifyhub-cache-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/logo.png",
  "/manifest.json"
];

// Instala e armazena os assets estáticos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Ativa o novo cache e mantém tudo armazenado (sem apagar nada antigo)
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// Cache-first para tudo (HTML, imagens, scripts, vídeos, etc.)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna do cache se existir
      if (response) return response;

      // Se não tiver no cache, busca da internet e armazena no cache
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Offline fallback (opcional)
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
