import { useCallback, useEffect, useRef } from 'react'
import type { AnalysisData } from './use-audio-visualizer'
import { useAudioVisualizer } from './use-audio-visualizer'

// ── Block characters for frequency bars (ordered by intensity) ──────────
const BAR_CHARS = [' ', '░', '▒', '▓', '█'] as const

// ── Waveform characters (pure ASCII) ────────────────────────────────────
const WAVE_SOLID = '#'
const WAVE_MED = '='
const WAVE_LIGHT = '-'
const WAVE_DOT = '.'

// ── Box drawing decorations ─────────────────────────────────────────────
function centeredHeader(label: string, width: number): string {
  if (width < label.length + 4) return label.slice(0, width)
  const inner = ` ${label} `
  const sideLen = Math.floor((width - inner.length - 2) / 2)
  const left = '═'.repeat(Math.max(0, sideLen))
  const right = '═'.repeat(Math.max(0, width - 2 - inner.length - sideLen))
  return `╔${left}${inner}${right}╗`
}

// ── Pure ASCII generation functions ─────────────────────────────────────

function generateFrequencyBars(
  frequency: Uint8Array,
  cols: number,
  rows: number,
): string {
  if (cols <= 0 || rows <= 0) return ''

  // Sample frequency bins to fit available columns (2 chars per bar + 1 gap)
  const barWidth = 2
  const gap = 1
  const barCount = Math.max(1, Math.floor((cols + gap) / (barWidth + gap)))
  const binCount = frequency.length
  const lines: string[] = []

  // Sample and normalize bars
  const heights: number[] = []
  for (let i = 0; i < barCount; i++) {
    const binIndex = Math.floor((i / barCount) * binCount)
    const value = frequency[binIndex] // 0-255
    heights.push(Math.round((value / 255) * rows))
  }

  // Render top-down
  for (let row = 0; row < rows; row++) {
    const rowFromBottom = rows - 1 - row
    let line = ''
    for (let b = 0; b < barCount; b++) {
      const h = heights[b]
      if (rowFromBottom < h) {
        // This cell is filled — use intensity based on position in bar
        const intensity = Math.min(4, Math.floor((h - rowFromBottom) / (rows / 4) + 1))
        const char = BAR_CHARS[intensity]
        line += char.repeat(barWidth)
      } else {
        line += ' '.repeat(barWidth)
      }
      if (b < barCount - 1) line += ' '.repeat(gap)
    }
    // Pad or trim to exact width
    lines.push(line.length >= cols ? line.slice(0, cols) : line.padEnd(cols))
  }

  return lines.join('\n')
}

function generateWaveform(
  timeDomain: Uint8Array,
  cols: number,
  rows: number,
): string {
  if (cols <= 0 || rows <= 0) return ''

  const lines: string[][] = []
  for (let r = 0; r < rows; r++) {
    lines.push(Array.from<string>({ length: cols }).fill(' '))
  }

  // Draw center line with dim dots
  const centerRow = Math.floor(rows / 2)
  for (let c = 0; c < cols; c++) {
    lines[centerRow][c] = '─'
  }

  // Plot waveform
  const sampleCount = timeDomain.length
  for (let c = 0; c < cols; c++) {
    const sampleIndex = Math.floor((c / cols) * sampleCount)
    const value = timeDomain[sampleIndex] // 0-255, 128 = center/silence
    // Map to row: 0 → top row, 255 → bottom row
    const row = Math.round(((value) / 255) * (rows - 1))
    const clampedRow = Math.max(0, Math.min(rows - 1, row))

    if (clampedRow === centerRow) {
      lines[clampedRow][c] = WAVE_SOLID
    } else {
      // Intensity based on distance from center
      const dist = Math.abs(clampedRow - centerRow)
      const maxDist = Math.floor(rows / 2)
      const ratio = dist / maxDist
      lines[clampedRow][c] = ratio > 0.7 ? WAVE_SOLID : ratio > 0.4 ? WAVE_MED : WAVE_LIGHT

      // Draw vertical connecting chars between center and the point
      const from = Math.min(centerRow, clampedRow) + 1
      const to = Math.max(centerRow, clampedRow)
      for (let r = from; r < to; r++) {
        if (lines[r][c] === ' ') {
          lines[r][c] = WAVE_DOT
        }
      }
    }
  }

  return lines.map(row => row.join('')).join('\n')
}

