// Service Worker para Chocadeira Fácil - Suporte Offline Seguro
const CACHE_NAME = 'chocadeira-facil-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Adiciona itens individualmente para que a falha de um não impeça a instalação
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Aviso ao cachear asset:', url, err);
          })
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First com fallback para cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignora requisições internas do Vite em desenvolvimento, chrome extensions e esquemas não-http
  if (!url.protocol.startsWith('http')) return;
  if (url.pathname.includes('/@vite/') || url.pathname.includes('/@fs/')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Armazena cópia no cache caso a resposta seja bem-sucedida
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback offline: busca no cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Se for navegação de página e estiver sem rede, retorna index.html em cache
        if (event.request.mode === 'navigate') {
          const cachedIndex = (await caches.match('/index.html')) || (await caches.match('/'));
          if (cachedIndex) {
            return cachedIndex;
          }
        }

        // Resposta segura para evitar que a requisição quebre silenciosamente
        return new Response('Chocadeira Fácil está operando offline.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
  );
});
