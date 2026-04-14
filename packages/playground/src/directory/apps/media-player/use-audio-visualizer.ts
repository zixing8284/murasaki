import { useEffect, useRef } from 'react'

// Cache MediaElementSource nodes — createMediaElementSource() throws if called twice on same element
const sourceCache = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>()

interface UseAudioVisualizerOptions {
  getMediaElement: () => HTMLMediaElement | null
  isPlaying: boolean
  isAudio: boolean
}

interface AnalysisData {
  frequency: Uint8Array<ArrayBuffer>
  timeDomain: Uint8Array<ArrayBuffer>
}

export type { AnalysisData }

/**
 * Hook managing Web Audio API analysis for audio visualization.
 * Writes analysis data to a shared ref that the visualizer component reads during rAF.
 * Returns a ref to the latest analysis data (avoids React state churn at 60fps).
 */
export function useAudioVisualizer({ getMediaElement, isPlaying, isAudio }: UseAudioVisualizerOptions) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataRef = useRef<AnalysisData | null>(null)
  const rafIdRef = useRef<number>(0)
  const connectedElementRef = useRef<HTMLMediaElement | null>(null)

  useEffect(() => {
    if (!isAudio || !isPlaying) {
      // Stop the animation loop when not needed
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = 0
      }
      return
    }

    const el = getMediaElement()
    if (!el) return

    // Lazily create AudioContext (needs user gesture — we're in a play handler so it's fine)
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    const ctx = audioCtxRef.current

    // Resume if suspended (Chrome autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // Connect source node (only once per element)
    if (connectedElementRef.current !== el) {
      // Disconnect old analyser if reconnecting to a different element
      analyserRef.current?.disconnect()

      let source = sourceCache.get(el)
      if (!source) {
        source = ctx.createMediaElementSource(el)
        sourceCache.set(el, source)
      } else {
        source.disconnect()
      }

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256 // 128 frequency bins
      analyser.smoothingTimeConstant = 0.8

      source.connect(analyser)
      analyser.connect(ctx.destination) // must connect to destination or audio won't play

      analyserRef.current = analyser
      connectedElementRef.current = el

      // Initialize data buffers
      dataRef.current = {
        frequency: new Uint8Array(analyser.frequencyBinCount),
        timeDomain: new Uint8Array(analyser.fftSize),
      }
    }

    const analyser = analyserRef.current
    const data = dataRef.current
    if (!analyser || !data) return

    // Animation loop — reads audio data each frame
    function tick() {
      analyser!.getByteFrequencyData(data!.frequency)
      analyser!.getByteTimeDomainData(data!.timeDomain)
      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = 0
      }
    }
  }, [isAudio, isPlaying, getMediaElement])

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
      connectedElementRef.current = null
      analyserRef.current = null
      dataRef.current = null
    }
  }, [])

  return dataRef
}
