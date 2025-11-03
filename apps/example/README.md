# Offline-First Example App

A sample application demonstrating the `vite-plugin-offline-first` plugin.

## Features

- ✅ Vite + TypeScript + Vanilla JS
- ✅ Offline-first PWA support
- ✅ Automatic Service Worker generation
- ✅ Network-first caching strategy
- ✅ Cache busting on every build

## Development

```bash
pnpm install
pnpm dev
```

The app will be available at `http://localhost:5174`

## Build

```bash
pnpm build
pnpm preview
```

## Testing Offline

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Service Workers** (you should see it registered)
4. Go to **Network** tab
5. Check **Offline** checkbox
6. Refresh the page
7. Your app still works! 🚀

## How It Works

The app uses the `vite-plugin-offline-first` plugin which:

- Automatically generates a Service Worker
- Implements network-first caching (fresh when online, cached offline)
- Handles cache busting with unique hash per build
- Auto-registers service worker in HTML

See the root `README_PLUGIN.md` for full plugin documentation.
