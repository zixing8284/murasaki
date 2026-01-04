import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'
import { cva } from 'class-variance-authority'

import { useState } from 'react'

import { createPortal } from 'react-dom'

import { useWindowDraggable } from './use-window-draggable'

const windowVariants = cva([
  'shadow-[inset_-1px_-1px_var(--color-window-frame),inset_1px_1px_var(--color-btn-hilight),inset_-2px_-2px_var(--color-btn-shadow),inset_2px_2px_var(--color-btn-light)]',
  'bg-btn-face',
  'inline-flex',
  'flex-col',
  'min-w-50',
  'w-130',
  'max-h-[80%]',
  'p-1',
  'mx-auto',
])

const titleBarVariants = cva([
  'flex',
  'items-center',
  'justify-between',
  'h-4.5',
  'mb-1',
  'px-0.5',
  'text-[11px]',
  'font-bold',
  'select-none',
])

const titleBarActiveVariants = cva([
  'bg-linear-to-r',
  'from-title-active',
  'to-title-active-gradient',
  'text-title-active-text',
])

const titleBarInactiveVariants = cva([
  'bg-linear-to-r',
  'from-title-inactive',
  'to-title-inactive-gradient',
  'text-title-inactive-text',
])

const titleBarButtonsVariants = cva(['flex', 'gap-0.5'])

const titleBarButtonVariants = cva([
  'w-4',
  'h-3.5',
  'flex-center',
  'bg-btn-face',
  'shadow-raised',
  'active:shadow-sunken',
  'disabled:opacity-50',
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

const overlayVariants = cva(['inset-0', 'bg-black/30'])

const titleBtnIconBase = 'bg-no-repeat'

const TITLE_BAR_BUTTON_CONFIG = [
  {
    iconClass: `${titleBtnIconBase} bg-[url('/assets/icons/help.svg')] bg-position-[top_2px_left_5px]`,
    key: 'help',
    label: 'Help',
  },
  {
    iconClass: `${titleBtnIconBase} bg-[url('/assets/icons/minimize.svg')] bg-position-[bottom_3px_left_4px]`,
    key: 'minimize',
    label: 'Minimize',
  },
  {
    iconClass: `${titleBtnIconBase} bg-[url('/assets/icons/maximize.svg')] bg-position-[top_2px_left_3px]`,
    key: 'maximize',
    label: 'Maximize',
  },
  {
    iconClass: `${titleBtnIconBase} bg-[url('/assets/icons/close.svg')] bg-position-[top_3px_left_4px]`,
    key: 'close',
    label: 'Close',
  },
] as const

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
   * - Other element: Window uses absolute positioning within that container,
   *   rendered via portal, dragging/maximize constrained to container bounds
   */
  appendTo?: HTMLElement
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
}: WindowProps): React.ReactElement {
  const [isMaximized, setIsMaximized] = useState(maximize)

  const isAppendToBody = appendTo === document.body || !appendTo
  const portalTarget = isAppendToBody ? document.body : appendTo

  const { dragRef: headerRef, targetRef: windowRef } = useWindowDraggable<
    HTMLDivElement,
    HTMLDivElement
  >({
    container: isAppendToBody ? null : portalTarget,
    draggable: draggable && !isMaximized,
  })

  const handleMaximize = (): void => {
    setIsMaximized(prev => !prev)
    onMaximize?.()
  }

  // Map button keys to their visibility and click handlers
  const buttonHandlers: Record<
    string,
    { onClick?: (() => void) | undefined, show: boolean }
  > = {
    close: { ...(onClose && { onClick: onClose }), show: showClose },
    help: { show: showHelp },
    maximize: { onClick: handleMaximize, show: showMaximize },
    minimize: { ...(onMinimize && { onClick: onMinimize }), show: showMinimize },
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
      <div
        className={cn(
          titleBarVariants(),
          active ? titleBarActiveVariants() : titleBarInactiveVariants(),
        )}
      >
        <div
          className={cn(
            'flex flex-1 items-center gap-1 truncate px-1',
            draggable && !isMaximized && 'cursor-move',
          )}
          ref={headerRef}
        >
          {title}
        </div>
        <div className={titleBarButtonsVariants()}>
          {TITLE_BAR_BUTTON_CONFIG.map((btn) => {
            const handler = buttonHandlers[btn.key]
            if (!handler || !handler.show)
              return null
            return (
              <button
                aria-label={btn.label}
                className={cn(titleBarButtonVariants(), btn.iconClass)}
                key={btn.key}
                onClick={handler.onClick}
                type="button"
              />
            )
          })}
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
      className={cn(overlayVariants(), isAppendToBody ? 'fixed' : 'absolute')}
      onClick={onOverlayClick}
    />
  )

  // Always render via portal
  return createPortal(
    <>
      {overlayElement}
      {windowElement}
    </>,
    portalTarget,
  )
}
