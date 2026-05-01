import { createReadStream } from 'node:fs'
import { access, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outDir = resolve(repoRoot, 'packages/docs/out')
const basePath = '/programs/docs'
const port = Number(process.env.PORT ?? 3000)

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.wasm', 'application/wasm'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
])

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  }
  catch {
    return false
  }
}

function isInsideOutDir(filePath) {
  const resolved = resolve(filePath)
  return resolved === outDir || resolved.startsWith(`${outDir}/`)
}

async function resolveFile(pathname) {
  const relativePath = pathname === '' || pathname === '/' ? '/index.html' : pathname
  const candidates = relativePath.endsWith('/')
    ? [join(outDir, relativePath, 'index.html')]
    : [
        join(outDir, relativePath),
        join(outDir, `${relativePath}.html`),
        join(outDir, relativePath, 'index.html'),
      ]

  for (const candidate of candidates) {
    if (!isInsideOutDir(candidate))
      continue
    if (!await exists(candidate))
      continue
    const stats = await stat(candidate)
    if (stats.isFile())
      return candidate
  }

  const notFound = join(outDir, '404.html')
  return await exists(notFound) ? notFound : null
}

function redirect(response, location) {
  response.writeHead(302, { Location: location })
  response.end()
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)
  const pathname = decodeURIComponent(requestUrl.pathname)

  if (pathname === '/') {
    redirect(response, `${basePath}/`)
    return
  }

  if (!pathname.startsWith(basePath)) {
    redirect(response, `${basePath}${pathname}${requestUrl.search}`)
    return
  }

  const strippedPathname = pathname.slice(basePath.length) || '/'
  const filePath = await resolveFile(strippedPathname)

  if (!filePath) {
    response.writeHead(404)
    response.end('Not found')
    return
  }

  const is404 = filePath.endsWith('/404.html')
  response.writeHead(is404 ? 404 : 200, {
    'Content-Type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
  })
  if (request.method === 'HEAD') {
    response.end()
    return
  }
  createReadStream(filePath).pipe(response)
})

server.listen(port, () => {
  console.log(`Docs preview: http://localhost:${String(port)}${basePath}/`)
})
