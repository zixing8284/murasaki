# Playground public asset boundaries

The playground treats `packages/playground/public/icons/` and `packages/playground/public/img/` as separate asset domains, even though both are served from Vite's public root. Keep the directory name `img`; do not rename it to `imgs`.

## Problem

The original playground asset tree mixed icon-sized UI images with larger decorative or content images. Files such as quick-launch icons and desktop icons ended up under `public/img/`, while Windows 98 icon assets live under `public/icons/`. That made it harder for humans and AI agents to know where to add or search for semantic icons.

Pluralizing `img` to `imgs` would create public URL churn without making the boundary clearer. `img` is a common static-asset directory name, and this repo can make the distinction through ownership rules instead of a rename.

## Decision

Use `packages/playground/public/icons/` for reusable iconography:

- app icons, title-bar icons, desktop icons, taskbar icons, start-menu icons, toolbar icons, status icons, file-type icons, and system icons
- source icon packs such as `icons/windows98-icons/png/`
- icon-sized GIF/SVG fallbacks only when no suitable Windows 98 PNG exists

Use `packages/playground/public/img/` for image content and app-specific bitmaps:

- wallpapers, backgrounds, sample pictures, animation GIFs, splash art, media-player artwork, and screenshots
- app-local image sets that are not meant to be searched as shared UI icons

Semantic icon assets should not be added to `public/img/`. If a small symbolic PNG is needed, place it under `public/icons/` and name it by purpose.

## Search guidance

When looking for an icon, search in this order:

1. `packages/playground/public/icons/windows98-icons/png/` for Win98 system/app/file/action icons.
2. `packages/playground/public/icons/` for curated or app-specific icons that have no suitable Win98 PNG replacement.
3. `packages/playground/public/img/` only for content images, backgrounds, wallpapers, and app-specific bitmaps.

Prefer semantic file names in code constants. A caller should read `ICONS.refresh` or `START_MENU_ICONS.internetExplorer` before reading a raw path.

## Current fallback rule

Most shell icons should use `icons/windows98-icons/png/`. Custom icons are acceptable under `public/icons/` only for app identity or product-specific artwork that the Windows 98 icon pack does not cover, such as Webamp.

## AI navigation rule

If an implementation needs a small symbolic image for a button, menu item, launcher, title bar, status indicator, or file type, search `public/icons/` first. Reach for `public/img/` only after deciding the asset is content, decoration, a wallpaper/background, or an app-specific bitmap.
