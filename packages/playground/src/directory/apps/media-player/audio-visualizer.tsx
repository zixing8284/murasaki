import { useEffect, useRef } from 'react'
import { useAudioVisualizer } from './use-audio-visualizer'

// ── Virtual resolution — intentionally low for pixel-art upscaling ──────
const VIRTUAL_W = 160
const VIRTUAL_H = 90

// ── 30fps throttle ──────────────────────────────────────────────────────
const FRAME_INTERVAL = 1000 / 30

// ── Segmented LED bar grid ──────────────────────────────────────────────
const CELL_H = 3 // height of each "LED" cell in virtual pixels
const CELL_GAP = 1 // vertical gap between cells
const BAR_W = 4 // width of each bar
const BAR_GAP = 2 // horizontal gap between bars
const MAX_CELLS = Math.floor(VIRTUAL_H / (CELL_H + CELL_GAP))

// ── Stepped color palette (by row position, bottom → top) ───────────────
const CELL_COLORS = [
  '#585858', // bottom — dim
  '#787878',
  '#989898',
  '#b8b8b8',
  '#d8d8d8', // top — bright
] as const

function cellColor(row: number, totalCells: number): string {
  const t = row / Math.max(1, totalCells - 1)
  const idx = Math.min(CELL_COLORS.length - 1, Math.floor(t * CELL_COLORS.length))
  return CELL_COLORS[idx]
}

// ── Canvas drawing ──────────────────────────────────────────────────────

function drawBars(
  ctx: CanvasRenderingContext2D,
  frequency: Uint8Array,
) {
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H)

  const barCount = Math.floor(VIRTUAL_W / (BAR_W + BAR_GAP))
  const binCount = frequency.length
  // Use ~75% of bins (lower frequencies carry most musical energy)
  const usableBins = Math.floor(binCount * 0.75)

  for (let i = 0; i < barCount; i++) {
    const binIdx = Math.floor((i / barCount) * usableBins)
    const value = frequency[binIdx]
    const filledCells = Math.round((value / 255) * MAX_CELLS)

    const x = i * (BAR_W + BAR_GAP)

    for (let c = 0; c < filledCells; c++) {
      const y = VIRTUAL_H - (c + 1) * (CELL_H + CELL_GAP)
      ctx.fillStyle = cellColor(c, MAX_CELLS)
      ctx.fillRect(x, y, BAR_W, CELL_H)
    }
  }
}

function drawEmpty(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H)
}

// ── Component ───────────────────────────────────────────────────────────

interface AudioVisualizerProps {
  getMediaElement: () => HTMLMediaElement | null
  isPlaying: boolean
  isAudio: boolean
}

export function AudioVisualizer({ getMediaElement, isPlaying, isAudio }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)

  const { analyserRef, dataRef } = useAudioVisualizer({ getMediaElement, isPlaying, isAudio })

  // Set fixed low resolution — browser upscales with nearest-neighbor via CSS
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = VIRTUAL_W
    canvas.height = VIRTUAL_H
  }, [])

  // Render loop at ~30fps when playing
  useEffect(() => {
    if (!isAudio || !isPlaying) return

    function render(now: number) {
      rafRef.current = requestAnimationFrame(render)

      if (now - lastFrameTimeRef.current < FRAME_INTERVAL) return
      lastFrameTimeRef.current = now

      const canvas = canvasRef.current
      const analyser = analyserRef.current
      const data = dataRef.current
      if (!canvas || !analyser || !data) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      analyser.getByteFrequencyData(data.frequency)
      drawBars(ctx, data.frequency)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
  }, [isAudio, isPlaying, analyserRef, dataRef])

  // Static empty frame when paused/stopped
  useEffect(() => {
    if (!isAudio || isPlaying) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawEmpty(ctx)
  }, [isAudio, isPlaying])

  // Re-draw empty frame on resize when paused
  useEffect(() => {
    if (!isAudio || isPlaying) return
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new ResizeObserver(() => {
      const c = canvasRef.current
      if (!c) return
      const ctx = c.getContext('2d')
      if (!ctx) return
      drawEmpty(ctx)
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [isAudio, isPlaying])

  if (!isAudio) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
