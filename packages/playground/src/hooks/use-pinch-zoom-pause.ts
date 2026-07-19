import { useEffect } from 'react'

/**
 * Sets a `data-zooming` attribute on `<html>` while the user is actively
 * pinch-zooming with a macOS trackpad.
 *
 * Page zoom forces the browser to re-rasterize the page every frame. Full-screen
 * CRT overlays (jitter/roll transforms) keep animating during that window and
 * compete with the zoom for compositor time. Pausing them for the duration of
 * the gesture removes avoidable churn without any lasting visual change — the
 * effect resumes as soon as the fingers stop.
 *
 * Purely imperative (no React state) so it never re-renders the tree mid-gesture,
 * and the wheel listener is passive so native zoom is untouched.
 */
export function usePinchZoomPause(enabled: boolean): void {
  useEffect(() => {
    if (!enabled)
      return

    const root = document.documentElement
    let timeout = 0
    let active = false

    const clear = (): void => {
      if (active) {
        active = false
        root.removeAttribute('data-zooming')
      }
    }

    const mark = (): void => {
      if (!active) {
        active = true
        root.setAttribute('data-zooming', '')
      }
      window.clearTimeout(timeout)
      // Wheel-based pinch has no explicit "end", so debounce a short idle window.
      timeout = window.setTimeout(clear, 180)
    }

    // Chrome/Edge on macOS report trackpad pinch as ctrl+wheel.
    const onWheel = (event: WheelEvent): void => {
      if (event.ctrlKey)
        mark()
    }
    // Safari/WebKit fire non-standard gesture events for pinch.
    const onGesture = (): void => mark()

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('gesturestart', onGesture)
    window.addEventListener('gesturechange', onGesture)
    window.addEventListener('gestureend', onGesture)

    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('gesturestart', onGesture)
      window.removeEventListener('gesturechange', onGesture)
      window.removeEventListener('gestureend', onGesture)
      clear()
    }
  }, [enabled])
}
