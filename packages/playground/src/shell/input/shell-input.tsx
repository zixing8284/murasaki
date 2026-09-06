import type { ReactNode } from 'react'
import type { ShellInputContextValue, ShellInputPoint, ShellInputSession, ShellInputSource, ShellInputSurface } from './shell-input-registry'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { closestInteractive, ShellInputContext } from './shell-input-registry'

interface ActiveSession {
  session: ShellInputSession
  source: ShellInputSource
  touchId: number | null
}

function eventModifierPoint(source: ShellInputSource, clientX: number, clientY: number, event: MouseEvent | TouchEvent): ShellInputPoint {
  return {
    clientX,
    clientY,
    source,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
  }
}

function findTouch(list: TouchList, identifier: number): Touch | null {
  for (let index = 0; index < list.length; index += 1) {
    const touch = list[index]
    if (touch && touch.identifier === identifier)
      return touch
  }
  return null
}

function pointInElement(point: ShellInputPoint, element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return point.clientX >= rect.left
    && point.clientX <= rect.right
    && point.clientY >= rect.top
    && point.clientY <= rect.bottom
}

export function ShellInputProvider({
  children,
  rootElement,
}: {
  children: ReactNode
  rootElement: HTMLElement | null
}): React.ReactElement {
  const surfacesRef = useRef(new Map<string, ShellInputSurface>())
  const activeRef = useRef<ActiveSession | null>(null)
  const iframePointerEventsRef = useRef<Map<HTMLIFrameElement, string> | null>(null)
  const lastTouchEndRef = useRef<{ x: number, y: number, time: number } | null>(null)

  const setIframesDisabled = useCallback((disabled: boolean): void => {
    if (disabled) {
      if (iframePointerEventsRef.current)
        return
      const previous = new Map<HTMLIFrameElement, string>()
      document.querySelectorAll<HTMLIFrameElement>('iframe').forEach((iframe) => {
        previous.set(iframe, iframe.style.pointerEvents)
        iframe.style.pointerEvents = 'none'
      })
      iframePointerEventsRef.current = previous
      return
    }

    iframePointerEventsRef.current?.forEach((value, iframe) => {
      iframe.style.pointerEvents = value
    })
    iframePointerEventsRef.current = null
  }, [])

  const registerSurface = useCallback((surface: ShellInputSurface): (() => void) => {
    surfacesRef.current.set(surface.id, surface)
    return () => {
      const current = surfacesRef.current.get(surface.id)
      if (current === surface)
        surfacesRef.current.delete(surface.id)
    }
  }, [])

  useEffect(() => () => {
    activeRef.current?.session.onCancel?.()
    activeRef.current = null
    setIframesDisabled(false)
  }, [setIframesDisabled])

  useEffect(() => {
    if (!rootElement)
      return

    const getSurfaces = (): ShellInputSurface[] => Array.from(surfacesRef.current.values())
      .filter(surface => surface.element && (surface.enabled?.() ?? true))
      .sort((a, b) => b.priority - a.priority)

    const finishActive = (point: ShellInputPoint): void => {
      const active = activeRef.current
      if (!active)
        return
      active.session.onEnd?.(point)
      activeRef.current = null
      if (active.session.captureIframes)
        setIframesDisabled(false)
    }

    const cancelActive = (): void => {
      const active = activeRef.current
      if (!active)
        return
      active.session.onCancel?.()
      activeRef.current = null
      if (active.session.captureIframes)
        setIframesDisabled(false)
    }

    const startAtPoint = (point: ShellInputPoint, event: MouseEvent | TouchEvent, touchId: number | null): void => {
      if (activeRef.current)
        return

      for (const surface of getSurfaces()) {
        const element = surface.element
        if (!element)
          continue
        const contains = surface.contains ? surface.contains(point) : pointInElement(point, element)
        if (!contains)
          continue

        const session = surface.onStart(point)
        if (!session)
          continue

        if (event.cancelable)
          event.preventDefault()
        event.stopPropagation()
        activeRef.current = { session, source: point.source, touchId }
        if (session.captureIframes)
          setIframesDisabled(true)
        return
      }
    }

    const handleMouseDown = (event: MouseEvent): void => {
      if (event.button !== 0)
        return
      startAtPoint(eventModifierPoint('mouse', event.clientX, event.clientY, event), event, null)
    }

    const handleMouseMove = (event: MouseEvent): void => {
      const active = activeRef.current
      if (!active || active.source !== 'mouse')
        return
      if (event.cancelable)
        event.preventDefault()
      event.stopPropagation()
      active.session.onMove?.(eventModifierPoint('mouse', event.clientX, event.clientY, event))
    }

    const handleMouseUp = (event: MouseEvent): void => {
      const active = activeRef.current
      if (!active || active.source !== 'mouse')
        return
      if (event.cancelable)
        event.preventDefault()
      event.stopPropagation()
      finishActive(eventModifierPoint('mouse', event.clientX, event.clientY, event))
    }

    const handleTouchStart = (event: TouchEvent): void => {
      if (event.changedTouches.length !== 1)
        return
      const touch = event.changedTouches[0]
      if (!touch)
        return
      startAtPoint(eventModifierPoint('touch', touch.clientX, touch.clientY, event), event, touch.identifier)
    }

    const handleTouchMove = (event: TouchEvent): void => {
      const active = activeRef.current
      if (!active || active.source !== 'touch' || active.touchId === null)
        return
      const touch = findTouch(event.changedTouches, active.touchId)
      if (!touch)
        return
      if (event.cancelable)
        event.preventDefault()
      event.stopPropagation()
      active.session.onMove?.(eventModifierPoint('touch', touch.clientX, touch.clientY, event))
    }

    const handleTouchEnd = (event: TouchEvent): void => {
      if (event.changedTouches.length === 1) {
        const touch = event.changedTouches[0]
        if (touch)
          lastTouchEndRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
      }

      const active = activeRef.current
      if (!active || active.source !== 'touch' || active.touchId === null)
        return
      const touch = findTouch(event.changedTouches, active.touchId)
      if (!touch)
        return
      if (event.cancelable)
        event.preventDefault()
      event.stopPropagation()
      finishActive(eventModifierPoint('touch', touch.clientX, touch.clientY, event))
    }

    const handleTouchCancel = (event: TouchEvent): void => {
      const active = activeRef.current
      if (!active || active.source !== 'touch' || active.touchId === null)
        return
      if (!findTouch(event.changedTouches, active.touchId))
        return
      cancelActive()
    }

    const handleClickCapture = (event: MouseEvent): void => {
      const touch = lastTouchEndRef.current
      lastTouchEndRef.current = null
      if (!touch || Date.now() - touch.time > 700)
        return

      const adjustedInteractive = closestInteractive(event.target)
      if (!adjustedInteractive || !rootElement.contains(adjustedInteractive))
        return

      const rawInteractive = closestInteractive(document.elementFromPoint(touch.x, touch.y))
      if (rawInteractive === adjustedInteractive || (rawInteractive !== null && adjustedInteractive.contains(rawInteractive)))
        return

      event.preventDefault()
      event.stopPropagation()
    }

    const handleBlur = (): void => cancelActive()
    const handleVisibility = (): void => {
      if (document.visibilityState === 'hidden')
        cancelActive()
    }

    rootElement.addEventListener('mousedown', handleMouseDown, true)
    rootElement.addEventListener('touchstart', handleTouchStart, { capture: true, passive: false })
    rootElement.addEventListener('click', handleClickCapture, true)
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mouseup', handleMouseUp, true)
    document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false })
    document.addEventListener('touchend', handleTouchEnd, true)
    document.addEventListener('touchcancel', handleTouchCancel, true)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      rootElement.removeEventListener('mousedown', handleMouseDown, true)
      rootElement.removeEventListener('touchstart', handleTouchStart, true)
      rootElement.removeEventListener('click', handleClickCapture, true)
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('mouseup', handleMouseUp, true)
      document.removeEventListener('touchmove', handleTouchMove, true)
      document.removeEventListener('touchend', handleTouchEnd, true)
      document.removeEventListener('touchcancel', handleTouchCancel, true)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibility)
      cancelActive()
    }
  }, [rootElement, setIframesDisabled])

  const value = useMemo<ShellInputContextValue>(() => ({ registerSurface }), [registerSurface])

  return <ShellInputContext value={value}>{children}</ShellInputContext>
}
