// Generate the Welcome app icon, favicon, and PWA icons from the startup artwork.
//
// The single source of truth is STARTUP_ARTWORK_BASE64 (the boot splash). The
// wide 16:9 artwork is centre-cropped to a square and resampled into every
// icon size, so the desktop/taskbar/Start-menu icon, the favicon, and the PWA
// install icons all share one image.
//
// Requires macOS `sips` for JPEG decoding + crop/resize (no npm dependencies).
// Run with `node scripts/generate-pwa-icons.mjs`.

import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const ARTWORK_SOURCE = resolve('packages/playground/src/shell/startup/startup-artwork-data.ts')
const PUBLIC_DIR = resolve('packages/playground/public')

// Maskable / apple safe-zone background — Windows 98 desktop teal so the
// padding reads as an intentional tile rather than empty space.
const MASK_BG = '008080'
const MASK_SCALE = 0.8

// Square, centre-cropped icons: target size → output file (relative to PUBLIC_DIR).
const SQUARE_ICONS = [
  { size: 16, file: 'icons/murasaki-16.png' },
  { size: 32, file: 'icons/murasaki-32.png' },
  { size: 32, file: 'favicon.png' },
  { size: 180, file: 'icons/apple-touch-icon-180.png' },
  { size: 192, file: 'icons/pwa-192.png' },
  { size: 512, file: 'icons/pwa-512.png' },
]

// Maskable icons: the artwork is padded inside a safe zone over MASK_BG.
const MASKABLE_ICONS = [
  { size: 512, file: 'icons/pwa-maskable-512.png' },
]

function sips(...args) {
  execFileSync('sips', args, { stdio: ['ignore', 'ignore', 'inherit'] })
}

function readArtworkJpeg() {
  const source = readFileSync(ARTWORK_SOURCE, 'utf8')
  const match = source.match(/STARTUP_ARTWORK_BASE64 = `([^`]*)`/)
  if (!match)
    throw new Error('Could not find STARTUP_ARTWORK_BASE64 in the artwork module.')
  return Buffer.from(match[1].replace(/\s/g, ''), 'base64')
}

function main() {
  const tmp = mkdtempSync(join(tmpdir(), 'murasaki-icons-'))
  try {
    const jpeg = join(tmp, 'artwork.jpg')
    writeFileSync(jpeg, readArtworkJpeg())

    // Centre-crop to a square at the artwork's native resolution.
    const dims = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', jpeg], { encoding: 'utf8' })
    const width = Number(dims.match(/pixelWidth:\s*(\d+)/)?.[1])
    const height = Number(dims.match(/pixelHeight:\s*(\d+)/)?.[1])
    if (!width || !height)
      throw new Error('Could not read artwork dimensions from sips.')
    const side = Math.min(width, height)
    const square = join(tmp, 'square.png')
    sips('-s', 'format', 'png', '-c', String(side), String(side), jpeg, '--out', square)

    for (const { size, file } of SQUARE_ICONS) {
      sips('-z', String(size), String(size), square, '--out', join(PUBLIC_DIR, file))
      console.log(`wrote ${file} (${size}x${size})`)
    }

    for (const { size, file } of MASKABLE_ICONS) {
      const inner = Math.round(size * MASK_SCALE)
      const innerPng = join(tmp, `mask-${size}.png`)
      sips('-z', String(inner), String(inner), square, '--out', innerPng)
      sips('-p', String(size), String(size), '--padColor', MASK_BG, innerPng, '--out', join(PUBLIC_DIR, file))
      console.log(`wrote ${file} (${size}x${size}, maskable)`)
    }
  }
  finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

main()
