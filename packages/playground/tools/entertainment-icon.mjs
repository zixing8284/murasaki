// Generates the Entertainment Center app icon (gamepad) as flat pixel-art PNGs.
// Dependency-free PNG encoder. Run: node tools/entertainment-icon.mjs
import { Buffer } from 'node:buffer'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const here = dirname(fileURLToPath(import.meta.url))
const iconsDir = resolve(here, '../public/icons')

// 16x16 pixel grid. One char per pixel.
const GRID = [
  '................',
  '................',
  '................',
  '....########....',
  '...#BBBBBBBB#...',
  '..#BBBBBBBBBB#..',
  '.#HBBBBBBBBBBB#.',
  '.#BBXBBBBBRBBB#.',
  '.#BXXXBBBUBGBB#.',
  '.#BBXBBBBBYBBB#.',
  '.#BBBBBBBBBBBB#.',
  '..#BBBBBBBBBB#..',
  '...##########...',
  '................',
  '................',
  '................',
]

const PALETTE = {
  '.': [0, 0, 0, 0],
  '#': [0, 0, 0, 255],
  'B': [154, 153, 163, 255],
  'H': [206, 206, 214, 255],
  'X': [48, 48, 56, 255],
  'R': [214, 72, 72, 255],
  'Y': [238, 196, 74, 255],
  'G': [120, 200, 110, 255],
  'U': [90, 150, 220, 255],
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePng(pixels, size) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function render(scale) {
  const size = 16 * scale
  const pixels = Buffer.alloc(size * size * 4)
  for (let gy = 0; gy < 16; gy++) {
    for (let gx = 0; gx < 16; gx++) {
      const [r, g, b, a] = PALETTE[GRID[gy][gx]]
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = gx * scale + sx
          const py = gy * scale + sy
          const off = (py * size + px) * 4
          pixels[off] = r
          pixels[off + 1] = g
          pixels[off + 2] = b
          pixels[off + 3] = a
        }
      }
    }
  }
  return encodePng(pixels, size)
}

for (const row of GRID) {
  if (row.length !== 16)
    throw new Error(`bad row length ${row.length}: "${row}"`)
}

writeFileSync(resolve(iconsDir, 'entertainment-16.png'), render(1))
writeFileSync(resolve(iconsDir, 'entertainment-32.png'), render(2))
process.stdout.write('wrote entertainment-16.png and entertainment-32.png\n')
