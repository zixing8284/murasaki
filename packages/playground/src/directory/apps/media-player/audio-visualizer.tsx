import { useEffect, useRef } from 'react'
import { useAudioVisualizer } from './use-audio-visualizer'

// ── Virtual resolution — intentionally low for pixel-art upscaling ──────
const VIRTUAL_W = 160
const VIRTUAL_H = 90

// ── 30fps throttle ──────────────────────────────────────────────────────
const FRAME_INTERVAL = 1000 / 30

// ── Oscilloscope styling ────────────────────────────────────────────────
const BG_COLOR = '#0a0a0a'
const WAVE_COLOR = '#c8c8c8'
const CENTER_LINE_COLOR = '#1a1a1a'

// ── Canvas drawing ──────────────────────────────────────────────────────

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  timeDomain: Uint8Array,
) {
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H)

  // Dim center line
  ctx.fillStyle = CENTER_LINE_COLOR
  ctx.fillRect(0, Math.floor(VIRTUAL_H / 2), VIRTUAL_W, 1)

  // Draw waveform — 1px thin line for clean pixel look
  const step = timeDomain.length / VIRTUAL_W
  ctx.fillStyle = WAVE_COLOR

  let prevY = Math.floor((timeDomain[0] / 255) * VIRTUAL_H)

  for (let x = 0; x < VIRTUAL_W; x++) {
    const idx = Math.floor(x * step)
    const value = timeDomain[idx]
    const y = Math.floor((value / 255) * VIRTUAL_H)

    // Connect prevY to y with vertical segment for continuity
    const minY = Math.min(prevY, y)
    const maxY = Math.max(prevY, y)
    ctx.fillRect(x, minY, 1, maxY - minY + 1)

    prevY = y
  }
}

function drawEmpty(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H)

  ctx.fillStyle = CENTER_LINE_COLOR
  ctx.fillRect(0, Math.floor(VIRTUAL_H / 2), VIRTUAL_W, 1)
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

  // Animation loop at ~30fps when playing
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

      analyser.getByteTimeDomainData(data.timeDomain)
      drawWaveform(ctx, data.timeDomain)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
  }, [isAudio, isPlaying, analyserRef, dataRef])

  // Draw empty state when paused/stopped
  useEffect(() => {
    if (!isAudio || isPlaying) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawEmpty(ctx)
  }, [isAudio, isPlaying])

  if (!isAudio) return null

  return (
    <canvas
      ref={canvasRef}
      width={VIRTUAL_W}
      height={VIRTUAL_H}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
