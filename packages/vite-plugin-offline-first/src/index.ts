import { Plugin } from 'vite';

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
    cacheName = 'offline-app-cache',
    precacheAssets = ['/index.html'],
    enableUpdateCheck = true,
    updateEventName = 'offline-first:update',
  } = options;

  let buildHash: string;

  return {
    name: 'vite-plugin-offline-first',

    configureServer(server) {
      // Generate service worker for dev mode
      buildHash = Math.random().toString(36).substr(2, 9);
      const hashedCacheName = `${cacheName}-${buildHash}`;
      const swContent = generateServiceWorker(
        hashedCacheName,
        precacheAssets,
        enableUpdateCheck,
        updateEventName
      );

      // Serve service worker in dev mode
      server.middlewares.use((req, res, next) => {
        const url = (req as any).url || (req as any).originalUrl;
        if (url === '/sw.js') {
          res.setHeader('Content-Type', 'application/javascript');
          res.end(swContent);
          return;
        }
        next();
      });
    },

    generateBundle() {
      // Generate a hash based on current timestamp for cache busting
      buildHash = Math.random().toString(36).substr(2, 9);
      const hashedCacheName = `${cacheName}-${buildHash}`;

      // Generate the service worker
      const swContent = generateServiceWorker(
        hashedCacheName,
        precacheAssets,
        enableUpdateCheck,
        updateEventName
      );

      // Emit the service worker file
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: swContent,
      });

      // Generate and emit the update checker script
      const updateCheckerContent = generateUpdateChecker(updateEventName);
      this.emitFile({
        type: 'asset',
        fileName: 'sw-update-check.js',
        source: updateCheckerContent,
      });
    },

    transformIndexHtml(html) {
      // Inject service worker registration script into HTML
      const swRegistrationScript = `
        <script type="module">
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('[Offline First] Service Worker registered:', reg))
                .catch(err => console.error('[Offline First] Service Worker registration failed:', err));
            });

            // Listen for update events
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data.type === '${updateEventName}') {
                console.log('[Offline First] Update available, refreshing...');
                window.location.reload();
              }
            });
          }
        </script>
      `;

      return html.replace('</head>', `${swRegistrationScript}</head>`);
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

// Helper to get all clients
async function getAllClients() {
  return await clients.matchAll({ type: 'window' });
}

// Notify all clients of an update
async function notifyClients(message) {
  const allClients = await getAllClients();
  allClients.forEach(client => client.postMessage(message));
}

// Install event - cache precache assets
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

// Activate event - clean up old caches
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

// Fetch event - network-first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http(s) protocols
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Network-first strategy
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Don't cache non-successful responses
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Don't cache opaque responses (cross-origin)
        if (networkResponse.type === 'opaque') {
          return networkResponse;
        }

        // Cache successful responses
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return networkResponse;
      })
      .catch(async () => {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          console.log('[Offline First] Serving from cache:', url.pathname);
          return cachedResponse;
        }

        // For navigation requests, return cached index.html
        if (request.mode === 'navigate') {
          const indexCache = await caches.match('/index.html');
          if (indexCache) {
            return indexCache;
          }
        }

        // Return offline fallback
        return new Response('Offline - Resource not found', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      })
  );
});

// Message event - check for updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;
}

function generateUpdateChecker(_updateEventName: string): string {
  return `
// Auto-check for updates every 5 minutes
setInterval(() => {
  if (!navigator.serviceWorker.controller) return;

  fetch('/index.html', { cache: 'no-store' })
    .then((response) => {
      if (response.status === 200) {
        console.log('[Offline First] Update check completed');
        // Optionally notify about updates
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_UPDATED'
        });
      }
    })
    .catch(() => {
      console.log('[Offline First] Offline - cannot check for updates');
    });
}, 5 * 60 * 1000);
`;
}
