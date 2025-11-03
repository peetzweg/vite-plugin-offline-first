# vite-plugin-offline-first

Vite plugin that adds offline-first capabilities with automatic service worker generation.

## Installation

```bash
pnpm add -D vite-plugin-offline-first
```

## Usage

```typescript
import { defineConfig } from 'vite'
import offlineFirst from 'vite-plugin-offline-first'

export default defineConfig({
  plugins: [offlineFirst()],
})
```

## Options

```typescript
interface OfflineFirstOptions {
  cacheName?: string              // Default: 'offline-app-cache'
  precacheAssets?: string[]       // Default: ['/index.html']
  enableUpdateCheck?: boolean     // Default: true
  updateEventName?: string        // Default: 'offline-first:update'
}
```

## Features

- Automatic service worker generation
- Network-first caching strategy
- Cache busting on build
- Update check on page visit
- Framework agnostic (React, Vue, Svelte, Vanilla)

## How It Works

1. **First visit**: Service worker installs and caches assets
2. **Online**: Network-first, caches successful responses
3. **Offline**: Serves from cache, app continues working
4. **Update check**: Checks for new version on each page visit

## Browser Support

Chrome 51+, Firefox 44+, Safari 11+, Edge 79+

## License

MIT
