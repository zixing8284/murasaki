import type { Connect, Plugin } from 'vite'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, posix, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
// Playground asset manifest
//
// Scans `public/icons` and `public/img` for static images, hashes each
// file, and emits a versioned `playground-assets.json` at build time —
// also served by the dev/preview middleware so dev runs exercise the
// same fetch path. The startup preloader and service worker both read
// this manifest to drive icon caching.
// ---------------------------------------------------------------------------

interface ManifestAsset {
  path: string
  size: number
  hash: string
  group: 'critical' | 'warm' | 'programs'
}

interface PlaygroundAssetsManifest {
  version: string
  assets: ManifestAsset[]
  groups: {
    critical: string[]
    warm: string[]
    programs: string[]
  }
}

const MANIFEST_SCAN_ROOTS = ['icons', 'img'] as const
const WARM_PATH_PREFIXES = ['/img/'] as const
// Paths under `WARM_PATH_PREFIXES` that should still be critical because
// they are visible immediately after boot (e.g. the desktop wallpaper).
const CRITICAL_OVERRIDES = new Set<string>(['/img/animspace.gif'])

function playgroundAssetManifestPlugin(): Plugin {
  let cachedManifest: { json: string, etag: string } | null = null

  const buildManifest = (): PlaygroundAssetsManifest => {
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
        assets.push({
          path: relPath,
          size: stat.size,
          hash,
          group: classifyAsset(relPath),
        })
      })
    }

    assets.sort((a, b) => a.path.localeCompare(b.path))
    const version = createHash('sha1')
      .update(assets.map(a => `${a.path}:${a.hash}`).join('\n'))
      .digest('hex')
      .slice(0, 16)

    const groups = {
      critical: assets.filter(a => a.group === 'critical').map(a => a.path),
      warm: assets.filter(a => a.group === 'warm').map(a => a.path),
      programs: assets.filter(a => a.group === 'programs').map(a => a.path),
    }

    return { version, assets, groups }
  }

  const getCached = (): { json: string, etag: string } => {
    if (cachedManifest)
      return cachedManifest
    const manifest = buildManifest()
    const json = JSON.stringify(manifest, null, 2)
    const etag = `"${manifest.version}"`
    cachedManifest = { json, etag }
    return cachedManifest
  }

  const handler: Connect.NextHandleFunction = (request, response, next) => {
    if (request.url == null)
      return next()
    const [requestPath] = request.url.split('?')
    if (requestPath !== manifestRequestPath)
      return next()
    cachedManifest = null // always refresh in dev so newly-added files appear
    const { json, etag } = getCached()
    response.statusCode = 200
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Cache-Control', 'no-cache')
    response.setHeader('ETag', etag)
    response.end(json)
  }

  return {
    name: 'murasaki-playground-asset-manifest',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
    generateBundle() {
      cachedManifest = null
      const { json } = getCached()
      this.emitFile({
        type: 'asset',
        fileName: manifestPublicPath.replace(/^\//, ''),
        source: json,
      })
    },
  }
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

function classifyAsset(publicPath: string): 'critical' | 'warm' | 'programs' {
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
  return 'critical'
}
