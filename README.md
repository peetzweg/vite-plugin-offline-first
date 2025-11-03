# offline-first

A pnpm monorepo containing the `vite-plugin-offline-first` plugin and an example application.

## Structure

```
packages/
  vite-plugin-offline-first/  # The plugin package
apps/
  example/                     # Example app using the plugin
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Run example app
pnpm dev

# Build everything
pnpm build
```

## Workspace Commands

- `pnpm dev` - Run example app dev server
- `pnpm build` - Build plugin and example app
- `pnpm preview` - Preview production build
- `pnpm -F example dev` - Run specific workspace
- `pnpm -F vite-plugin-offline-first build` - Build plugin only

## Documentation

- [Plugin README](./packages/vite-plugin-offline-first/README.md) - Plugin API and usage
- [Example README](./apps/example/README.md) - Example app guide

## License

MIT

