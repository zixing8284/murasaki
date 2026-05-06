import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

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
  analyserRef: RefObject<AnalyserNode | null>
  dataRef: RefObject<AnalysisData | null>
}

export type { AnalysisData }

export function useAudioVisualizer({ getMediaElement, isPlaying, isAudio }: UseAudioVisualizerOptions): UseAudioVisualizerResult {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataRef = useRef<AnalysisData | null>(null)
  const connectedElementRef = useRef<HTMLMediaElement | null>(null)

  useEffect(() => {
    if (!isAudio || !isPlaying)
      return

    const el = getMediaElement()
    if (!el)
      return

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    const ctx = audioCtxRef.current

    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    if (connectedElementRef.current !== el) {
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
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8

      source.connect(analyser)
      analyser.connect(ctx.destination)

      analyserRef.current = analyser
      connectedElementRef.current = el

      dataRef.current = {
        frequency: new Uint8Array(analyser.frequencyBinCount),
        timeDomain: new Uint8Array(analyser.fftSize),
      }
    }
  }, [isAudio, isPlaying, getMediaElement])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        void audioCtxRef.current.close()
        audioCtxRef.current = null
      }
      connectedElementRef.current = null
      analyserRef.current = null
      dataRef.current = null
    }
  }, [])

  return { analyserRef, dataRef }
}
