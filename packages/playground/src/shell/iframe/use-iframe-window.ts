import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useProcessActions } from '../../contexts/process'

export interface UseIframeWindowOptions {
  windowId: string
}

export interface UseIframeWindowReturn {
  iframeRef: React.RefCallback<HTMLIFrameElement>
  isLoading: boolean
  focusIframe: () => void
}

/**
 * Attaches a focus listener to the iframe's contentWindow if accessible.
 * Cross-origin iframes may throw a SecurityError here — we guard with try-catch.
 */
function tryAttachContentWindowFocusListener(
  iframe: HTMLIFrameElement,
  handler: () => void,
): () => void {
  try {
    const contentWindow = iframe.contentWindow
    if (contentWindow) {
      contentWindow.addEventListener('focus', handler)
      return () => contentWindow.removeEventListener('focus', handler)
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
 * - Tracks loading state via iframe load event
 * - Listens to contentWindow focus to activate the owning window (best-effort for cross-origin)
 * - Provides a ref callback to attach to the iframe element
 * - Provides focusIframe() to forward focus into the iframe content
 *
 * Note: contentWindow focus tracking may not work for cross-origin iframes
 * due to browser security restrictions. The iframe wrapper's onPointerDown
 * handles activation in that case.
 */
export function useIframeWindow({
  windowId,
}: UseIframeWindowOptions): UseIframeWindowReturn {
  const actions = useProcessActions()
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  // Keep latest focus handler in a ref so the effect doesn't need to re-run
  const focusHandlerRef = useRef<() => void>(() => {
    actions.activate(windowId)
  })

  // Keep focusHandlerRef in sync before paint
  useLayoutEffect(() => {
    focusHandlerRef.current = () => {
      actions.activate(windowId)
    }
  }, [actions, windowId])

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)

    // Re-attach contentWindow listener after load (best-effort)
    const iframe = iframeRef.current
    if (iframe && focusHandlerRef.current) {
      tryAttachContentWindowFocusListener(iframe, focusHandlerRef.current)
    }
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe)
      return

    iframe.addEventListener('load', handleIframeLoad)

    // Try to attach contentWindow listener immediately (best-effort)
    let detach: () => void = () => {}
    if (focusHandlerRef.current) {
      detach = tryAttachContentWindowFocusListener(iframe, focusHandlerRef.current)
    }

    return () => {
      iframe.removeEventListener('load', handleIframeLoad)
      detach()
    }
  }, [handleIframeLoad])

  const focusIframe = useCallback(() => {
    iframeRef.current?.contentWindow?.focus()
  }, [])

  return {
    iframeRef: (el) => {
      iframeRef.current = el
    },
    isLoading,
    focusIframe,
  }
}
