import { Button } from '@murasaki/react98'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Win98-style balloon notification that appears above the notification area
 * when the Service Worker detects a cache update.
 *
 * Rendered via portal to document.body to avoid ancestor overflow clipping.
 * Anchors to a hidden marker element inside the notification area.
 *
 */
export function SwUpdateBalloon(): React.ReactElement {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<{ bottom: number, right: number } | null>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const handler = (): void => setVisible(true)
    window.addEventListener('sw-update', handler)
    return () => window.removeEventListener('sw-update', handler)
  }, [])

  // Compute portal position from anchor element
  useEffect(() => {
    if (!visible)
      return
    const anchor = anchorRef.current
    if (!anchor)
      return

    const rect = anchor.getBoundingClientRect()
    setPosition({
      bottom: window.innerHeight - rect.top + 8,
      right: window.innerWidth - rect.right,
    })
  }, [visible])

  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  const handleDismiss = useCallback(() => {
    setVisible(false)
  }, [])

  return (
    <>
      {/* Invisible anchor to measure position */}
      <span ref={anchorRef} className="absolute right-0 top-0 w-0 h-0 pointer-events-none" />

      {visible && position && createPortal(
        <div
          className="fixed w-65 z-9999"
          style={{ bottom: position.bottom, right: position.right }}
        >
          {/* Balloon body */}
          <div className="bg-(--info-window) border border-(--window-frame) shadow-[2px_2px_0_var(--button-dk-shadow)] p-2">
            {/* Title row */}
            <div className="flex items-start justify-between mb-1.5">
              <span className="font-bold text-(--info-text) leading-tight">
                Software Update
              </span>
              <button
                type="button"
                aria-label="Close"
                className="w-3.5 h-3 flex items-center justify-center bg-(--button-face) shadow-(--shadow-raised) active:shadow-(--shadow-sunken) border-none cursor-pointer shrink-0 ml-2 mt-px"
                onClick={handleDismiss}
              >
                <svg fill="none" height={6} viewBox="0 0 6 6" width={6}>
                  <path
                    clipRule="evenodd"
                    d="M0 0H1V1H2V2H3V3H4V2H5V1H6V2H5V3H4V4H5V5H6V6H5V5H4V4H3V3H2V4H1V5H0V4H1V3H2V2H1V1H0V0Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Message */}
            <p className="text-(--info-text) leading-snug mb-2">
              Programs have been updated. Please refresh to apply changes.
            </p>

            {/* Action button */}
            <div className="flex justify-end">
              <Button onClick={handleRefresh} className="min-w-18.75">
                Refresh
              </Button>
            </div>
          </div>

          {/* Balloon tail (triangle pointing down toward notification area) */}
          <div className="absolute -bottom-1.5 right-3">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-(--window-frame)" />
            <div className="absolute -top-1.75 left-px w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-(--info-window)" />
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
