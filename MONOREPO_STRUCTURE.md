# Offline-First Monorepo Structure

This is a proper pnpm monorepo with workspaces for the `vite-plugin-offline-first` plugin and an example application.

## 📁 Directory Structure

```
offline-first/
├── pnpm-workspace.yaml                 # Workspace configuration
├── package.json                        # Root monorepo package
├── pnpm-lock.yaml                      # Unified lock file
│
├── packages/                           # Shared packages
│   └── vite-plugin-offline-first/      # The plugin package
│       ├── src/
│       │   └── index.ts                # Main plugin (TypeScript)
│       ├── dist/                       # Compiled output
│       ├── package.json                # Plugin package definition
│       ├── tsconfig.json
│       └── README.md                   # Plugin API docs
│
├── apps/                               # Applications
│   └── example/                        # Example app using the plugin
│       ├── src/
│       │   ├── main.ts
│       │   ├── counter.ts
│       │   ├── style.css
│       │   ├── typescript.svg
│       │   └── vite-env.d.ts
│       ├── public/
│       │   └── vite.svg
│       ├── index.html
│       ├── vite.config.ts              # Uses plugin via workspace:*
│       ├── tsconfig.json
│       ├── package.json                # Depends on plugin
│       └── README.md
│
└── Documentation files (root level)
    ├── START_HERE.md
    ├── README_PLUGIN.md
    ├── QUICK_START.md
    ├── PLUGIN_SETUP.md
    ├── PLUGIN_USAGE_EXAMPLES.md
    ├── DELIVERY_SUMMARY.txt
    └── MONOREPO_STRUCTURE.md           # This file
```

## 🎯 Monorepo Features

### Workspace Configuration (`pnpm-workspace.yaml`)

```yaml
packages:
  - 'packages/*'     # Plugin packages
  - 'apps/*'         # Applications
```

This tells pnpm that packages in both `packages/` and `apps/` are part of the monorepo.

### Root Package Configuration

The root `package.json` provides convenience commands that run across all workspaces:

```bash
pnpm install      # Install all dependencies
pnpm dev          # Run dev server for example app
pnpm build        # Build plugin and example app
pnpm preview      # Preview production build
```

### Plugin Package

**Location:** `packages/vite-plugin-offline-first/`

```json
{
  "name": "vite-plugin-offline-first",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

This package:
- Can be published to npm
- Is available via `workspace:*` to other packages in the monorepo
- Has its own `package.json`, `tsconfig.json`, and build process

### Example App

**Location:** `apps/example/`

```json
{
  "name": "example",
  "devDependencies": {
    "vite-plugin-offline-first": "workspace:*"
  }
}
```

The `workspace:*` dependency means:
- Use the plugin from the local workspace
- When published, converts to a version number
- Perfect for development and testing

## 🚀 Commands

### Root Level Commands

```bash
# Install all dependencies (monorepo-wide)
pnpm install

# Run dev server
pnpm dev

# Build everything
pnpm build

# Preview production build
pnpm preview
```

### Workspace-Specific Commands

```bash
# Run command in specific workspace
pnpm -F example dev           # Dev server for example
pnpm -F vite-plugin-offline-first build  # Build just the plugin

# Or navigate to the app/package directly
cd apps/example && pnpm dev
cd packages/vite-plugin-offline-first && pnpm build
```

## 📦 Dependency Resolution

### How pnpm Finds Dependencies

1. **Local Check First:** When you `import 'vite-plugin-offline-first'`
2. **Workspace Lookup:** pnpm finds it in `packages/vite-plugin-offline-first/`
3. **Symlink:** Creates a symlink from `node_modules/` to the local package
4. **TypeScript:** Full type support works seamlessly

### The `workspace:*` Protocol

```json
{
  "devDependencies": {
    "vite-plugin-offline-first": "workspace:*"
  }
}
```

- `workspace:` tells pnpm "use this from the local workspace"
- `*` means "any version matching the package"
- On publish, converts to the actual version number
- Ensures everyone uses the same version during development

## 🔄 Workflow

### Development

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Dev Server**
   ```bash
   pnpm dev
   ```
   Opens example app at `http://localhost:5174`

