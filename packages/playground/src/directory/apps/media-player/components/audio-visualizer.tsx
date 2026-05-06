import { useEffect, useRef } from 'react'
import { useAudioVisualizer } from '../hooks/use-audio-visualizer'

const VIRTUAL_W = 100
const VIRTUAL_H = 16
const FRAME_INTERVAL = 1000 / 30

interface VisualizerColors {
  bg: string
  wave: string
  center: string
}

function getColors(canvas: HTMLCanvasElement): VisualizerColors {
  const style = getComputedStyle(canvas)
  return {
    bg: style.getPropertyValue('--button-face').trim() || '#c0c0c0',
    wave: style.getPropertyValue('--button-dk-shadow').trim() || '#000000',
    center: style.getPropertyValue('--button-shadow').trim() || '#808080',
  }
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  timeDomain: Uint8Array,
  colors: VisualizerColors,
): void {
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H)

  ctx.fillStyle = colors.center
  ctx.fillRect(0, Math.floor(VIRTUAL_H / 2), VIRTUAL_W, 1)

  const step = timeDomain.length / VIRTUAL_W
  ctx.fillStyle = colors.wave

  let prevY = Math.floor((timeDomain[0] / 255) * VIRTUAL_H)

  for (let x = 0; x < VIRTUAL_W; x++) {
    const idx = Math.floor(x * step)
    const value = timeDomain[idx]
    const y = Math.floor((value / 255) * VIRTUAL_H)
    const minY = Math.min(prevY, y)
    const maxY = Math.max(prevY, y)
    ctx.fillRect(x, minY, 1, maxY - minY + 1)

    prevY = y
  }
}

function drawEmpty(ctx: CanvasRenderingContext2D, colors: Pick<VisualizerColors, 'bg' | 'center'>): void {
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H)

  ctx.fillStyle = colors.center
  ctx.fillRect(0, Math.floor(VIRTUAL_H / 2), VIRTUAL_W, 1)
}

interface AudioVisualizerProps {
  getMediaElement: () => HTMLMediaElement | null
  isPlaying: boolean
  isAudio: boolean
}

export function AudioVisualizer({ getMediaElement, isPlaying, isAudio }: AudioVisualizerProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)

  const { analyserRef, dataRef } = useAudioVisualizer({ getMediaElement, isPlaying, isAudio })

  useEffect(() => {
    if (!isAudio || !isPlaying)
      return

    function render(now: number): void {
      rafRef.current = requestAnimationFrame(render)

      if (now - lastFrameTimeRef.current < FRAME_INTERVAL)
        return
      lastFrameTimeRef.current = now

      const canvas = canvasRef.current
      const analyser = analyserRef.current
      const data = dataRef.current
      if (!canvas || !analyser || !data)
        return

      const ctx = canvas.getContext('2d')
      if (!ctx)
        return

      analyser.getByteTimeDomainData(data.timeDomain)
      drawWaveform(ctx, data.timeDomain, getColors(canvas))
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
  }, [isAudio, isPlaying, analyserRef, dataRef])

  useEffect(() => {
    if (isAudio && isPlaying)
      return
    const canvas = canvasRef.current
    if (!canvas)
      return
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return
    drawEmpty(ctx, getColors(canvas))
  }, [isAudio, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      width={VIRTUAL_W}
      height={VIRTUAL_H}
      className="block w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
