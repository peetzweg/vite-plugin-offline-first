import { Plugin } from "vite";

export interface OfflineFirstOptions {
  /**
   * Name of the cache (will have build hash appended for cache busting)
   * @default 'offline-app-cache'
   */
  cacheName?: string;
  /**
   * Assets to pre-cache on first install
   * @default ['/index.html']
   */
  precacheAssets?: string[];
  /**
   * Whether to enable automatic update checking and cache replacement
   * @default true
   */
  enableUpdateCheck?: boolean;
  /**
   * Custom event name for update notifications
   * @default 'offline-first:update'
   */
  updateEventName?: string;
}

export default function offlineFirstPlugin(
  options: OfflineFirstOptions = {}
): Plugin {
  const {
    cacheName = "offline-app-cache",
    precacheAssets = ["/index.html"],
    enableUpdateCheck = true,
    updateEventName = "offline-first:update",
  } = options;

  let buildHash: string;

  return {
    name: "vite-plugin-offline-first",

    configureServer(server) {
      buildHash = Math.random().toString(36).substr(2, 9);
      const hashedCacheName = `${cacheName}-${buildHash}`;
      const swContent = generateServiceWorker(
        hashedCacheName,
        precacheAssets,
        enableUpdateCheck,
        updateEventName
      );

      server.middlewares.use((req, res, next) => {
        const url = (req as any).url || (req as any).originalUrl;
        if (url === "/sw.js") {
          res.setHeader("Content-Type", "application/javascript");
          res.end(swContent);
          return;
        }
        next();
      });
    },

    generateBundle() {
      buildHash = Math.random().toString(36).substr(2, 9);
      const hashedCacheName = `${cacheName}-${buildHash}`;
      const swContent = generateServiceWorker(
        hashedCacheName,
        precacheAssets,
        enableUpdateCheck,
        updateEventName
      );

      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: swContent,
      });
    },

    transformIndexHtml(html) {
      const swRegistrationScript = `
        <script type="module">
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                  console.log('[Offline First] Service Worker registered:', reg);
                  if (reg.active) {
                    reg.update().catch((err) => {
                      if (navigator.onLine) {
                        console.warn('[Offline First] Update check failed:', err);
                      }
                    });
                  }
                })
                .catch(err => console.error('[Offline First] Service Worker registration failed:', err));
            });

            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data.type === '${updateEventName}') {
                console.log('[Offline First] New version available. Refresh the page when ready.');
              }
            });
          }
        </script>
      `;

      return html.replace("</head>", `${swRegistrationScript}</head>`);
    },
  };
}

function generateServiceWorker(
  cacheName: string,
  precacheAssets: string[],
  enableUpdateCheck: boolean,
  updateEventName: string
): string {
  return `
const CACHE_NAME = '${cacheName}';
const PRECACHE_ASSETS = ${JSON.stringify(precacheAssets)};
const ENABLE_UPDATE_CHECK = ${enableUpdateCheck};
const UPDATE_EVENT = '${updateEventName}';

async function getAllClients() {
  return await clients.matchAll({ type: 'window' });
}

async function notifyClients(message) {
  const allClients = await getAllClients();
  allClients.forEach(client => client.postMessage(message));
}

self.addEventListener('install', (event) => {
  console.log('[Offline First] Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Offline First] Precaching assets:', PRECACHE_ASSETS);
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Offline First] Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Offline First] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        if (networkResponse.type === 'opaque') {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          console.log('[Offline First] Serving from cache:', url.pathname);
          return cachedResponse;
        }

        if (request.mode === 'navigate') {
          const indexCache = await caches.match('/index.html');
          if (indexCache) {
            return indexCache;
          }
        }

        return new Response('Offline - Resource not found', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;
}
