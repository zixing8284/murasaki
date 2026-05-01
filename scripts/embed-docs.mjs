import { existsSync } from 'node:fs'
import { cp, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
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

console.log(`Embedded docs export into ${target}`)