3. **Make Changes**
   - Edit plugin: `packages/vite-plugin-offline-first/src/index.ts`
   - Edit app: `apps/example/src/`
   - Changes hot-reload automatically

4. **Test Offline**
   - DevTools → Application → Service Workers
   - DevTools → Network → Offline
   - Refresh page

### Build

1. **Build Everything**
   ```bash
   pnpm build
   ```
   - Builds plugin to `packages/vite-plugin-offline-first/dist/`
   - Builds app to `apps/example/dist/`

2. **Preview Production**
   ```bash
   pnpm preview
   ```

### Publishing

1. **Build Plugin**
   ```bash
   cd packages/vite-plugin-offline-first
   npm run build
   ```

2. **Publish to npm**
   ```bash
   npm publish
   ```
   The `workspace:*` dependency automatically converts to a version number.

## 📊 Monorepo Benefits

| Benefit | Why It Matters |
|---------|----------------|
| **Single Lock File** | Everyone uses same versions |
| **Workspace:* Protocol** | Symlinks to local code during dev |
| **Unified Scripts** | Run commands across all packages |
| **Easy to Test** | Example app uses the plugin immediately |
| **Ready to Publish** | Plugin is independent and publishable |
| **TypeScript Support** | Full type support across workspaces |
| **Dependency Sharing** | Avoid duplicating dependencies |

## 🔍 Inspecting the Monorepo

### See All Workspaces
```bash
pnpm list --depth=0
```

### See Dependency Graph
```bash
pnpm ls vite-plugin-offline-first
```

### See What Each Workspace Has
```bash
pnpm -r list --depth=0
```

## ⚙️ Advanced Usage

### Running Commands in Specific Workspaces

```bash
# Run dev only in example
pnpm -F example dev

# Run build only in plugin
pnpm -F vite-plugin-offline-first build

# Run in all workspaces
pnpm -r test

# Run in all, parallel
pnpm -r --parallel test
```

### Filter Options

```bash
pnpm -F example ...           # By name
pnpm --filter example ...     # Long form
pnpm -F "example" dev        # With spaces

pnpm -r dev                   # All workspaces
```

## 🎓 Understanding `workspace:*`

When you use `workspace:*`, pnpm does something special:

**During Development:**
```
node_modules/vite-plugin-offline-first/
  → symlink → ../../packages/vite-plugin-offline-first/
```

**On Publish:**
```json
{
  "devDependencies": {
    "vite-plugin-offline-first": "^0.1.0"
  }
}
```

This means:
- No need to build plugin before using it
- Changes in plugin are immediately reflected
- Perfect for tight feedback loop

## 🚨 Troubleshooting

### "Cannot find module 'vite-plugin-offline-first'"

1. Make sure you're in the monorepo root
2. Run `pnpm install`
3. Verify the plugin exists: `ls packages/vite-plugin-offline-first/`

### Changes in plugin not appearing

1. Vite has hot reload, should work automatically
2. If not, restart dev server
3. Check that plugin changes are in `src/index.ts` not `dist/`

### Getting "workspace not found"

1. Check `pnpm-workspace.yaml` has correct paths
2. Verify `package.json` exists in each workspace
3. Run `pnpm install` again

## 📖 More Information

- **Monorepo Setup Guide:** See `MONOREPO_STRUCTURE.md` (this file)
- **Plugin Documentation:** See `packages/vite-plugin-offline-first/README.md`
- **Example App:** See `apps/example/README.md`
- **Quick Start:** See `QUICK_START.md` at root
- **Full Overview:** See `README_PLUGIN.md` at root

## ✨ Next Steps

1. **Explore:** `cd apps/example && pnpm dev`
2. **Experiment:** Modify `packages/vite-plugin-offline-first/src/index.ts`
3. **Test Offline:** See changes immediately
4. **Publish:** When ready, publish plugin to npm

---

**Your monorepo is ready to go!** 🚀

The structure supports both:
- Local development with hot reload
- Publishing the plugin independently to npm
- Using as a reference for other monorepo projects
