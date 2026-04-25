/**
 * Webamp host bounds bridge.
 *
 * Webamp is a foreign window manager embedded into the playground
 * desktop. Its own resize effect derives browser bounds from the real
 * document viewport, but here the effective viewport is the desktop host
 * container (inside the border and above the taskbar). We keep two layers:
 *
 *   1. `useWebampViewportBounds` writes the host size into Webamp's
 *      internal `windows.browserWindowSize` reducer state. This is the
 *      primary live-drag boundary.
 *   2. `useWebampBounds` keeps the previous bbox convergence clamp as a
 *      safety net for resize races and third-party edge cases.
 */

import type { RefObject } from 'react'
import type { WebampCI } from './functions'
import { useEffect } from 'react'
import {
  clampOpenWindowsToHost,
  dispatchWebampBrowserWindowSize,
} from './functions'

export function useWebampViewportBounds(
  instance: WebampCI | null,
  containerRef: RefObject<HTMLDivElement | null>,
): void {
  useEffect(() => {
    if (!instance)
      return undefined

    let disposed = false
    let rafId = 0

    const syncNow = (): void => {
      if (disposed)
        return
      const host = containerRef.current
      dispatchWebampBrowserWindowSize(instance, host)
      clampOpenWindowsToHost(instance, host)
    }

    const scheduleSync = (): void => {
      window.cancelAnimationFrame(rafId)
      rafId = window.requestAnimationFrame(syncNow)
    }

    syncNow()
    scheduleSync()

    const host = containerRef.current
    const observer = host ? new ResizeObserver(scheduleSync) : null
    observer?.observe(host)

    window.addEventListener('resize', scheduleSync)
    return () => {
      disposed = true
      window.cancelAnimationFrame(rafId)
      observer?.disconnect()
      window.removeEventListener('resize', scheduleSync)
    }
  }, [instance, containerRef])
}

export function useWebampBounds(
  instance: WebampCI | null,
  containerRef: RefObject<HTMLDivElement | null>,
): void {
  useEffect(() => {
    if (!instance)
      return undefined

    let reentrancyGuard = false

    const clamp = (): void => {
      // The corrective dispatch below will re-fire this listener; bail
      // out reentrant invocations to avoid a feedback loop. The early
      // (delta === 0,0) return below also ensures convergence.
      if (reentrancyGuard)
        return

      const host = containerRef.current
      if (!host)
        return

      reentrancyGuard = true
      try {
        clampOpenWindowsToHost(instance, host)
      }
      finally {
        reentrancyGuard = false
      }
    }

    const unsubscribe = instance._actionEmitter.on('UPDATE_WINDOW_POSITIONS', clamp)
    return unsubscribe
  }, [instance, containerRef])
}
