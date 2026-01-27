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

// Title bar button icon classes (static strings for Tailwind detection)
// See: https://tailwindcss.com/docs/detecting-classes-in-source-files#dynamic-class-names
const titleBtnIcon = {
  close:
    'bg-no-repeat bg-[url(\'/assets/icons/close.svg\')] bg-position-[top_3px_left_4px]',
  help: 'bg-no-repeat bg-[url(\'/assets/icons/help.svg\')] bg-position-[top_2px_left_5px]',
  maximize:
    'bg-no-repeat bg-[url(\'/assets/icons/maximize.svg\')] bg-position-[top_2px_left_3px]',
  maximizeDisabled:
    'bg-no-repeat bg-[url(\'/assets/icons/maximize-disabled.svg\')] bg-position-[top_2px_left_3px]',
  minimize:
    'bg-no-repeat bg-[url(\'/assets/icons/minimize.svg\')] bg-position-[bottom_3px_left_4px]',
  restore:
    'bg-no-repeat bg-[url(\'/assets/icons/restore.svg\')] bg-position-[top_2px_left_3px]',
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
   * - Other element: Window uses absolute positioning within that container,
   *   rendered via portal, dragging/maximize constrained to container bounds
   */
  appendTo?: HTMLElement
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

  // Always render via portal
  return createPortal(
    <>
      {overlayElement}
      {windowElement}
    </>,
    portalTarget,
  )
}
