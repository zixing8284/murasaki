import type { RefObject } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Self-capture display-media options. `preferCurrentTab` /
 * `selfBrowserSurface` / `surfaceSwitching` are Chrome self-capture hints not
 * yet present in the DOM lib typings.
 */
interface SelfCaptureDisplayMediaOptions extends DisplayMediaStreamOptions {
  preferCurrentTab?: boolean
  selfBrowserSurface?: 'include' | 'exclude'
  surfaceSwitching?: 'include' | 'exclude'
}

/** Region Capture API (Chrome 104+), not yet in the DOM lib typings. */
interface CropTargetStatic {
  fromElement: (element: Element) => Promise<unknown>
}

interface CroppableVideoTrack extends MediaStreamTrack {
  cropTo: (target: unknown) => Promise<void>
}

export interface ShaderGlassController {
  /** Whether a capture stream is currently active. */
  active: boolean
  /** Whether the browser supports the Element Capture based effect. */
  supported: boolean
  /** The live capture stream, or `null` when inactive. */
  stream: MediaStream | null
  /** Last capture error name, or `null`. */
  error: string | null
  /** Begin capturing. Must be called from a user gesture. */
  start: () => Promise<void>
  /** Stop capturing and release the stream. */
  stop: () => void
}

function getCropTarget(): CropTargetStatic | undefined {
  return (globalThis as unknown as { CropTarget?: CropTargetStatic }).CropTarget
}

function isSupported(): boolean {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices)
    return false
  if (typeof navigator.mediaDevices.getDisplayMedia !== 'function')
    return false
  const cropTarget = getCropTarget()
  return typeof cropTarget?.fromElement === 'function'
}

/**
 * Drives the "ShaderGlass" self-capture effect: captures the current tab and
 * crops the video track to `targetRef` via Region Capture (CropTarget). The
 * resulting stream contains only the target element's pixels and can be
 * rendered in a side-by-side CRT shader panel at the correct aspect ratio.
 */
export function useShaderGlass(
  targetRef: RefObject<HTMLElement | null>,
): ShaderGlassController {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stop = useCallback((): void => {
    const current = streamRef.current
    if (current) {
      for (const track of current.getTracks()) track.stop()
    }
    streamRef.current = null
    setStream(null)
  }, [])

  const start = useCallback(async (): Promise<void> => {
    const target = targetRef.current
    const cropTargetApi = getCropTarget()
    if (!target || !cropTargetApi)
      return

    setError(null)
    let media: MediaStream | null = null
    try {
      const options: SelfCaptureDisplayMediaOptions = {
        video: { frameRate: 60 },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        surfaceSwitching: 'exclude',
      }
      media = await navigator.mediaDevices.getDisplayMedia(options)

      const [track] = media.getVideoTracks()
      if (!track)
        throw new Error('No video track')

      const cropTarget = await cropTargetApi.fromElement(target)
      await (track as CroppableVideoTrack).cropTo(cropTarget)
      track.addEventListener('ended', stop)

      streamRef.current = media
      setStream(media)
    }
    catch (err) {
      if (media) {
        for (const track of media.getTracks()) track.stop()
      }
      streamRef.current = null
      setStream(null)
      setError(err instanceof Error ? err.name : 'error')
    }
  }, [targetRef, stop])

  // Release the stream if the component unmounts while capturing.
  useEffect(() => stop, [stop])

  const supported = useMemo(() => isSupported(), [])

  return { active: stream !== null, supported, stream, error, start, stop }
}
