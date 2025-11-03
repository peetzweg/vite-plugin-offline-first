# vite-plugin-offline-first Usage Examples

This document shows how to use the `vite-plugin-offline-first` plugin in various project setups.

## Overview

The plugin automatically:
1. **Generates a Service Worker** - No manual SW code needed
2. **Registers the SW** - Auto-injects registration into HTML
3. **Implements Network-First Strategy** - Fresh content online, cached offline
4. **Handles Cache Busting** - Old caches auto-cleared on new builds
5. **Updates Detection** - Checks for new versions every 5 minutes

## Installation

```bash
npm install --save-dev vite-plugin-offline-first
# or
pnpm add -D vite-plugin-offline-first
# or
yarn add --dev vite-plugin-offline-first
```

---

## Example 1: Vanilla JavaScript + Vite

### Setup

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [
    offlineFirst({
      cacheName: 'my-vanilla-app',
    }),
  ],
})
```

**src/main.ts:**
```typescript
import './style.css'

document.querySelector('#app')!.innerHTML = `
  <h1>Offline-First Vanilla App</h1>
  <p>This works online AND offline!</p>
`
```

That's it! Your app is now offline-capable.

---

## Example 2: React + Vite

### Setup

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [
    react(),
    offlineFirst({
      cacheName: 'my-react-app',
      precacheAssets: ['/index.html'],
    }),
  ],
})
```

**src/App.tsx:**
```tsx
export default function App() {
  return (
    <div>
      <h1>Offline-First React App</h1>
      <p>Works online and offline!</p>
    </div>
  )
}
```

**package.json (dev dependency already added):**
```json
{
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.0.0",
    "vite-plugin-offline-first": "^0.1.0"
  }
}
```

---

## Example 3: Vue + Vite

### Setup

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [
    vue(),
    offlineFirst({
      cacheName: 'my-vue-app',
    }),
  ],
})
```

**src/App.vue:**
```vue
<template>
  <div>
    <h1>Offline-First Vue App</h1>
    <p>Works online and offline!</p>
  </div>
</template>

<script setup lang="ts">
// Your app code
</script>
```

---

## Example 4: Svelte + Vite

### Setup

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import { svelte } from 'vite-plugin-svelte'
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [
    svelte(),
    offlineFirst({
      cacheName: 'my-svelte-app',
    }),
  ],
})
```

**src/App.svelte:**
```svelte
<h1>Offline-First Svelte App</h1>
<p>Works online and offline!</p>

<style>
  :global(body) {
    margin: 0;
  }
</style>
```

---

## Configuration Examples

### Minimal Config
```typescript
import offlineFirst from 'vite-plugin-offline-first'

export default {
  plugins: [offlineFirst()],
}
```

### Full Config
```typescript
import offlineFirst from 'vite-plugin-offline-first'

export default {
  plugins: [
    offlineFirst({
      cacheName: 'my-app-cache',
      precacheAssets: [
        '/index.html',
        '/styles.css',
        '/fonts/roboto.woff2',
      ],
      enableUpdateCheck: true,
      updateEventName: 'my-app:update-available',
    }),
  ],
}
```

### Per-Framework Config

**React with TypeScript:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [
    react(),
    offlineFirst({
      cacheName: 'react-app',
      precacheAssets: ['/index.html'],
      enableUpdateCheck: true,
    }),
  ],
})
```

---

## What Gets Generated

When you build (`npm run build`), the plugin generates:

### `/dist/sw.js`
The Service Worker that:
- Intercepts all network requests
- Caches successful responses
- Serves cached content when offline
- Automatically cleans up old caches

### `/dist/sw-update-check.js`
Script that periodically checks for updates (embedded in the SW)

### Injected into `index.html`
Service Worker registration code:
```html
<script type="module">
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[Offline First] Service Worker registered:', reg))
        .catch(err => console.error('[Offline First] Service Worker registration failed:', err));
    });
  }
</script>
```

---

## How It Works in Production

### 1. First Visit (User Online)
```
User visits site
     ↓
App loads from network
     ↓
Service Worker installs
     ↓
Assets cached locally
     ↓
✅ App ready for offline use
```

### 2. Offline Visit
```
User is offline
     ↓
Service Worker intercepts requests
     ↓
Assets served from cache
     ↓
✅ App works perfectly offline
```

### 3. Back Online
```
User reconnects to internet
     ↓
New requests fetch from network
     ↓
Cache automatically updated
     ↓
Old cache cleaned up
     ↓
✅ User gets latest version
```

---

## Caching Strategy: Network-First

The plugin uses a **network-first with cache fallback** strategy:

```
User requests resource
     ↓
Is network available?
     ├─ YES → Fetch from network
     │         ├─ Success? → Cache it + Return
     │         └─ Fail? → Try cache
     │
     └─ NO → Fetch from cache
             └─ Found? → Return
             └─ Not found? → Return offline message
```

This ensures:
- ✅ Users always get fresh content when online
- ✅ App works seamlessly offline with cached data
- ✅ Cache updates automatically
- ✅ No manual SW code needed

---

## Debugging

### Check Service Worker Status
```javascript
// In browser console
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => console.log(reg)))
```

### View Cache Contents
```javascript
// In browser console
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(`Cache "${name}":`, requests.map(r => r.url))
      })
    })
  })
})
```

### Clear All Caches
```javascript
// In browser console
caches.keys().then(names => {
  Promise.all(names.map(name => caches.delete(name)))
})
```

### DevTools Inspection
- **Chrome/Edge:** DevTools → Application → Service Workers
- **Firefox:** about:debugging → Service Workers
- **Safari:** Develop → Show Web Inspector → Resources

---

## Troubleshooting

### App not working offline?
1. Check Network tab shows SW registered
2. Verify cache has content (Application tab)
3. Check console for errors
4. Try hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

### Cache not updating after deploy?
1. Cache name has a hash - builds have unique caches
2. Old cache automatically deleted on new activation
3. Hard refresh if needed
4. Clear site data if stuck: Application tab → Clear Site Data

### Service Worker not registering?
1. Must be HTTPS in production (localhost OK)
2. Check console for registration errors
3. Verify plugin is in vite.config
4. Check browser extensions aren't blocking SWs

### Too much being cached?
Use `precacheAssets` to limit what's cached:
```typescript
offlineFirst({
  precacheAssets: ['/index.html'], // Only cache essentials
})
```

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome/Edge | ✅ 51+ |
| Firefox | ✅ 44+ |
| Safari | ✅ 11.1+ |
| Opera | ✅ 38+ |
| Mobile Chrome | ✅ |
| Mobile Firefox | ✅ |
| Mobile Safari | ✅ |

---

## Advanced: Custom Update Handler

Listen for updates in your app:

```typescript
// React example
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'offline-first:update') {
        // Show toast or notification
        showUpdateNotification()
      }
    })
  }
}, [])
```

---

## Performance Impact

**Build time:** ~10-50ms (minimal)
**Bundle size:** Adds ~2KB gzipped to final build
**Runtime impact:** Negligible - SW runs in separate thread

---

## Next Steps

1. ✅ Add plugin to your Vite config
2. ✅ Install the plugin: `pnpm add -D vite-plugin-offline-first`
3. ✅ Run build: `npm run build`
4. ✅ Test offline in DevTools (Network → Offline)
5. ✅ Deploy and enjoy offline-first capabilities!

Happy building! 🚀
