import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  sandbox: string
  referrerPolicy: typeof IFRAME_CONFIG.referrerPolicy
}

/**
 * Attaches a focus listener to the iframe's contentWindow if accessible.
 * Cross-origin iframes may throw a SecurityError here — we guard with try-catch.
 *
 * When the iframe content receives focus (e.g., user clicks inside iframe),
 * we activate the owning window and trigger delayed focus transfer.
 */
function tryAttachContentWindowFocusListener(
  iframe: HTMLIFrameElement,
  onContentFocus: () => void,
): () => void {
  try {
    const contentWindow = iframe.contentWindow
    if (contentWindow) {
      contentWindow.addEventListener('focus', onContentFocus)
      return () => {
        try {
          contentWindow?.removeEventListener('focus', onContentFocus)
        }
        catch {
          // contentWindow may be inaccessible after iframe unmount or navigation
        }
      }
    }
  }
  catch {
    // Cross-origin iframes may deny access to contentWindow — skip focus tracking.
    // Window activation will still work via the iframe wrapper's onPointerDown.
  }
  return () => {}
}

/**
 * Encapsulates iframe window behavior:
 * - Tracks loading state via iframe load event (exposed as `iframeLoaded` = !isLoading)
 * - Listens to contentWindow focus to activate the owning window and trigger delayed focus (same-origin only)
 * - Provides a ref callback to attach to the iframe element
 * - Provides focusIframe() with delayed focus transfer (500ms) to prevent accidental interactions
 *
 * Note: contentWindow focus tracking only works for same-origin iframes
 * due to browser security restrictions. For cross-origin iframes, the
 * iframe wrapper's onPointerDown handles activation and focus.
 */
export function useIframeWindow({
  windowId,
}: UseIframeWindowOptions): UseIframeWindowReturn {
  const actions = useProcessActions()
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  // Keep latest callback in a ref so the effect doesn't need to re-run
  const onContentFocusRef = useRef<() => void>(() => {})
  // Track the pending focus timeout so it can be cancelled before rescheduling or on unmount
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Delayed focus transfer to prevent accidental interactions when switching windows
  const focusIframe = useCallback(() => {
    if (focusTimeoutRef.current != null) {
      clearTimeout(focusTimeoutRef.current)
    }
    focusTimeoutRef.current = setTimeout(() => {
      focusTimeoutRef.current = null
      iframeRef.current?.contentWindow?.focus()
    }, 500)
  }, [])

  // Cancel any pending focus timeout on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current != null) {
        clearTimeout(focusTimeoutRef.current)
      }
    }
  }, [])

  // Handler called when iframe content receives focus (same-origin only)
  const handleContentFocus = useCallback(() => {
    // First: activate the window immediately so it comes to front
    actions.activate(windowId)
    // Then: trigger delayed focus transfer to iframe content
    // (the contentWindow already has focus, but this ensures consistent timing)
    focusIframe()
  }, [actions, windowId, focusIframe])

  // Keep onContentFocusRef in sync before paint
  useLayoutEffect(() => {
    onContentFocusRef.current = handleContentFocus
  }, [handleContentFocus])

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)

    // Re-attach contentWindow listener after load (best-effort)
    const iframe = iframeRef.current
    if (iframe) {
      tryAttachContentWindowFocusListener(iframe, onContentFocusRef.current)
    }
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe)
      return

    iframe.addEventListener('load', handleIframeLoad)

    // Try to attach contentWindow listener immediately (best-effort for same-origin)
    const detach = tryAttachContentWindowFocusListener(iframe, onContentFocusRef.current)

    return () => {
      iframe.removeEventListener('load', handleIframeLoad)
      detach()
    }
  }, [handleIframeLoad])

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
  const cancelIframeInteraction = useCallback(() => {
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
  }, [])

  return {
    iframeRef: (el) => {
      iframeRef.current = el
    },
    iframeLoaded: !isLoading,
    focusIframe,
    cancelIframeInteraction,
    sandbox: IFRAME_CONFIG.sandbox,
    referrerPolicy: IFRAME_CONFIG.referrerPolicy,
  }
}
