import { useCallback } from 'react'

import { useDraggable } from '../../hooks/use-draggable'
import { useResizable } from '../../hooks/use-resizable'
import {
  WindowButtons,
  WindowCloseButton,
  WindowMaximizeButton,
  WindowMinimizeButton,
} from './window-buttons'
import { WindowContent } from './window-content'
import { WindowFrame } from './window-frame'
import { WindowProvider } from './window-provider'
import { WindowResizeGrip } from './window-resize-grip'
import { WindowTitle } from './window-title'
import { WindowTitleBar } from './window-title-bar'

export interface WindowPosition {
  /** Horizontal offset from the left edge of the positioning context, in px. */
  x?: number
  /** Vertical offset from the top edge of the positioning context, in px. */
  y?: number
}

export interface WindowSize {
  /** Initial width in px. */
  width?: number
  /** Initial height in px. */
  height?: number
}

export interface WindowProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** Window title shown in the title bar. */
  title?: React.ReactNode
  /** Icon rendered before the title. */
  icon?: React.ReactNode
  /**
   * Initial top-left position, applied as static `left`/`top` inline styles.
   * Dragging then adds a `translate()` transform on top of this base position.
   */
  defaultPosition?: WindowPosition
  /**
   * Initial size, applied as `width`/`height` inline styles.
   * Resizing then rewrites those inline styles directly.
   */
  defaultSize?: WindowSize
  /** Whether dragging the title bar moves the window. Default: true. */
  draggable?: boolean
  /** Whether the bottom-right grip resizes the window. Default: true. */
  resizable?: boolean
  /** Minimum width while resizing (px). Defaults to `defaultSize.width` or 200. */
  minWidth?: number
  /** Minimum height while resizing (px). Defaults to `defaultSize.height` or 120. */
  minHeight?: number
  /** Maximum width while resizing (px). */
  maxWidth?: number
  /** Maximum height while resizing (px). */
  maxHeight?: number
  /** Whether the window appears active/focused. Default: true. */
  active?: boolean
  /** Whether the window is minimized (hidden via CSS). Default: false. */
  minimized?: boolean
  /** Initial maximized state. Default: false. */
  defaultMaximized?: boolean
  /** Whether the window can be maximized. Default: true. */
  maximizable?: boolean
  /** Whether to render the minimize button. Default: true. */
  minimizable?: boolean
  /** Whether to render the close button. Default: true. */
  closable?: boolean
  /** Positioning mode. Default: 'absolute'. */
  positioning?: 'absolute' | 'fixed'
  /** Boundary element that constrains drag and resize. Default: viewport. */
  container?: HTMLElement | null
  /** Extra title-bar buttons rendered after minimize/maximize/close. */
  titleBarButtons?: React.ReactNode
  /** Class for the content body. */
  contentClassName?: string
  /** Class for the title bar. */
  titleBarClassName?: string
  /** Called when the close button is clicked. */
  onClose?: () => void
  /** Called when the minimize button is clicked. */
  onMinimize?: () => void
}

/**
 * A ready-to-use window shell that composes the Window primitives with
 * drag (via title bar) and resize (via bottom-right grip) already wired up.
 *
 * Prefer this for the common "title + content" case. For menu bars, status
 * bars, portals, or custom chrome, compose `WindowProvider`, `WindowFrame`,
 * `WindowTitleBar`, and friends directly.
 */
export function Window({
  title,
  icon,
  children,
  defaultPosition,
  defaultSize,
  draggable = true,
  resizable = true,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  active = true,
  minimized = false,
  defaultMaximized = false,
  maximizable = true,
  minimizable = true,
  closable = true,
  positioning = 'absolute',
  container,
  titleBarButtons,
  className,
  contentClassName,
  titleBarClassName,
  style,
  ref,
  onClose,
  onMinimize,
  ...props
}: WindowProps): React.ReactElement {
  const {
    dragging,
    setDragRef,
    setTargetRef: setDragTargetRef,
  } = useDraggable<HTMLDivElement, HTMLDivElement>({ container: container ?? null, draggable })

  const {
    resizing,
    setResizeRef,
    setTargetRef: setResizeTargetRef,
  } = useResizable<HTMLDivElement, HTMLDivElement>({
    container: container ?? null,
    resizable,
    minWidth: minWidth ?? defaultSize?.width ?? 200,
    minHeight: minHeight ?? defaultSize?.height ?? 120,
    ...(maxWidth !== undefined && { maxWidth }),
    ...(maxHeight !== undefined && { maxHeight }),
  })

  // Both hooks target the frame element, so combine their ref callbacks and
  // forward any consumer ref through the same callback.
  const setFrameRef = useCallback(
    (el: HTMLDivElement | null): void => {
      setDragTargetRef(el)
      setResizeTargetRef(el)
      if (typeof ref === 'function') {
        ref(el)
      }
      else if (ref) {
        ref.current = el
      }
    },
    [setDragTargetRef, setResizeTargetRef, ref],
  )

  const frameStyle: React.CSSProperties = {
    ...style,
    ...(defaultPosition?.x !== undefined && { left: defaultPosition.x }),
    ...(defaultPosition?.y !== undefined && { top: defaultPosition.y }),
    ...(defaultSize?.width !== undefined && { width: defaultSize.width }),
    ...(defaultSize?.height !== undefined && { height: defaultSize.height }),
  }

  return (
    <WindowProvider
      active={active}
      minimized={minimized}
      defaultMaximized={defaultMaximized}
      positioning={positioning}
      maximizable={maximizable}
    >
      <WindowFrame
        ref={setFrameRef}
        className={className}
        style={frameStyle}
        data-dragging={dragging || undefined}
        data-resizing={resizing || undefined}
        {...props}
      >
        <WindowTitleBar ref={setDragRef} className={titleBarClassName}>
          <WindowTitle icon={icon}>{title}</WindowTitle>
          <WindowButtons>
            {minimizable && <WindowMinimizeButton onClick={onMinimize} />}
            {maximizable && <WindowMaximizeButton />}
            {closable && <WindowCloseButton onClick={onClose} />}
            {titleBarButtons}
          </WindowButtons>
        </WindowTitleBar>
        <WindowContent className={contentClassName}>{children}</WindowContent>
        {resizable && <WindowResizeGrip ref={setResizeRef} />}
      </WindowFrame>
    </WindowProvider>
  )
}
