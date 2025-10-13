/* eslint-disable no-restricted-globals */

// Nome do cache - VERSÃO COM ÍCONES PERSONALIZADOS
const CACHE_NAME = 'agendapro-v8-custom-icons';

// Arquivos para cachear
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-72x72.svg',
  '/icon-96x96.svg',
  '/icon-128x128.svg',
  '/icon-144x144.svg',
  '/icon-152x152.svg',
  '/icon-192x192.svg',
  '/icon-384x384.svg',
  '/icon-512x512.svg',
  '/logo-base.png',
  '/eslogan.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  // Força o novo SW a ativar imediatamente
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache aberto');
        // Tentar cachear, mas não falhar se algum arquivo não existir
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})))
          .catch(err => {
            console.warn('⚠️ Service Worker: Alguns arquivos não foram cacheados:', err);
            return Promise.resolve();
          });
      })
  );
  
  // Força o service worker a se tornar ativo imediatamente
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Força o service worker a controlar todas as páginas imediatamente
  return self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições para API (sempre buscar do servidor)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se encontrou no cache, retorna
        if (response) {
          console.log('📦 Service Worker: Servindo do cache:', event.request.url);
          return response;
        }

        // Se não encontrou, busca da rede
        return fetch(event.request)
          .then((response) => {
            // Verificar se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar a resposta
            const responseToCache = response.clone();

            // Adicionar ao cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('❌ Service Worker: Erro ao buscar:', error);
            
            // Se falhar e for uma navegação, retorna a página inicial do cache
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Mensagens do Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificações Push (para futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Novo agendamento!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Agendamento',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('AgendaPro', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('✅ Service Worker carregado com sucesso!');

