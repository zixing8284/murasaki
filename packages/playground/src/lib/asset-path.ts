/**
 * Resolve a public asset path against Vite's runtime `base`.
 *
 * Vite rewrites asset URLs inside `index.html` and processed CSS, but it
 * does NOT rewrite plain string literals in JS/TSX (e.g. `'/img/foo.png'`).
 * Wrap such paths in `assetPath()` so they work both locally (`base = '/'`)
 * and when deployed under a subpath (e.g. GitHub Pages at `/murasaki/`).
 */
export function assetPath(path: string): string {
  const base = import.meta.env.BASE_URL // always ends with '/'
  if (path.startsWith('/')) {
    return `${base.replace(/\/$/, '')}${path}`
  }
  return `${base}${path}`
}
