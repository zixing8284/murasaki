import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { connectMediaElement, getGlobalAudioCtx } from '../../../../lib/global-audio-context'

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
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataRef = useRef<AnalysisData | null>(null)
  const connectedElementRef = useRef<HTMLMediaElement | null>(null)

  useEffect(() => {
    if (!isAudio || !isPlaying)
      return

    const el = getMediaElement()
    if (!el)
      return

    if (connectedElementRef.current === el)
      return

    const { ctx, masterGain } = getGlobalAudioCtx()

    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    // Get (or create) the source node for this element.
    // It may already be connected to masterGain from connectMediaElement().
    const source = connectMediaElement(el)

    // Tear down any previous analyser
    const prevAnalyser = analyserRef.current
    if (prevAnalyser) {
      prevAnalyser.disconnect()
      analyserRef.current = null
    }

    // Re-route: source → analyser → masterGain
    // Disconnect source's current direct connection to masterGain first.
    source.disconnect(masterGain)

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8

    source.connect(analyser)
    analyser.connect(masterGain)

    analyserRef.current = analyser
    connectedElementRef.current = el

    dataRef.current = {
      frequency: new Uint8Array(analyser.frequencyBinCount),
      timeDomain: new Uint8Array(analyser.fftSize),
    }
  }, [isAudio, isPlaying, getMediaElement])

  // On unmount: remove the analyser and restore the direct source → masterGain path
  useEffect(() => {
    return () => {
      const el = connectedElementRef.current
      const analyser = analyserRef.current
      if (el && analyser) {
        const { masterGain, sourceCache } = getGlobalAudioCtx()
        const source = sourceCache.get(el)
        analyser.disconnect()
        if (source) {
          source.connect(masterGain)
        }
      }
      connectedElementRef.current = null
      analyserRef.current = null
      dataRef.current = null
    }
  }, [])

  return { analyserRef, dataRef }
}
