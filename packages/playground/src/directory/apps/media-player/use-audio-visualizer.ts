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

interface UseAudioVisualizerResult {
  analyserRef: React.RefObject<AnalyserNode | null>
  dataRef: React.RefObject<AnalysisData | null>
}

export type { AnalysisData }

/**
 * Hook managing Web Audio API AnalyserNode connection.
 * Returns refs to the analyser and data buffers — the component drives the single rAF loop.
 */
export function useAudioVisualizer({ getMediaElement, isPlaying, isAudio }: UseAudioVisualizerOptions): UseAudioVisualizerResult {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataRef = useRef<AnalysisData | null>(null)
  const connectedElementRef = useRef<HTMLMediaElement | null>(null)

  // Connect / disconnect the Web Audio graph
  useEffect(() => {
    if (!isAudio || !isPlaying)
      return

    const el = getMediaElement()
    if (!el)
      return

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
      }
      else {
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
  }, [isAudio, isPlaying, getMediaElement])

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
      connectedElementRef.current = null
      analyserRef.current = null
      dataRef.current = null
    }
  }, [])

  return { analyserRef, dataRef }
}
