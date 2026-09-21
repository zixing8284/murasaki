import type { Connect, HtmlTagDescriptor, Plugin } from 'vite'
import type { AssetTier } from './src/lib/asset-tiers'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, posix, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { classifyAsset, MANIFEST_SCAN_ROOTS } from './src/lib/asset-tiers'

// Subpath prefix used by GitHub Pages (e.g. `/murasaki`). Local dev/build
// stays at `/` unless `DEPLOY_BASE_PATH` is set. Always normalize to a
// trailing slash so `import.meta.env.BASE_URL` follows Vite's contract.
const deployBasePath = process.env.DEPLOY_BASE_PATH ?? ''
const base = deployBasePath
  ? `${deployBasePath.replace(/\/+$/, '')}/`
  : '/'

const docsRequestPrefix = `${base.replace(/\/$/, '')}/programs/docs`
const playgroundRoot = dirname(fileURLToPath(import.meta.url))
const embeddedDocsRoot = resolve(playgroundRoot, 'public/programs/docs')
const publicRoot = resolve(playgroundRoot, 'public')
const manifestPublicPath = '/playground-assets.json'
const manifestRequestPath = `${base.replace(/\/$/, '')}${manifestPublicPath}`
const webManifestPublicPath = '/manifest.webmanifest'
const webManifestRequestPath = `${base.replace(/\/$/, '')}${webManifestPublicPath}`

// PWA / installability metadata. Icon `src` and injected `href` values are
// relative so they resolve against Vite's `base` on subpath deployments.
const THEME_COLOR = '#008080'
const APP_NAME = 'murasaki\'s Windows 98 Desktop'
const APP_SHORT_NAME = 'murasaki 98'

export default defineConfig({
  root: '.',
  base,
  plugins: [
    react({ include: /\.(jsx|js|tsx|ts)$/ }),
    babel({ presets: [reactCompilerPreset()] }),
    embeddedDocsRoutePlugin(),
    playgroundAssetManifestPlugin(),
    tailwindcss(),
  ],
  build: {
    assetsInlineLimit: 1024 * 4, // 4kb
  },
})

function embeddedDocsRoutePlugin(): Plugin {
  return {
    name: 'murasaki-embedded-docs-routes',
    configureServer(server) {
      server.middlewares.use(createEmbeddedDocsRouteMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createEmbeddedDocsRouteMiddleware())
    },
  }
}

function createEmbeddedDocsRouteMiddleware(): Connect.NextHandleFunction {
  return (request, response, next) => {
    const docsRoutePath = parseDocsRoutePath(request.url)

    if (docsRoutePath == null) {
      next()
      return
    }

    const htmlFile = resolveEmbeddedDocsHtmlFile(docsRoutePath)

    if (htmlFile == null) {
      next()
      return
    }

    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.end(readFileSync(htmlFile))
  }
}

function parseDocsRoutePath(requestUrl: string | undefined): string | null {
  if (requestUrl == null) {
    return null
  }

  const [rawPath] = requestUrl.split('?')

  if (rawPath !== docsRequestPrefix && !rawPath.startsWith(`${docsRequestPrefix}/`)) {
    return null
  }

  const lastSegment = rawPath.slice(rawPath.lastIndexOf('/') + 1)

  if (lastSegment.includes('.')) {
    return null
  }

  try {
    return decodeURIComponent(rawPath.slice(docsRequestPrefix.length).replace(/^\/+/, ''))
  }
  catch {
    return null
  }
}

