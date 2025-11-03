# vite-plugin-offline-first Setup & Architecture

## What Was Created

I've created a reusable **Vite plugin** that packages all the offline-first functionality into a zero-config solution that works across any Vite project (React, Vue, Svelte, Vanilla, etc.).

## Project Structure

```
offline-first/
├── packages/
│   └── vite-plugin-offline-first/
│       ├── src/
│       │   └── index.ts           # Main plugin implementation
│       ├── dist/                  # Compiled plugin (generated)
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md              # Plugin documentation
│
├── src/
│   ├── main.ts                    # App now cleaner (no SW code)
│   ├── counter.ts
│   ├── style.css
│   └── ...
│
├── vite.config.ts                 # Uses the new plugin
├── package.json                   # Local app config
├── PLUGIN_SETUP.md               # This file
└── PLUGIN_USAGE_EXAMPLES.md      # Usage examples for different frameworks
```

## How the Plugin Works

### 1. **Installation**
```bash
pnpm add -D vite-plugin-offline-first
```

### 2. **Configuration** (vite.config.ts)
```typescript
import offlineFirst from 'vite-plugin-offline-first'

export default {
  plugins: [offlineFirst()],
}
```

### 3. **What It Does Automatically**
- ✅ Generates a service worker with smart caching
- ✅ Injects SW registration code into HTML
- ✅ Implements network-first strategy
- ✅ Handles cache busting on new builds
- ✅ Cleans up old caches automatically

## Key Features

### Cache Busting
- Each build generates a unique hash
- Cache name includes this hash: `offline-app-cache-a1b2c3d`
- Old caches auto-deleted when new SW activates
- Users always get latest version when online

### Smart Caching Strategy: Network-First
```
When User Requests Resource:
  1. Try fetching from network (if online)
  2. If successful → Cache it + Return fresh content
  3. If offline/failed → Serve cached version
  4. If nothing cached → Return offline message
```

Benefits:
- 🟢 Online: Always get fresh content
- 🔴 Offline: Seamless offline experience
- 🔄 Updates: Cache auto-updates when online

### Update Detection
- Checks for new versions every 5 minutes
- When online, new assets are fetched and cached immediately
- Old cache cleaned up on new build
- No stale content served to users

## Current App Changes

### Before (Manual Service Worker)
```typescript
// src/main.ts - Had manual registration code
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(...)
    .catch(...)
}
```

### After (Plugin Handles Everything)
```typescript
// src/main.ts - Clean and simple now
import "./style.css"
import { setupCounter } from "./counter.ts"

// That's it! SW registration happens automatically via plugin
document.querySelector('#app')!.innerHTML = `...`
```

## Generated Files at Build Time

When you run `npm run build`, the plugin generates:

### `/dist/sw.js`
The main Service Worker (auto-generated):
- Intercepts all fetch requests
- Implements network-first strategy
- Caches responses intelligently
- Cleans up old caches
- Has unique hash in cache name for busting

### `/dist/sw-update-check.js`
Update detection script (auto-generated)

### Injected into `/dist/index.html`
Service Worker registration code (auto-injected):
```html
<script type="module">
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[Offline First] Service Worker registered:', reg))
      .catch(err => console.error('[Offline First] Service Worker registration failed:', err));
  }
</script>
```

## Configuration Options

All optional with sensible defaults:

```typescript
offlineFirst({
  // Name of cache (hash auto-appended for busting)
  cacheName: 'my-app-cache',

  // Assets to pre-cache on first install
  precacheAssets: ['/index.html'],

  // Enable automatic update checking
  enableUpdateCheck: true,

  // Custom event name for updates
  updateEventName: 'offline-first:update',
})
```

## Using in Other Projects

### React Project
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [
    react(),
    offlineFirst({ cacheName: 'my-react-app' }),
  ],
})
```

### Vanilla Project
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [offlineFirst()],
})
```

See `PLUGIN_USAGE_EXAMPLES.md` for more framework examples.

## Next Steps

### Option 1: Local Development
```bash
# Build the plugin
pnpm plugin:build

# Test the current app
pnpm dev
pnpm build
```

### Option 2: Publish to NPM
```bash
# Prepare plugin for publishing
cd packages/vite-plugin-offline-first
npm run build

# Publish (requires NPM account)
npm publish
```

### Option 3: Use Locally in Other Projects
```bash
# In another Vite project:
pnpm add ../offline-first/packages/vite-plugin-offline-first
```

## Comparison: Before vs After

### Before: Manual Service Worker
```
Pros:
- Full control over caching logic

Cons:
- Have to write SW code manually
- Repeat for every project
- Manual cache busting needed
- Error-prone
- No built-in best practices
```

### After: Plugin-Based
```
Pros:
✅ Zero config needed
✅ Works in any framework
✅ Built-in cache busting
✅ Network-first strategy (best practice)
✅ Auto-cleanup of old caches
✅ Reusable across projects
✅ TypeScript support
✅ Minimal bundle size

Cons:
- Less control (but that's intentional)
- Must use Vite
```

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 51+ | ✅ |
| Firefox | 44+ | ✅ |
| Safari | 11.1+ | ✅ |
| Edge | 79+ | ✅ |
| Opera | 38+ | ✅ |

Service Workers work in all modern browsers.

## Testing Offline Functionality

### Chrome/Edge DevTools
1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Service Workers** section
4. Go to **Network** tab
5. Check **Offline** checkbox
6. Refresh page → Should still work!

### Testing Cache Contents
1. DevTools → **Application** tab
2. **Cache Storage** section
3. View cached files

## Troubleshooting

### Service Worker not registering?
- Check browser console for errors
- Verify site is HTTPS (localhost OK)
- Ensure plugin in vite.config.ts
- Check for browser extensions blocking SWs

### Want to see exact generated SW code?
- Build the project: `pnpm build`
- Check `/dist/sw.js`
- All code is logged with `[Offline First]` prefix

### Need custom caching logic?
- Extend the generated SW by editing the plugin source
- Or create a custom plugin based on this one
- Submit PR if you have improvements!

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           Vite Plugin (vite-plugin-offline-first)   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Hook: transformIndexHtml()                     │
│     ↓ Injects SW registration script               │
│                                                     │
│  2. Hook: generateBundle()                         │
│     ↓ Generates sw.js with network-first logic    │
│     ↓ Generates sw-update-check.js                │
│     ↓ Includes cache name with build hash         │
│                                                     │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│         Generated Service Worker (sw.js)            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  - Install Event → Pre-caches assets               │
│  - Activate Event → Cleans old caches             │
│  - Fetch Event → Network-first strategy            │
│  - Message Event → Handles update checks           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Files to Reference

- **Plugin Code:** `packages/vite-plugin-offline-first/src/index.ts`
- **Plugin Docs:** `packages/vite-plugin-offline-first/README.md`
- **Usage Examples:** `PLUGIN_USAGE_EXAMPLES.md`
- **App Config:** `vite.config.ts` (uses the plugin)
- **App Code:** `src/main.ts` (now clean and simple)

---

**Summary:** You now have a production-ready, reusable Vite plugin that adds offline-first capabilities to any project with zero configuration needed! 🚀
