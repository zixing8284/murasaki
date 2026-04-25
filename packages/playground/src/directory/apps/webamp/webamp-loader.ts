/**
 * Webamp instance lifecycle.
 *
 * Single-responsibility hook that owns:
 *   1. Loading `webamp.bundle.min.js` exactly once (module-scoped promise).
 *   2. Constructing the Webamp instance with default tracks/skins.
 *   3. Calling `renderWhenReady(host)` and re-parenting `#webamp` from
 *      `document.body` into the host container so its child windows'
 *      absolute coordinates resolve against the desktop area.
 *   4. Wiring `onWillClose` / `onMinimize` / `onTrackDidChange` to host
 *      callbacks (latest-callback refs so the init effect stays mount-only).
 *   5. Seeding the initial cluster positions (centered, or restored from
 *      `sessionStorage`) and quieting the equalizer.
 *   6. Tearing down: re-parenting `#webamp` back to `document.body`
 *     before calling `instance.close()` to avoid `NotFoundError` from
 *     Webamp's own layout-effect cleanup.
 *
 * Bounds clamping, milkdrop, and persistence-write are layered on top
 * via separate hooks (`useWebampBounds`, `useWebampMilkdrop`,
 * `useWebampPersistence`) so each concern lives in one focused module.
 */

import type { RefObject } from 'react'
import type { WebampCI } from './functions'
import { useEffect, useRef, useState } from 'react'
import {
  bindWebampDropGuards,
  centerPosition,
  computeStackPositions,
  DEFAULT_INITIAL_TRACKS,
  DEFAULT_SKINS,
  getWebampElement,
  loadWebampScript,
  readStoredSkinMuseumInitialSkin,
  WEBAMP_INTERNAL_Z_INDEX,
} from './functions'
import { readStoredMainPosition } from './webamp-persistence'

export interface UseWebampLoaderCallbacks {
  /** Webamp's own close button was pressed. Host should end the process. */
  onClose: () => void
  /** Webamp's own minimise button was pressed. Host should minimise the process. */
  onMinimize: () => void
  /** Active track changed (or cleared). Host can sync the process title. */
  onTitleChange: (title: string) => void
}

/**
 * Returns the live Webamp instance once `renderWhenReady` resolves, or
 * `null` while loading / after teardown.
 */
export function useWebampLoader(
  containerRef: RefObject<HTMLDivElement | null>,
  callbacks: UseWebampLoaderCallbacks,
): WebampCI | null {
  const [instance, setInstance] = useState<WebampCI | null>(null)

  // Latest-callback refs — keeps the init effect mount-only.
  const onCloseRef = useRef(callbacks.onClose)
  const onMinimizeRef = useRef(callbacks.onMinimize)
  const onTitleChangeRef = useRef(callbacks.onTitleChange)

  useEffect(() => {
    onCloseRef.current = callbacks.onClose
    onMinimizeRef.current = callbacks.onMinimize
    onTitleChangeRef.current = callbacks.onTitleChange
  }, [callbacks.onClose, callbacks.onMinimize, callbacks.onTitleChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container)
      return

    let disposed = false
    let webampRef: WebampCI | null = null
    const cleanups: Array<() => void> = []
    let removeDropGuards = (): void => {}

    loadWebampScript()
      .then((Webamp) => {
        if (disposed || !containerRef.current)
          return undefined

        const webamp = new Webamp({
          initialTracks: DEFAULT_INITIAL_TRACKS,
          initialSkin: readStoredSkinMuseumInitialSkin(),
          availableSkins: DEFAULT_SKINS,
          enableHotkeys: true,
          // Webamp paints its context menu via a body-level portal whose
          // z-index is `display.zIndex + 1`. The default of 0 puts the
          // menu (z=1) below every other playground window. Bumping the
          // option pushes the body-level menu above any host window
          // while leaving the in-host stacking context unaffected (the
          // host owns its own stacking context via process zIndex).
          zIndex: WEBAMP_INTERNAL_Z_INDEX,
        })
        webampRef = webamp

        cleanups.push(webamp.onWillClose((cancel) => {
          // Cancel Webamp's own removal; the host controls unmounting.
          cancel()
          onCloseRef.current()
        }))
        cleanups.push(webamp.onMinimize(() => {
          onMinimizeRef.current()
        }))
        cleanups.push(webamp.onTrackDidChange((track) => {
          if (!track) {
            onTitleChangeRef.current('Webamp')
            return
          }
          const { title, artist } = track.metaData ?? {}
          const display = [artist, title].filter(Boolean).join(' - ') || 'Webamp'
          onTitleChangeRef.current(display)
        }))

        return webamp.renderWhenReady(containerRef.current).then(() => {
          if (disposed)
            return

          // Re-parent #webamp from <body> into our host so child window
          // `position: absolute` coords resolve against the desktop area.
          const webampEl = getWebampElement()
          if (webampEl && containerRef.current && webampEl.parentElement !== containerRef.current)
            containerRef.current.append(webampEl)
          if (webampEl) {
            webampEl.style.position = 'absolute'
            webampEl.style.inset = '0'
          }

          // Initial seed: equalizer closed, milkdrop enabled (lazy), and
          // the cluster positioned at the stored or centered location.
          // Pre-seeding milkdrop's position avoids the "appears at desktop
          // top-left" bug on first toggle. Deferred a frame so Webamp's
          // own layout effects from renderWhenReady commit first.
          webamp.store.dispatch({ type: 'CLOSE_WINDOW', windowId: 'equalizer' })
          webamp.store.dispatch({ open: false, type: 'ENABLE_MILKDROP' })

          const rafId = window.requestAnimationFrame(() => {
            if (disposed)
              return
            const main = readStoredMainPosition() ?? centerPosition(containerRef.current)
            webamp.store.dispatch({
              absolute: false,
              positions: computeStackPositions(main, containerRef.current),
              type: 'UPDATE_WINDOW_POSITIONS',
            })
          })
          cleanups.push(() => window.cancelAnimationFrame(rafId))

          removeDropGuards = bindWebampDropGuards(webampEl)

          // Publish the instance so layered hooks can attach.
          setInstance(webamp)
        })
      })
      .catch((err) => {
        console.error('[webamp] failed to initialise', err)
      })

    return () => {
      disposed = true
      removeDropGuards()
      cleanups.forEach(fn => fn())

      // Webamp's internal layout-effect cleanup removes `#webamp` from
      // `document.body`. Since we moved it into our container, put it
      // back before Webamp tears down to avoid a NotFoundError.
      const webampEl = getWebampElement()
      if (webampEl && webampEl.parentElement && webampEl.parentElement !== document.body)
        document.body.append(webampEl)

      try {
        webampRef?.close()
      }
      catch {
        // ignore cleanup errors
      }
      setInstance(null)
    }
    // Init runs exactly once on mount. The host is responsible for
    // remounting (via `key`) if it ever needs a fresh Webamp instance.
  }, [containerRef])

  return instance
}
