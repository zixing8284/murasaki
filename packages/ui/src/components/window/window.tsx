import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'
import { cva } from 'class-variance-authority'

import { useLayoutEffect, useState } from 'react'

import { createPortal } from 'react-dom'

import { useWindowDraggable } from './use-window-draggable'

const windowVariants = cva([
  'shadow-[inset_-1px_-1px_var(--color-window-frame),inset_1px_1px_var(--color-btn-hilight),inset_-2px_-2px_var(--color-btn-shadow),inset_2px_2px_var(--color-btn-light)]',
  'bg-btn-face',
  'inline-flex',
  'flex-col',
  'min-w-[200px]',
  'w-[520px]',
  'max-h-[80%]',
  'p-1',
  'mx-auto',
])

/**
 * Title bar - composes base layout with active/inactive state variants
 */
const titleBarStateVariants = cva(
  [
    'flex',
    'items-center',
    'justify-between',
    'h-[18px]',
    'mb-1',
    'px-0.5',
    'text-[11px]',
    'font-bold',
    'select-none',
  ],
  {
    variants: {
      active: {
        true: 'bg-linear-to-r from-title-active to-title-active-gradient text-title-active-text',
        false: 'bg-linear-to-r from-title-inactive to-title-inactive-gradient text-title-inactive-text',
      },
    },
    defaultVariants: {
      active: true,
    },
  },
)

const titleBarButtonVariants = cva([
  'w-4',
  'h-3.5',
  'flex-center',
  'bg-btn-face',
  'shadow-raised',
  'active:shadow-sunken',
  'disabled:pointer-events-none',
  'disabled:cursor-not-allowed',
  'disabled:shadow-raised',
  'p-0',
  'border-none',
])

const contentVariants = cva([
  'flex-1',
  'bg-window-bg',
  'text-window-text',
  'p-2',
  'overflow-auto',
  // "shadow-sunken",
  // I want to use it to make the scrollbar look like it's sunken into the content area
  'sunken-panel',
])

// Title bar button icon classes using custom utilities defined in globals.css
// See: globals.css @utility bgi-icon-* definitions
const titleBtnIcon = {
  close: 'bgi-icon-close',
  help: 'bgi-icon-help',
  maximize: 'bgi-icon-maximize',
  maximizeDisabled: 'bgi-icon-maximize-disabled',
  minimize: 'bgi-icon-minimize',
  restore: 'bgi-icon-restore',
}

function getMaximizeIcon(disabled: boolean, isMaximized: boolean): string {
  if (disabled)
    return titleBtnIcon.maximizeDisabled
  if (isMaximized)
    return titleBtnIcon.restore
  return titleBtnIcon.maximize
}

interface WindowProps
  extends Omit<React.ComponentProps<'div'>, 'title'>,
  VariantProps<typeof windowVariants> {
  /** Whether window appears active (focused) */
  active?: boolean
  /**
   * Container element for the window.
   *
   * - `undefined` (default): Window uses fixed positioning, rendered at body level
   *   via portal, dragging constrained to viewport (like `<dialog>`)
   * - `document.body`: Same as undefined - fixed positioning
   * - `HTMLElement`: Window uses absolute positioning within that container,
   *   rendered via portal, dragging/maximize constrained to container bounds
   * - `React.RefObject<HTMLElement | null>`: Same as HTMLElement, but accepts a ref object.
   *   The ref is resolved safely in an effect to avoid render-phase warnings.
   */
  appendTo?: HTMLElement | React.RefObject<HTMLElement | null>
  /** Disable maximize button */
  disableMaximize?: boolean
  /** Enable drag behavior via title bar */
  draggable?: boolean
  /** Initial maximized state */
  maximize?: boolean
  /** Close button callback */
  onClose?: () => void
  /** Maximize button callback */
  onMaximize?: () => void
  /** Minimize button callback */
  onMinimize?: () => void
  /**
   * Callback when overlay is clicked.
   * Commonly used to close the modal by clicking outside.
   */
  onOverlayClick?: () => void
  /**
   * Show overlay backdrop behind window.
   * When true, renders a semi-transparent backdrop.
   * - Fixed to viewport when appendTo is undefined/body
   * - Absolute within container when appendTo is specified
   * Useful for modal dialogs.
   */
  overlay?: boolean
  /** Show close button */
  showClose?: boolean
  /** Show help button */
  showHelp?: boolean
  /** Show maximize button */
  showMaximize?: boolean
  /** Show minimize button */
  showMinimize?: boolean
  /** Window title displayed in title bar */
  title?: React.ReactNode
}

