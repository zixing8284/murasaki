import { useCallback, useEffect, useRef, useState } from 'react'
import { useProcessActions } from '../../contexts/process'
import { IFRAME_CONFIG } from './iframe-config'

export interface UseIframeWindowOptions {
  windowId: string
}

export interface UseIframeWindowReturn {
  iframeRef: React.RefCallback<HTMLIFrameElement>
  iframeLoaded: boolean
  focusIframe: () => void
  /** Sends a cancel interaction message to the iframe */
  cancelIframeInteraction: () => void
  sandbox?: string
  referrerPolicy: typeof IFRAME_CONFIG.referrerPolicy
}

/**
 * Encapsulates iframe window behavior:
 * - Tracks loading state via iframe load event (exposed as `iframeLoaded`).
 * - Detects iframe activation via the host window's `blur` event combined with
 *   `document.activeElement === iframeEl`. Works for both same-origin and
 *   cross-origin iframes without subscribing to `contentWindow` focus events,
 *   which avoids cross-origin SecurityErrors and — more importantly — avoids
 *   the delayed-focus ping-pong that occurs when a stale `setTimeout` calls
 *   `contentWindow.focus()` after the user has already switched windows.
 * - Exposes a synchronous `focusIframe()`. The wrapper's `onPointerDown`
 *   activates the window and routes keyboard focus into the iframe in the
 *   same tick, so there is no deferred work that can outlive a deactivation.
 *
 * Reference: daedalOS `useIFrameFocuser` uses the same
 * blur + `document.activeElement` pattern to detect iframe activation.
 */
export function useIframeWindow({
  windowId,
}: UseIframeWindowOptions): UseIframeWindowReturn {
  const actions = useProcessActions()
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const focusIframe = (): void => {
    iframeRef.current?.focus()
  }

  const setIframeRef = useCallback((el: HTMLIFrameElement | null) => {
    iframeRef.current = el
  }, [])

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe)
      return

    iframe.addEventListener('load', handleIframeLoad)

    return () => {
      iframe.removeEventListener('load', handleIframeLoad)
    }
  }, [handleIframeLoad])

  // Detect iframe activation via host-window blur. When focus moves into an
  // iframe (e.g. a click inside cross-origin content), the parent window blurs
  // and `document.activeElement` becomes that iframe element. We then activate
  // the owning process synchronously — no timeouts, so there is no stale work
  // that can fight a subsequent user-initiated window switch.
  useEffect(() => {
    const handleHostBlur = (): void => {
      const iframe = iframeRef.current
      if (!iframe)
        return
      if (iframe.ownerDocument.activeElement === iframe) {
        actions.activate(windowId)
      }
    }
    window.addEventListener('blur', handleHostBlur)
    return () => {
      window.removeEventListener('blur', handleHostBlur)
    }
  }, [actions, windowId])

  /**
   * Cancel any ongoing interaction inside the iframe.
   *
   * Strategy:
   * 1. Try sending a postMessage with 'cancel' command (works if iframe listens for messages)
   * 2. Fall back to focusing the parent document body (moves focus out of iframe)
   *
   * For same-origin iframes, you can implement a message listener:
   *   window.addEventListener('message', (e) => {
   *     if (e.data?.type === 'murasaki:cancel') { /* cancel drag/draw operation *\/ }
   *   })
   */
  const cancelIframeInteraction = (): void => {
    const iframe = iframeRef.current
    if (!iframe)
      return

    // 1. Try postMessage first (if iframe supports it)
    try {
      iframe.contentWindow?.postMessage({ type: 'murasaki:cancel' }, '*')
    }
    catch {
      // Cross-origin postMessage may throw
    }

    // 2. Fall back: move focus to parent document body (more reliable than contentWindow.blur())
    try {
      iframe.ownerDocument.body.focus()
    }
    catch {
      // May fail for cross-origin
    }
  }

  return {
    iframeRef: setIframeRef,
    iframeLoaded: !isLoading,
    focusIframe,
    cancelIframeInteraction,
    referrerPolicy: IFRAME_CONFIG.referrerPolicy,
  }
}
