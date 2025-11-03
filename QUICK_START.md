# Quick Start Guide - vite-plugin-offline-first

Get offline-first capabilities in your Vite project in 30 seconds!

## Installation

```bash
pnpm add -D vite-plugin-offline-first
```

## Add to Your Vite Config

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  // or vue, svelte, etc.
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [
    react(),
    offlineFirst(),  // That's it!
  ],
})
```

## That's It! 🎉

Your app is now:
- ✅ Works offline after first visit
- ✅ Gets latest version when online
- ✅ Automatically caches assets
- ✅ Cleans up old caches automatically

## Test It Out

### Build
```bash
npm run build
pnpm preview  # Preview production build
```

### Go Offline
1. Open DevTools (F12)
2. Go to **Network** tab
3. Check **Offline** checkbox
4. Refresh page
5. Your app still works! 🚀

### See What's Cached
1. DevTools → **Application** tab
2. **Cache Storage** → Click cache name
3. See all cached files

## Configuration (Optional)

### Customize Cache Name
```typescript
offlineFirst({
  cacheName: 'my-awesome-app',
})
```

### Pre-cache Specific Assets
```typescript
offlineFirst({
  precacheAssets: [
    '/index.html',
    '/css/main.css',
    '/fonts/roboto.woff2',
  ],
})
```

### Full Options
```typescript
offlineFirst({
  cacheName: 'my-app-cache',
  precacheAssets: ['/index.html'],
  enableUpdateCheck: true,
  updateEventName: 'my-app:update',
})
```

## What Gets Generated

### `/dist/sw.js` (Service Worker)
- Intercepts all requests
- Implements network-first strategy
- Caches smart, expires gracefully
- Includes build hash for automatic cache busting

### Injected into HTML
- Auto-registers service worker
- Listens for updates
- Logs useful debug info to console

## How It Works

```
First Visit (Online):
  App Loads → Service Worker Installs → Assets Cached

Offline:
  Service Worker Intercepts Requests → Serves from Cache

Back Online:
  Fresh Content Fetched → Cache Updated → Old Cache Deleted
```

## Debugging

### See Console Logs
```
[Offline First] Service Worker registered
[Offline First] Service Worker installing...
[Offline First] Precaching assets: ['/index.html']
[Offline First] Serving from cache: /styles.css
[Offline First] Deleting old cache: offline-app-cache-abc123
```

### View All Cached URLs
```javascript
// Paste in browser console
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(name, requests.map(r => r.url))
      })
    })
  })
})
```

### Clear All Caches
```javascript
// Paste in browser console
caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))
```

## Common Issues

### Service Worker not showing up?
- Must be HTTPS (localhost is OK)
- Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
- Check DevTools → Application → Service Workers

### Cache not updating?
- Each build has a new cache (with unique hash)
- Old cache automatically cleaned up
- Hard refresh if needed

### Too much being cached?
```typescript
offlineFirst({
  precacheAssets: ['/index.html'],  // Only cache essentials
})
```

## Browser Support

✅ Chrome 51+
✅ Firefox 44+
✅ Safari 11.1+
✅ Edge 79+
✅ All modern mobile browsers

## Next Steps

1. ✅ Install: `pnpm add -D vite-plugin-offline-first`
2. ✅ Add to vite.config.ts
3. ✅ Build: `npm run build`
4. ✅ Test offline in DevTools
5. ✅ Deploy and enjoy! 🚀

## Need More?

- **Detailed Setup:** See `PLUGIN_SETUP.md`
- **Framework Examples:** See `PLUGIN_USAGE_EXAMPLES.md`
- **API Reference:** See `packages/vite-plugin-offline-first/README.md`

---

**Your app now works offline. You're welcome! 🚀**