function generateAsciiFrame(
  data: AnalysisData | null,
  cols: number,
  rows: number,
): string {
  if (cols < 10 || rows < 6) return ''

  const headerBarText = centeredHeader('SPECTRUM ANALYZER', cols)
  const headerWaveText = centeredHeader('OSCILLOSCOPE', cols)

  // Allocate rows: 1 header + bars + 1 header + waveform
  const contentRows = rows - 2 // minus 2 headers
  const barRows = Math.max(2, Math.ceil(contentRows * 0.55))
  const waveRows = Math.max(2, contentRows - barRows)

  if (!data) {
    // Silent / no data — show empty frame
    const emptyBars = Array.from({ length: barRows }, () => ' '.repeat(cols)).join('\n')
    const centerRow = Math.floor(waveRows / 2)
    const emptyWave = Array.from({ length: waveRows }, (_, r) =>
      r === centerRow ? '─'.repeat(cols) : ' '.repeat(cols),
    ).join('\n')
    return `${headerBarText}\n${emptyBars}\n${headerWaveText}\n${emptyWave}`
  }

  const bars = generateFrequencyBars(data.frequency, cols, barRows)
  const wave = generateWaveform(data.timeDomain, cols, waveRows)

  return `${headerBarText}\n${bars}\n${headerWaveText}\n${wave}`
}

// ── Component ───────────────────────────────────────────────────────────

interface AudioVisualizerProps {
  getMediaElement: () => HTMLMediaElement | null
  isPlaying: boolean
  isAudio: boolean
}

export function AudioVisualizer({ getMediaElement, isPlaying, isAudio }: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const dimsRef = useRef({ cols: 0, rows: 0 })
  const rafRef = useRef<number>(0)

  const dataRef = useAudioVisualizer({ getMediaElement, isPlaying, isAudio })

  // Measure container to compute character grid dimensions
  const measureDims = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // Measure a single character's dimensions using a hidden probe
    const probe = document.createElement('span')
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font:inherit'
    probe.textContent = 'M'
    container.appendChild(probe)
    const charW = probe.offsetWidth || 7.2
    const charH = probe.offsetHeight || 13
    container.removeChild(probe)

    const rect = container.getBoundingClientRect()
    dimsRef.current = {
      cols: Math.floor(rect.width / charW),
      rows: Math.floor(rect.height / charH),
    }
  }, [])

  // ResizeObserver to track container dimensions
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    measureDims()

    const observer = new ResizeObserver(() => {
      measureDims()
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [measureDims])

  // Render loop — writes directly to DOM, no React state
  useEffect(() => {
    if (!isAudio || !isPlaying) {
      // Show empty frame when paused/stopped
      const pre = preRef.current
      if (pre) {
        const { cols, rows } = dimsRef.current
        pre.textContent = generateAsciiFrame(null, cols, rows)
      }
      return
    }

    function render() {
      const pre = preRef.current
      if (!pre) {
        rafRef.current = requestAnimationFrame(render)
        return
      }

      const { cols, rows } = dimsRef.current
      const data = dataRef.current
      const frame = generateAsciiFrame(data, cols, rows)
      pre.textContent = frame
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
  }, [isAudio, isPlaying, dataRef])

  if (!isAudio) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden p-1"
      style={{
        fontFamily: '"Courier New", Consolas, "Liberation Mono", monospace',
        fontSize: '11px',
        lineHeight: '13px',
        color: '#d0d0d0',
        textShadow: '0 0 3px rgba(220, 220, 220, 0.25)',
      }}
    >
      <pre
        ref={preRef}
        className="m-0 p-0 leading-none select-none"
        style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
        }}
      />
    </div>
  )
}
