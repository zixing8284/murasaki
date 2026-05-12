import type { Connect, Plugin } from 'vite'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
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

export default defineConfig({
  root: '.',
  base,
  plugins: [
    react({
      include: /\.(jsx|js|tsx|ts)$/,
      babel: { plugins: ['babel-plugin-react-compiler'] },
    }),
    embeddedDocsRoutePlugin(),
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
