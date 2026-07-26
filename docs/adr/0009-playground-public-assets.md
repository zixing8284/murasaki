# Playground public asset boundaries

The playground treats `packages/playground/public/icons/` and `packages/playground/public/wallpaper/` as separate asset domains, even though both are served from Vite's public root.

## Problem

The original playground asset tree mixed icon-sized UI images with larger decorative or content images. Files such as quick-launch icons and desktop icons ended up under `public/img/`, while Windows 98 icon assets live under `public/icons/`. That made it harder for humans and AI agents to know where to add or search for semantic icons.

The icons directory also had inconsistent subdirectory structure (`windows98-icons/png/`, `misc/`, `desktop/`, `media/`) and naming conventions, making it hard to tell what an icon represents or its pixel size.

## Decision

Use `packages/playground/public/icons/` for reusable iconography:

- app icons, title-bar icons, desktop icons, taskbar icons, start-menu icons, toolbar icons, status icons, file-type icons, and system icons
- flat directory with `{descriptive-name}-{size}.png` naming convention (e.g. `calculator-16.png`, `internet-explorer-32.png`)
- all lowercase, kebab-case, no subdirectories
- icon-sized GIF/SVG fallbacks only when no suitable Windows 98 PNG exists

Use `packages/playground/public/wallpaper/` for wallpapers and backgrounds:

- wallpapers, backgrounds, sample pictures, animation GIFs, splash art, and screenshots

Semantic icon assets should not be added to `public/wallpaper/`. If a small symbolic PNG is needed, place it under `public/icons/` and name it by purpose.

## Naming convention

Format: `{descriptive-name}-{size}.png`

- `{descriptive-name}`: lowercase kebab-case, describes what the icon represents
- `{size}`: pixel dimension (16, 20, 32, etc.)
- Examples: `calculator-16.png`, `program-manager-32.png`, `overlay-shortcut-16.png`

## Search guidance

When looking for an icon, search in this order:

1. `packages/playground/public/icons/` for all shared UI icons (flat directory, no subdirectories)
2. `packages/playground/public/wallpaper/` only for content images, backgrounds, and wallpapers

Prefer semantic file names in code constants. A caller should read `ICONS.refresh` or `START_MENU_ICONS.internetExplorer` before reading a raw path.

## AI navigation rule

If an implementation needs a small symbolic image for a button, menu item, launcher, title bar, status indicator, or file type, search `public/icons/` first. Reach for `public/wallpaper/` only after deciding the asset is content, decoration, a wallpaper/background, or an app-specific bitmap.
