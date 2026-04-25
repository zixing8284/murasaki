/**
 * Interaction boundary for Webamp's embedded window manager.
 *
 * Webamp mixes React element handlers with document/window listeners.
 * Most controls clean up on regular `mouseup` / `touchend`, but the
 * marquee drag handler in the vendored bundle listens for the typo event
 * `touseup` instead of `mouseup`. Because the player is embedded inside
 * a pointer-events-transparent host, releases can also land on the
 * desktop or another window. This hook normalizes that boundary: any
 * interaction that starts inside Webamp gets a guaranteed release/cancel
 * signal even if it ends outside the host, on blur, or during unmount.
 */

import type { RefObject } from 'react'
import { useEffect } from 'react'

type InteractionKind = 'mouse' | 'touch'

interface ActiveInteraction {
  kind: InteractionKind
  target: Element
}

function eventTargetNode(event: Event): Node | null {
  return event.target instanceof Node ? event.target : null
}

function dispatchMouseupFallback(target: Element, event?: MouseEvent): void {
  target.dispatchEvent(new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    button: event?.button ?? 0,
    buttons: event?.buttons ?? 0,
    clientX: event?.clientX ?? 0,
    clientY: event?.clientY ?? 0,
  }))
}

function dispatchWebampMouseRelease(): void {
  document.dispatchEvent(new Event('touseup', { bubbles: true, cancelable: true }))
}

function dispatchTouchEndFallback(): void {
  document.dispatchEvent(new Event('touchend', { bubbles: true, cancelable: true }))
}

export function useWebampInteractionBoundary(
  containerRef: RefObject<HTMLDivElement | null>,
): void {
  useEffect(() => {
    const host = containerRef.current
    if (!host)
      return

    let active: ActiveInteraction | null = null

    const begin = (event: Event, kind: InteractionKind): void => {
      active = event.target instanceof Element
        ? { kind, target: event.target }
        : null
    }

    const finish = (event?: Event): void => {
      const interaction = active
      active = null
      if (!interaction)
        return

      if (interaction.kind === 'mouse') {
        // Webamp's marquee cleanup listens for the misspelled custom
        // document event `touseup`. Dispatch it for every mouse release
        // that began inside Webamp; inactive listeners simply ignore it.
        dispatchWebampMouseRelease()
      }
      else {
        dispatchTouchEndFallback()
      }

      const targetNode = event ? eventTargetNode(event) : null
      if (targetNode && host.contains(targetNode))
        return

      if (interaction.kind === 'mouse')
        dispatchMouseupFallback(interaction.target, event instanceof MouseEvent ? event : undefined)
    }

    const onMouseDown = (event: MouseEvent): void => begin(event, 'mouse')
    const onTouchStart = (event: TouchEvent): void => begin(event, 'touch')
    const onMouseUp = (event: MouseEvent): void => finish(event)
    const onTouchEnd = (event: TouchEvent): void => finish(event)
    const onCancel = (): void => finish()
    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden')
        finish()
    }

    host.addEventListener('mousedown', onMouseDown, true)
    host.addEventListener('touchstart', onTouchStart, true)
    window.addEventListener('mouseup', onMouseUp, true)
    window.addEventListener('touchend', onTouchEnd, true)
    window.addEventListener('touchcancel', onTouchEnd, true)
    window.addEventListener('blur', onCancel)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      finish()
      host.removeEventListener('mousedown', onMouseDown, true)
      host.removeEventListener('touchstart', onTouchStart, true)
      window.removeEventListener('mouseup', onMouseUp, true)
      window.removeEventListener('touchend', onTouchEnd, true)
      window.removeEventListener('touchcancel', onTouchEnd, true)
      window.removeEventListener('blur', onCancel)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [containerRef])
}

export { useWebampInteractionBoundary as useWebampPointerCleanup }
