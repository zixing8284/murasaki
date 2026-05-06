import { existsSync } from 'node:fs'
import { copyFile, cp, mkdir, readdir, rm } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, 'packages/docs/out')
const target = resolve(root, 'packages/playground/public/programs/docs')

if (!existsSync(source)) {
  throw new Error('Docs export not found. Run `pnpm docs:build` before `pnpm docs:embed`.')
}

await rm(target, { recursive: true, force: true })
await mkdir(target, { recursive: true })
await cp(source, target, { recursive: true })

const aliasCount = await materializeRouteAliases(target)

console.log(`Embedded docs export into ${target}`)
console.log(`Materialized ${aliasCount} extensionless docs route aliases`)

async function materializeRouteAliases(directory) {
  const htmlFiles = await collectHtmlFiles(directory)
  let aliasCount = 0

  for (const htmlFile of htmlFiles) {
    if (!isRouteHtmlFile(directory, htmlFile)) {
      continue
    }

    const relativeHtmlPath = relative(directory, htmlFile)
    const routePath = relativeHtmlPath.slice(0, -'.html'.length)
    const aliasPath = join(directory, routePath, 'index.html')

    await mkdir(dirname(aliasPath), { recursive: true })
    await copyFile(htmlFile, aliasPath)
    aliasCount += 1
  }

  return aliasCount
}

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const htmlFiles = []

  for (const entry of entries) {
    const entryPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      htmlFiles.push(...await collectHtmlFiles(entryPath))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(entryPath)
    }
  }

  return htmlFiles
}

function isRouteHtmlFile(rootDirectory, htmlFile) {
  const relativeHtmlPath = relative(rootDirectory, htmlFile)
  const segments = relativeHtmlPath.split(sep)
  const fileName = basename(htmlFile)

  if (fileName === 'index.html' || fileName === '404.html' || fileName === '_not-found.html') {
    return false
  }

  return segments.every(segment => !segment.startsWith('_'))
}