function resolveEmbeddedDocsHtmlFile(docsRoutePath: string): string | null {
  const candidates = docsRoutePath === ''
    ? [resolve(embeddedDocsRoot, 'index.html')]
    : [
        resolve(embeddedDocsRoot, docsRoutePath, 'index.html'),
        resolve(embeddedDocsRoot, `${docsRoutePath}.html`),
      ]

  for (const candidate of candidates) {
    if (isInsideEmbeddedDocsRoot(candidate) && existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

function isInsideEmbeddedDocsRoot(filePath: string): boolean {
  return filePath === embeddedDocsRoot || filePath.startsWith(`${embeddedDocsRoot}${sep}`)
}

// ---------------------------------------------------------------------------
// Playground asset manifest + PWA web app manifest
//
// Scans the public dirs in `MANIFEST_SCAN_ROOTS`, hashes each file, and
// classifies it into a tier via the single `asset-tiers` policy. At build
// time the hashed app-shell outputs (JS/CSS/HTML) are added as the `shell`
// tier so the service worker can precache them for offline boot. The
// manifest is also served by the dev/preview middleware so dev runs
// exercise the same fetch path; the startup provisioner and service worker
// both read it.
//
// The same plugin emits the PWA `manifest.webmanifest` and injects its
// `<link rel="manifest">` / theme-color / apple-touch-icon tags into the
// HTML shell, all resolved relative to Vite's `base`.
// ---------------------------------------------------------------------------

interface ManifestAsset {
  path: string
  size: number
  hash: string
  group: AssetTier
}

interface PlaygroundAssetsManifest {
  version: string
  assets: ManifestAsset[]
  groups: Record<AssetTier, string[]>
}

function playgroundAssetManifestPlugin(): Plugin {
  const buildBaseManifest = (): PlaygroundAssetsManifest => {
    const assets: ManifestAsset[] = []

    for (const root of MANIFEST_SCAN_ROOTS) {
      const absoluteRoot = resolve(publicRoot, root)
      if (!existsSync(absoluteRoot))
        continue
      walkFiles(absoluteRoot, (file) => {
        const stat = statSync(file)
        const buffer = readFileSync(file)
        const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 16)
        const relPath = `/${relative(publicRoot, file).split(sep).join(posix.sep)}`
        assets.push({ path: relPath, size: stat.size, hash, group: classifyAsset(relPath, stat.size) })
      })
    }

    assets.sort((a, b) => a.path.localeCompare(b.path))

    return {
      version: '',
      assets,
      groups: {
        shell: [],
        critical: assets.filter(a => a.group === 'critical').map(a => a.path),
        warm: assets.filter(a => a.group === 'warm').map(a => a.path),
        programs: assets.filter(a => a.group === 'programs').map(a => a.path),
      },
    }
  }

  // Finalize with the app-shell tier and a version that folds in the shell
  // filenames — so a code-only change (new hashed JS/CSS) invalidates the
  // runtime cache even when no image changed.
  const finalize = (manifest: PlaygroundAssetsManifest, shell: string[]): string => {
    manifest.groups.shell = shell
    manifest.version = createHash('sha1')
      .update([...manifest.assets.map(a => `${a.path}:${a.hash}`), ...shell].join('\n'))
      .digest('hex')
      .slice(0, 16)
    return JSON.stringify(manifest, null, 2)
  }

  const assetManifestHandler: Connect.NextHandleFunction = (request, response, next) => {
    if (request.url == null)
      return next()
    const [requestPath] = request.url.split('?')
    if (requestPath !== manifestRequestPath)
      return next()
    // Dev has no build outputs, so the shell tier is empty here.
    response.statusCode = 200
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Cache-Control', 'no-cache')
    response.end(finalize(buildBaseManifest(), []))
  }

  const webManifestHandler: Connect.NextHandleFunction = (request, response, next) => {
    if (request.url == null)
      return next()
    const [requestPath] = request.url.split('?')
    if (requestPath !== webManifestRequestPath)
      return next()
    response.statusCode = 200
    response.setHeader('Content-Type', 'application/manifest+json; charset=utf-8')
    response.setHeader('Cache-Control', 'no-cache')
    response.end(JSON.stringify(buildWebManifest(), null, 2))
  }

  // Only needed in dev, where there are no built files to serve. In preview /
  // production the emitted `playground-assets.json` (with its `shell` tier)
  // and `manifest.webmanifest` are served statically, so the middleware must
  // not shadow them with a dev-shaped, shell-less manifest.
  const attachDevMiddleware = (server: { middlewares: Connect.Server }): void => {
    server.middlewares.use(assetManifestHandler)
    server.middlewares.use(webManifestHandler)
  }

  return {
    name: 'murasaki-playground-asset-manifest',
    configureServer(server) {
      attachDevMiddleware(server)
    },
    transformIndexHtml() {
      return webManifestHtmlTags()
    },
    generateBundle(_options, bundle) {
      const shell = collectShellAssets(bundle)
      this.emitFile({
        type: 'asset',
        fileName: manifestPublicPath.replace(/^\//, ''),
        source: finalize(buildBaseManifest(), shell),
      })
      this.emitFile({
        type: 'asset',
        fileName: webManifestPublicPath.replace(/^\//, ''),
        source: JSON.stringify(buildWebManifest(), null, 2),
      })
    },
  }
}

// App-shell tier: the hashed JS/CSS and HTML entry points that must be
// precached for an offline cold boot. Public assets (icons, wallpaper, …)
// are copied outside the bundle and handled by their own tiers, so they
// never appear here. `index.html` is added explicitly because Vite emits it
// after this hook runs, so it is not yet in the bundle.
function collectShellAssets(bundle: Record<string, unknown>): string[] {
  const shell = new Set<string>(['/index.html'])
  for (const fileName of Object.keys(bundle)) {
    if (/\.(?:js|css)$/.test(fileName) || fileName.endsWith('.html')) {
      shell.add(`/${fileName}`)
    }
  }
  return [...shell].sort((a, b) => a.localeCompare(b))
}

function buildWebManifest(): Record<string, unknown> {
  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: 'A Windows 98 desktop built with @murasaki-io/react98.',
    start_url: './',
    scope: './',
    display: 'standalone',
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}

function webManifestHtmlTags(): HtmlTagDescriptor[] {
  return [
    { tag: 'link', attrs: { rel: 'manifest', href: 'manifest.webmanifest' }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'theme-color', content: THEME_COLOR }, injectTo: 'head' },
    { tag: 'link', attrs: { rel: 'apple-touch-icon', href: 'icons/apple-touch-icon-180.png' }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: APP_SHORT_NAME }, injectTo: 'head' },
  ]
}

function walkFiles(dir: string, onFile: (filePath: string) => void): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) {
      continue
    }
    const child = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(child, onFile)
    }
    else if (entry.isFile()) {
      onFile(child)
    }
  }
}
