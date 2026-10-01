import type { ReactNode, Ref } from 'react'
import type { ProcessWindowPosition } from '../../contexts/process/types'
import {
  Window,
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowMaximizeButton,
  WindowMinimizeButton,
  WindowPortal,
  WindowResizeGrip,
  WindowTitle,
  WindowTitleBar,
} from '@murasaki-io/react98'
import { useLayoutEffect, useRef, useState } from 'react'
import { useProcess, useProcessActions, useProcesses } from '../../contexts/process/hooks'
import { assetPath } from '../../lib/asset-path'
import { AppIcon } from '../app-icon'

export interface BaseWindowProps {
  windowId: string
  children: ReactNode
  className?: string
  contentClassName?: string
  titleIcon?: ReactNode
  disableMaximize?: boolean
  disableMinimize?: boolean
  disableResize?: boolean
  /** Default window dimensions — applied as inline style for initial size */
  defaultSize?: { width?: number, height?: number }
  /** Default absolute window position — applied as inline style for initial placement */
  defaultPosition?: ProcessWindowPosition
  /** Size the frame to wrap `contentSize` (plus chrome) instead of `defaultSize`. */
  autoSize?: boolean
  /** Reported content dimensions used when `autoSize` is set. */
  contentSize?: { width: number, height: number } | null
  /**
   * Fixed size that wins over auto-fit. Set once the user manually resizes an
   * auto-sized window so later `contentSize` reports stop fighting their size.
   */
  sizeOverride?: { width: number, height: number } | null
  /** Called with the measured auto-fit dimensions (content + chrome) when they change. */
  onAutoFit?: (dims: { width: number, height: number }) => void
  /** Whether the window is currently being dragged or resized */
  isInteracting?: boolean
  /** Show the working cursor over this window while it is loading */
  loadingCursor?: boolean
  /** Callback ref for the window frame element (used by RndWindow for drag/resize targeting) */
  frameRef?: Ref<HTMLDivElement>
  /** Callback ref for the title bar element (used by RndWindow as drag handle) */
  dragRef?: Ref<HTMLDivElement>
  /** Callback ref for the resize grip element (used by RndWindow for resize handle) */
  resizeRef?: Ref<HTMLDivElement>
}

function clampInitialPosition(value: number | string | undefined, size: number | undefined): number | string | undefined {
  if (value === undefined || size === undefined)
    return value

  const length = typeof value === 'number' ? `${value}px` : value
  return `clamp(0px, round(${length}, 1px), max(0px, calc(100% - ${String(size)}px)))`
}

export function BaseWindow({
  windowId,
  children,
  className,
  contentClassName,
  titleIcon,
  disableMaximize = false,
  disableMinimize = false,
  disableResize = false,
  defaultSize,
  defaultPosition,
  autoSize = false,
  contentSize = null,
  sizeOverride = null,
  onAutoFit,
  isInteracting = false,
  loadingCursor = false,
  frameRef,
  dragRef,
  resizeRef,
}: BaseWindowProps): React.ReactElement | null {
  const win = useProcess(windowId)
  const actions = useProcessActions()
  const { processes, container } = useProcesses()
  const portalContainer = processes[windowId]?.componentWindow ?? container

  // Auto-size: measure the fixed chrome (title bar + borders) around the content
  // once and size the frame to wrap the reported content dimensions exactly.
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [autoDims, setAutoDims] = useState<{ width: number, height: number } | null>(null)
  const contentWidth = contentSize?.width
  const contentHeight = contentSize?.height
  useLayoutEffect(() => {
    if (!autoSize || contentWidth == null || contentHeight == null) {
      setAutoDims(null)
      return
    }
    const contentEl = contentRef.current
    const frameEl = contentEl?.parentElement
    if (!contentEl || !frameEl)
      return
    const chromeW = frameEl.offsetWidth - contentEl.offsetWidth
    const chromeH = frameEl.offsetHeight - contentEl.offsetHeight
    const dims = { width: contentWidth + chromeW, height: contentHeight + chromeH }
    setAutoDims(dims)
    onAutoFit?.(dims)
  }, [autoSize, contentWidth, contentHeight, onAutoFit])

  if (!win)
    return null

  const { process: proc, isActive, zIndex } = win

  const autoWidth = autoSize && autoDims ? autoDims.width : defaultSize?.width
  const autoHeight = autoSize && autoDims ? autoDims.height : defaultSize?.height
  // A user-chosen size (after manual resize) always wins over auto-fit so the
  // window can be grown to reveal in-content menus and stays put afterwards.
  const effectiveWidth = sizeOverride?.width ?? autoWidth
  const effectiveHeight = sizeOverride?.height ?? autoHeight

  const defaultIcon = proc.icon
    ? <img src={assetPath(proc.icon.sm)} alt="" className="size-4 pixelated shrink-0" draggable={false} />
    : <AppIcon appId={proc.appId} size="sm" />

  return (
    <Window active={isActive} minimized={proc.minimized} positioning="absolute" maximizable={!disableMaximize}>
      <WindowPortal container={portalContainer}>
        <WindowFrame
          ref={frameRef}
          data-window-frame=""
          data-system-cursor={loadingCursor ? 'working' : undefined}
          className={`${(isInteracting && !proc.maximized) ? 'bg-transparent! shadow-[inset_-2px_-2px_0_var(--button-shadow),inset_2px_2px_0_var(--button-shadow)]! outline-1 outline-dotted outline-(--button-shadow) *:opacity-0 *:pointer-events-none' : ''}${autoSize ? ' min-w-0! min-h-0!' : ''} ${className ?? ''}`}
          style={{
            zIndex,
            width: effectiveWidth,
            height: effectiveHeight,
            top: clampInitialPosition(defaultPosition?.top, effectiveHeight),
            right: defaultPosition?.right,
            bottom: defaultPosition?.bottom,
            left: clampInitialPosition(defaultPosition?.left, effectiveWidth),
          }}
          onPointerDown={(e) => {
            e.stopPropagation()
            actions.activate(windowId)
          }}
        >
          <WindowTitleBar
            ref={dragRef}
            className="touch-none pointer-coarse:h-6"
            onDoubleClick={disableMaximize ? undefined : () => actions.toggleMaximize(windowId)}
          >
            <WindowTitle icon={titleIcon ?? defaultIcon}>{proc.title}</WindowTitle>
            <WindowButtons>
              {!disableMinimize && <WindowMinimizeButton onClick={() => actions.minimize(windowId)} />}
              <WindowMaximizeButton
                onClick={() => actions.toggleMaximize(windowId)}
              />
              <WindowCloseButton onClick={() => actions.close(windowId)} />
            </WindowButtons>
          </WindowTitleBar>
          <WindowContent ref={contentRef} className={contentClassName}>{children}</WindowContent>
          {!disableResize && <WindowResizeGrip ref={resizeRef} />}
        </WindowFrame>
      </WindowPortal>
    </Window>
  )
}
