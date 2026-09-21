/**
 * Single source of truth for asset tiering.
 *
 * A "tier" is the one concept the whole asset system turns on: every asset
 * belongs to exactly one tier, and each tier has exactly one provisioning
 * policy. PWA offline, splash preload, and background icon warming are all
 * outcomes of these tiers rather than separate subsystems.
 *
 * This module is isomorphic — it is imported by the build-time Vite manifest
 * plugin (Node) and by the runtime provisioner (browser), so it must stay
 * free of any environment-specific globals.
 *
 * | Tier       | Contents                              | Policy                                   |
 * | ---------- | ------------------------------------- | ---------------------------------------- |
 * | `shell`    | Build outputs (JS/CSS/HTML)           | SW precache on install + offline nav     |
 * | `critical` | First-paint art (icons, boot wallpaper, cursors) | Blocking paint decode + cache-first offline |
 * | `warm`     | Second-tier / large images            | Background preload + cache-first offline |
 * | `programs` | Embedded apps (docs/JSPaint/Webamp)   | Runtime stale-while-revalidate           |
 */

export type AssetTier = 'shell' | 'critical' | 'warm' | 'programs'

/** Public directories scanned by the build-time manifest plugin. */
export const MANIFEST_SCAN_ROOTS = ['icons', 'wallpaper', 'cursor'] as const

/** Public-path prefixes whose assets are second-tier (warmed after boot). */
const WARM_PATH_PREFIXES = ['/wallpaper/'] as const

/**
 * Paths forced into `critical` even when a broader rule would defer them —
 * e.g. the desktop wallpaper, which is large but visible on first paint.
 */
export const CRITICAL_OVERRIDES = new Set<string>(['/wallpaper/SoapBubbles.bmp'])

/** Images larger than this are warmed in the background, never blocking paint. */
const LARGE_ASSET_BYTES = 24 * 1024

const IMAGE_EXTENSIONS = new Set(['png', 'gif', 'jpg', 'jpeg', 'webp', 'bmp', 'svg', 'ico'])

/** Whether a public path points at a decodable raster/vector image. */
export function isImageAsset(publicPath: string): boolean {
  const ext = publicPath.slice(publicPath.lastIndexOf('.') + 1).toLowerCase()
  return IMAGE_EXTENSIONS.has(ext)
}

/**
 * Classify a scanned public asset into its tier. `size` (bytes) lets large
 * images fall back to `warm` so they never block first paint.
 */
export function classifyAsset(publicPath: string, size = 0): AssetTier {
  if (publicPath.startsWith('/programs/')) {
    return 'programs'
  }
  if (CRITICAL_OVERRIDES.has(publicPath)) {
    return 'critical'
  }
  for (const prefix of WARM_PATH_PREFIXES) {
    if (publicPath.startsWith(prefix)) {
      return 'warm'
    }
  }
  if (isImageAsset(publicPath) && size > LARGE_ASSET_BYTES) {
    return 'warm'
  }
  return 'critical'
}
