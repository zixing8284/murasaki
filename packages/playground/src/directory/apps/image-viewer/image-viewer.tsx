import type { ReactElement } from 'react'
import type { VfsNode } from '../../../contexts/file-system'
import type { ProcessComponentProps } from '../../../contexts/process/types'
import {
  Button,
  ScrollArea,
  WindowStatusBar,
  WindowStatusBarField,
} from '@murasaki-io/react98'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  associate,
  getFile,
  getName,
  getParentPath,
  listChildren,
} from '../../../contexts/file-system'
import { useProcessActions, useProcessLaunch } from '../../../contexts/process/hooks'
import { InactiveClickGuard } from '../../../shell/window/inactive-click-guard'

// Discrete zoom stops (percent) stepped through by the +/- buttons.
const ZOOM_STOPS = [10, 25, 50, 75, 100, 150, 200, 400, 800] as const
const DEFAULT_ZOOM = 100

/** Transparent-background checkerboard so PNG/SVG/WebP alpha reads clearly. */
const CHECKER_STYLE = {
  backgroundImage:
    'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
  backgroundColor: '#c0c0c0',
} as const

function ToolButton({ label, disabled, onClick, children }: {
  label: string
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}): ReactElement {
  return (
    <Button flat aria-label={label} title={label} disabled={disabled} onClick={onClick} className="min-w-8 px-2">
      {children}
    </Button>
  )
}

export function ImageViewer({ windowId }: ProcessComponentProps): ReactElement {
  const launch = useProcessLaunch(windowId)
  const { title } = useProcessActions()
  const [currentPath, setCurrentPath] = useState<string | null>(launch?.path ?? null)
  const [siblings, setSiblings] = useState<VfsNode[]>([])
  const [src, setSrc] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number, height: number } | null>(null)
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM)
  const [fit, setFit] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Follow the launched file (and any later re-launch onto the same window).
  useEffect(() => {
    if (launch?.path)
      setCurrentPath(launch.path)
  }, [launch?.nonce, launch?.path])

  const name = currentPath ? getName(currentPath) : 'Image Viewer'

  useEffect(() => {
    title(windowId, currentPath ? `${name} - Image Viewer` : 'Image Viewer')
  }, [currentPath, name, title, windowId])

  // Load sibling image files (for Previous / Next) from the same folder.
  useEffect(() => {
    if (!currentPath) {
      setSiblings([])
      return
    }
    let active = true
    listChildren(getParentPath(currentPath))
      .then((children) => {
        if (active)
          setSiblings(children.filter(child => child.type === 'file' && associate(child.name).category === 'image'))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [currentPath])

  // Resolve the current node to an object URL, revoked on change/unmount.
  useEffect(() => {
    if (!currentPath) {
      setSrc(null)
      return
    }
    let active = true
    let objectUrl: string | null = null
    setSrc(null)
    setNaturalSize(null)
    getFile(currentPath)
      .then((file) => {
        if (!active || !file)
          return
        objectUrl = URL.createObjectURL(file)
        setSrc(objectUrl)
        setZoom(DEFAULT_ZOOM)
        setFit(true)
      })
      .catch(() => {})
    return () => {
      active = false
      if (objectUrl)
        URL.revokeObjectURL(objectUrl)
    }
  }, [currentPath])

  const index = useMemo(
    () => (currentPath ? siblings.findIndex(node => node.path === currentPath) : -1),
    [siblings, currentPath],
  )
  const canPrev = index > 0
  const canNext = index >= 0 && index < siblings.length - 1

  const goPrev = (): void => {
    if (canPrev)
      setCurrentPath(siblings[index - 1].path)
  }
  const goNext = (): void => {
    if (canNext)
      setCurrentPath(siblings[index + 1].path)
  }

  const zoomIn = (): void => {
    setFit(false)
    setZoom(current => ZOOM_STOPS.find(stop => stop > current) ?? current)
  }
  const zoomOut = (): void => {
    setFit(false)
    setZoom(current => [...ZOOM_STOPS].reverse().find(stop => stop < current) ?? current)
  }
  const actualSize = (): void => {
    setFit(false)
    setZoom(DEFAULT_ZOOM)
  }

  const handleOpenLocal = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file)
      return
    setSrc((previous) => {
      if (previous?.startsWith('blob:'))
        URL.revokeObjectURL(previous)
      return URL.createObjectURL(file)
    })
    setCurrentPath(null)
    setSiblings([])
    setNaturalSize(null)
    setZoom(DEFAULT_ZOOM)
    setFit(true)
    title(windowId, `${file.name} - Image Viewer`)
  }

  const scaledStyle = fit
    ? { maxWidth: '100%', maxHeight: '100%' }
    : naturalSize
      ? { width: naturalSize.width * (zoom / 100), height: naturalSize.height * (zoom / 100), maxWidth: 'none' as const }
      : {}

  return (
    <div className="flex h-full min-h-0 flex-col bg-(--surface) text-(--window-text)">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" aria-label="Open image" onChange={handleOpenLocal} />

      <InactiveClickGuard windowId={windowId}>
        <div className="flex items-center gap-0.5 border-b border-(--button-shadow) bg-(--button-face) px-1 py-0.5">
          <ToolButton label="Open" onClick={() => fileInputRef.current?.click()}>Open…</ToolButton>
          <div className="mx-0.5 self-stretch border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
          <ToolButton label="Previous image" disabled={!canPrev} onClick={goPrev}>◀</ToolButton>
          <ToolButton label="Next image" disabled={!canNext} onClick={goNext}>▶</ToolButton>
          <div className="mx-0.5 self-stretch border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
          <ToolButton label="Zoom out" disabled={!src} onClick={zoomOut}>−</ToolButton>
          <ToolButton label="Zoom in" disabled={!src} onClick={zoomIn}>+</ToolButton>
          <ToolButton label="Actual size" disabled={!src} onClick={actualSize}>1:1</ToolButton>
          <Button flat active={fit} aria-label="Fit to window" title="Fit to window" disabled={!src} onClick={() => setFit(value => !value)} className="min-w-8 px-2">
            Fit
          </Button>
        </div>
      </InactiveClickGuard>

      <div className="m-0.5 min-h-0 flex-1 shadow-(--shadow-border-field)">
        <ScrollArea className="h-full">
          <div className="flex h-full min-h-full w-full items-center justify-center p-2" style={CHECKER_STYLE}>
            {src
              ? (
                  <img
                    src={src}
                    alt={name}
                    draggable={false}
                    className="select-none"
                    style={scaledStyle}
                    onLoad={(event) => {
                      const image = event.currentTarget
                      setNaturalSize({ width: image.naturalWidth, height: image.naturalHeight })
                    }}
                  />
                )
              : (
                  <span className="text-(--gray-text)">No image loaded</span>
                )}
          </div>
        </ScrollArea>
      </div>

      <WindowStatusBar>
        <WindowStatusBarField grow>{name}</WindowStatusBarField>
        <WindowStatusBarField grow={false} className="w-28 justify-center">
          {naturalSize ? `${naturalSize.width} × ${naturalSize.height}` : ''}
        </WindowStatusBarField>
        <WindowStatusBarField grow={false} className="w-16 justify-center">
          {fit ? 'Fit' : `${zoom}%`}
        </WindowStatusBarField>
      </WindowStatusBar>
    </div>
  )
}