export function Window({
  active = true,
  appendTo,
  children,
  className,
  disableMaximize = false,
  draggable = false,
  maximize = false,
  onClose,
  onMaximize,
  onMinimize,
  onOverlayClick,
  overlay = false,
  showClose = true,
  showHelp = false,
  showMaximize = true,
  showMinimize = true,
  title = 'Window',
  ...props
}: WindowProps): React.ReactElement | null {
  const [isMaximized, setIsMaximized] = useState(maximize)

  // Helper to check if value is a RefObject (has 'current' property)
  const isRefObject = (
    val: unknown,
  ): val is React.RefObject<HTMLElement | null> => {
    return val !== null && typeof val === 'object' && 'current' in val
  }

  // Resolve appendTo to actual DOM element.
  // For non-ref values, initialize synchronously. For RefObject, start as null.
  const [mountedTarget, setMountedTarget] = useState<HTMLElement | null>(() => {
    if (!appendTo || appendTo === document.body)
      return document.body
    if (appendTo instanceof HTMLElement)
      return appendTo
    // RefObject: defer resolution to effect (cannot access .current in render)
    return null
  })

  // Resolve RefObject targets after mount.
  // useLayoutEffect ensures the target is resolved before paint, preventing visual flicker.
  // The setState call here is intentional: it's a one-time sync when the ref becomes available.
  useLayoutEffect(() => {
    let newTarget: HTMLElement | null = null

    if (!appendTo || appendTo === document.body) {
      newTarget = document.body
    }
    else if (appendTo instanceof HTMLElement) {
      newTarget = appendTo
    }
    else if (isRefObject(appendTo)) {
      // For RefObject, check .current - it may be null on first effect run
      // if the ref is attached to a sibling/parent that renders in the same cycle.
      // We need to re-check after a microtask to catch late ref assignments.
      if (appendTo.current) {
        newTarget = appendTo.current
      }
      else {
        // Schedule a re-check after React finishes attaching refs
        const rafId = requestAnimationFrame(() => {
          if (appendTo.current && appendTo.current !== mountedTarget) {
            setMountedTarget(appendTo.current)
          }
        })
        return () => {
          cancelAnimationFrame(rafId)
        }
      }
    }

    // Only update if target actually changed (avoids unnecessary re-renders)
    if (newTarget && newTarget !== mountedTarget) {
      queueMicrotask(() => setMountedTarget(newTarget))
    }

    return undefined
  }, [appendTo, mountedTarget])

  // Derive positioning mode from resolved target
  const isAppendToBody = mountedTarget === document.body

  const { dragRef: headerRef, targetRef: windowRef } = useWindowDraggable<
    HTMLDivElement,
    HTMLDivElement
  >({
    container: isAppendToBody ? null : mountedTarget,
    draggable: draggable && !isMaximized,
  })

  // Defer rendering until target is resolved (for RefObject case)
  if (!mountedTarget)
    return null

  const handleMaximize = (): void => {
    setIsMaximized(prev => !prev)
    onMaximize?.()
  }

  // Window element
  const windowElement = (
    <div
      className={cn(
        windowVariants(),
        'top-1/2 right-0 left-0 -translate-y-1/2',
        isAppendToBody ? 'fixed' : 'absolute',
        isMaximized
        && `inset-0 size-full! max-h-full translate-y-0!
          transform-[translate(0px,0px)]!`,
        className,
      )}
      ref={windowRef}
      {...props}
    >
      {/* Title Bar */}
      <div className={titleBarStateVariants({ active })}>
        <div
          className={cn(
            'flex flex-1 items-center gap-1 truncate px-1',
            draggable && !isMaximized && 'cursor-move',
          )}
          ref={headerRef}
        >
          {title}
        </div>
        <div className="flex gap-0.5">
          {showHelp && (
            <button
              aria-label="Help"
              className={cn(titleBarButtonVariants(), titleBtnIcon.help)}
              type="button"
            />
          )}
          {showMinimize && (
            <button
              aria-label="Minimize"
              className={cn(titleBarButtonVariants(), titleBtnIcon.minimize)}
              onClick={onMinimize}
              type="button"
            />
          )}
          {showMaximize && (
            <button
              aria-label="Maximize"
              className={cn(
                titleBarButtonVariants(),
                getMaximizeIcon(disableMaximize, isMaximized),
              )}
              disabled={disableMaximize}
              onClick={handleMaximize}
              type="button"
            />
          )}
          {showClose && (
            <button
              aria-label="Close"
              className={cn(titleBarButtonVariants(), titleBtnIcon.close)}
              onClick={onClose}
              type="button"
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className={contentVariants()}>{children}</div>
    </div>
  )

  // Overlay element
  const overlayElement = overlay && (
    <div
      aria-hidden="true"
      className={cn('inset-0 bg-black/30', isAppendToBody ? 'fixed' : 'absolute')}
      onClick={onOverlayClick}
    />
  )

  // Always render via portal to resolved target
  return createPortal(
    <>
      {overlayElement}
      {windowElement}
    </>,
    mountedTarget,
  )
}
