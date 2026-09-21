// Generate PWA icons from the pixel-art murasaki source icon.
//
// Dependency-free: decodes the source PNG and re-encodes upscaled variants
// using only Node's built-in zlib. Nearest-neighbor scaling preserves the
// crisp Windows 98 pixel-art aesthetic. Run with `node scripts/generate-pwa-icons.mjs`.

import { Buffer } from 'node:buffer'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { deflateSync, inflateSync } from 'node:zlib'

const SOURCE = resolve('packages/playground/public/icons/murasaki-32.png')
const OUT_DIR = resolve('packages/playground/public/icons')

// Maskable / apple background — Windows 98 desktop teal so the safe-zone
// padding reads as an intentional tile rather than empty space.
const MASK_BG = [0x00, 0x80, 0x80, 0xFF]

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buffer) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function decodePng(buffer) {
  const signature = buffer.subarray(0, 8).toString('hex')
  if (signature !== '89504e470d0a1a0a') {
    throw new Error('Not a PNG')
  }

  let offset = 8
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  let interlace = 0
  const idat = []

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const data = buffer.subarray(offset + 8, offset + 8 + length)

    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      interlace = data[12]
    }
    else if (type === 'IDAT') {
      idat.push(data)
    }
    else if (type === 'IEND') {
      break
    }

    offset += 12 + length
  }

  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error(`Unsupported PNG (bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace})`)
  }

  const raw = inflateSync(Buffer.concat(idat))
  const channels = 4
  const stride = width * channels
  const pixels = Buffer.alloc(height * stride)
  let prevRow = Buffer.alloc(stride)

  for (let y = 0; y < height; y += 1) {
    const filterType = raw[y * (stride + 1)]
    const rowStart = y * (stride + 1) + 1
    const row = raw.subarray(rowStart, rowStart + stride)
    const out = pixels.subarray(y * stride, y * stride + stride)

    for (let x = 0; x < stride; x += 1) {
      const rawByte = row[x]
      const a = x >= channels ? out[x - channels] : 0
      const b = prevRow[x]
      const c = x >= channels ? prevRow[x - channels] : 0
      let value

      switch (filterType) {
        case 0:
          value = rawByte
          break
        case 1:
          value = rawByte + a
          break
        case 2:
          value = rawByte + b
          break
        case 3:
          value = rawByte + ((a + b) >> 1)
          break
        case 4:
          value = rawByte + paeth(a, b, c)
          break
        default:
          throw new Error(`Unknown filter ${filterType}`)
      }

      out[x] = value & 0xFF
    }

    prevRow = out
  }

  return { width, height, pixels }
}

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc)
    return a
  if (pb <= pc)
    return b
  return c
}

// Nearest-neighbor scale of an RGBA image into a target-sized RGBA buffer.
// `scale` (0-1) shrinks the drawn art inside the target, padding the rest
// with `background` (used for maskable safe zones); scale=1 fills the target.
function render(source, target, scale, background) {
  const dst = Buffer.alloc(target * target * 4)

  if (background) {
    for (let i = 0; i < dst.length; i += 4) {
      dst[i] = background[0]
      dst[i + 1] = background[1]
      dst[i + 2] = background[2]
      dst[i + 3] = background[3]
    }
  }

  const drawSize = Math.round(target * scale)
  const originOffset = Math.floor((target - drawSize) / 2)

  for (let y = 0; y < drawSize; y += 1) {
    const srcY = Math.min(source.height - 1, Math.floor((y * source.height) / drawSize))
    for (let x = 0; x < drawSize; x += 1) {
      const srcX = Math.min(source.width - 1, Math.floor((x * source.width) / drawSize))
      const srcIndex = (srcY * source.width + srcX) * 4
      const alpha = source.pixels[srcIndex + 3]
      if (alpha === 0 && background)
        continue

      const dstIndex = ((y + originOffset) * target + (x + originOffset)) * 4
      if (background && alpha < 255) {
        // Alpha-composite the pixel over the opaque background.
        const inv = (255 - alpha) / 255
        const fwd = alpha / 255
        dst[dstIndex] = Math.round(source.pixels[srcIndex] * fwd + background[0] * inv)
        dst[dstIndex + 1] = Math.round(source.pixels[srcIndex + 1] * fwd + background[1] * inv)
        dst[dstIndex + 2] = Math.round(source.pixels[srcIndex + 2] * fwd + background[2] * inv)
        dst[dstIndex + 3] = 255
      }
      else {
        dst[dstIndex] = source.pixels[srcIndex]
        dst[dstIndex + 1] = source.pixels[srcIndex + 1]
        dst[dstIndex + 2] = source.pixels[srcIndex + 2]
        dst[dstIndex + 3] = alpha
      }
    }
  }

  return { width: target, height: target, pixels: dst }
}

function encodePng(image) {
  const { width, height, pixels } = image
  const stride = width * 4
  const filtered = Buffer.alloc(height * (stride + 1))

  for (let y = 0; y < height; y += 1) {
    filtered[y * (stride + 1)] = 0 // filter type 0 (none)
    pixels.copy(filtered, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(filtered, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii')
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)
  return Buffer.concat([length, typeBuffer, data, crc])
}

const source = decodePng(readFileSync(SOURCE))

const targets = [
  { file: 'pwa-192.png', size: 192, scale: 1, bg: null },
  { file: 'pwa-512.png', size: 512, scale: 1, bg: null },
  { file: 'pwa-maskable-512.png', size: 512, scale: 0.8, bg: MASK_BG },
  { file: 'apple-touch-icon-180.png', size: 180, scale: 0.8, bg: MASK_BG },
]

for (const { file, size, scale, bg } of targets) {
  const image = render(source, size, scale, bg)
  writeFileSync(resolve(OUT_DIR, file), encodePng(image))
  console.log(`wrote ${file} (${size}x${size})`)
}
