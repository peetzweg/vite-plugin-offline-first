# vite-plugin-offline-first

A powerful Vite plugin that adds offline-first capabilities to your React, Vue, Svelte, or vanilla JavaScript projects. Automatically generates a Service Worker with intelligent caching, cache busting, and network-first strategy.

## Features

✅ **Automatic Service Worker Generation** - No manual SW code needed
✅ **Smart Caching** - Network-first strategy with cache fallback
✅ **Cache Busting** - Automatically invalidates old caches on new builds
✅ **Zero Config** - Works out of the box with sensible defaults
✅ **Framework Agnostic** - Works with React, Vue, Svelte, vanilla JS, etc.
✅ **TypeScript Support** - Built with TypeScript, includes type definitions
✅ **Auto HTML Injection** - Registers service worker automatically

## Installation

### npm
```bash
npm install --save-dev vite-plugin-offline-first
```

### pnpm
```bash
pnpm add -D vite-plugin-offline-first
```

### yarn
```bash
yarn add --dev vite-plugin-offline-first
```

## Usage

### Basic Setup (React)

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [react(), offlineFirst()],
})
```

### Basic Setup (Vanilla JS)

```typescript
import { defineConfig } from 'vite'
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [offlineFirst()],
})
```

That's it! The plugin will:
1. Generate a service worker automatically
2. Inject registration code into your HTML
3. Implement network-first caching strategy
4. Handle cache busting on new builds

## Configuration

### Options

```typescript
interface OfflineFirstOptions {
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
   * Whether to enable automatic update checking
   * @default true
   */
  enableUpdateCheck?: boolean;

  /**
   * Custom event name for update notifications
   * @default 'offline-first:update'
   */
  updateEventName?: string;
}
```

### Example Configuration

```typescript
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [
    offlineFirst({
      cacheName: 'my-app-cache',
      precacheAssets: ['/index.html', '/styles.css'],
      enableUpdateCheck: true,
      updateEventName: 'my-app:update',
    }),
  ],
})
```

## How It Works

### Caching Strategy: Network-First with Cache Fallback

1. **Online, fetching resource:**
   - Tries to fetch from network first
   - If successful (HTTP 200), caches the response
   - Returns the fresh response immediately

2. **Offline, fetching resource:**
   - Network request fails
   - Falls back to cached version
   - If not in cache, serves offline fallback

3. **Cache Busting:**
   - Each build generates a unique hash
   - Cache name is automatically suffixed with this hash
   - Old caches are automatically cleaned up on activation
   - Users always get the latest version when online

### Service Worker Lifecycle

```
1. Install → Pre-cache specified assets
2. Activate → Clean up old caches
3. Fetch → Network-first with fallback
```

## Automatic Update Detection

The plugin automatically:
- Fetches `index.html` every 5 minutes to check for updates
- When online, new resources are cached immediately
- When offline, cached resources are served seamlessly
- Old cache is removed when a new build is activated

## TypeScript Support

Full TypeScript support is included:

```typescript
import offlineFirst, {
  OfflineFirstOptions
} from 'vite-plugin-offline-first'

const config: OfflineFirstOptions = {
  cacheName: 'my-app',
  precacheAssets: ['/index.html'],
}

export default defineConfig({
  plugins: [offlineFirst(config)],
})
```

## Browser Support

- ✅ Chrome/Edge 51+
- ✅ Firefox 44+
- ✅ Safari 11+
- ✅ Opera 38+

Service Workers are supported in all modern browsers.

## What Gets Generated

The plugin generates two files:

### `/sw.js` - Service Worker
- Handles all caching logic
- Implements network-first strategy
- Cleans up old caches
- Logs actions to console

### `/sw-update-check.js` - Update Checker
- Periodically checks for new versions
- Embedded update detection logic

## Real-World Example

Your app is now offline-capable:

1. **First visit (online):**
   - App loads normally
   - Service worker installs
   - Assets are cached

2. **User goes offline:**
   - App continues to work!
   - All cached resources serve instantly

3. **User reconnects (online):**
   - New assets fetch from network
   - Cache updates automatically
   - User gets latest version

## Debugging

The service worker logs useful information to the browser console:

```
[Offline First] Service Worker registered: ServiceWorkerRegistration
[Offline First] Service Worker installing...
[Offline First] Precaching assets: ['/index.html']
[Offline First] Serving from cache: /styles.css
[Offline First] Deleting old cache: offline-app-cache-abc123
```

To inspect service workers in your browser:
- Chrome/Edge: DevTools → Application → Service Workers
- Firefox: about:debugging → This Firefox → Service Workers

## Troubleshooting

### Service Worker not registering?
- Check that your site is HTTPS (or localhost)
- Look at console for error messages
- Verify the plugin is included in your vite.config

### Cache not updating?
- Hard refresh with `Ctrl+Shift+R` or `Cmd+Shift+R`
- Clear cache in DevTools → Application → Clear Site Data
- Check for browser extensions blocking service workers

### Too aggressive caching?
- Use the `precacheAssets` option to be selective
- Adjust the update check interval in generated SW
- Disable with `enableUpdateCheck: false`

## License

MIT
