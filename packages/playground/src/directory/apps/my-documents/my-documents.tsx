import type { ReactElement } from 'react'
import type { ProcessComponentProps } from '../../../contexts/process/types'
import type { FileGridView } from './file-grid'
import type { FsFile } from './filesystem'
import {
  MenuCheckboxItem,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  ScrollArea,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
  WindowStatusBar,
  WindowStatusBarField,
} from '@murasaki-io/react98'
import { useEffect, useMemo, useState } from 'react'
import { useProcessActions } from '../../../contexts/process/hooks'
import { assetPath } from '../../../lib/asset-path'
import { EXPLORER_TOOLBAR_ICONS } from '../../../lib/playground-assets'
import { InactiveClickGuard } from '../../../shell/window/inactive-click-guard'
import { FileGrid } from './file-grid'
import {
  DEFAULT_PATH,
  folderSize,
  formatAddress,
  formatSize,
  FS_ICONS,
  resolveFolder,
} from './filesystem'
import { FolderTree } from './folder-tree'

const ICONS = EXPLORER_TOOLBAR_ICONS

interface NavState {
  history: string[][]
  index: number
}

function ToolbarButton({ label, icon, disabled, pressed, onClick }: {
  label: string
  icon: string
  disabled?: boolean
  pressed?: boolean
  onClick?: () => void
}): ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      data-pressed={pressed || undefined}
      className="flex size-6 shrink-0 items-center justify-center border-none bg-transparent p-0 focus:outline-none not-disabled:hover:shadow-(--shadow-raised) not-disabled:active:shadow-(--shadow-sunken) data-pressed:shadow-(--shadow-sunken)"
    >
      <img src={assetPath(icon)} alt="" className="size-5 pixelated" draggable={false} />
    </button>
  )
}

function ToolbarSeparator(): ReactElement {
  return <div className="mx-0.5 h-5 self-center border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
}

function CloseGlyph(): ReactElement {
  return (
    <svg aria-hidden="true" width="6" height="6" viewBox="0 0 6 6" fill="currentColor" shapeRendering="crispEdges">
      <rect x="0" y="0" width="1" height="1" />
      <rect x="1" y="1" width="1" height="1" />
      <rect x="2" y="2" width="1" height="1" />
      <rect x="3" y="3" width="1" height="1" />
      <rect x="4" y="4" width="1" height="1" />
      <rect x="5" y="5" width="1" height="1" />
      <rect x="5" y="0" width="1" height="1" />
      <rect x="4" y="1" width="1" height="1" />
      <rect x="3" y="2" width="1" height="1" />
      <rect x="2" y="3" width="1" height="1" />
      <rect x="1" y="4" width="1" height="1" />
      <rect x="0" y="5" width="1" height="1" />
    </svg>
  )
}

function AddressDropdown(): ReactElement {
  return (
    <div aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center bg-(--button-face) shadow-(--shadow-raised)">
      <svg width="7" height="4" viewBox="0 0 7 4" fill="currentColor" shapeRendering="crispEdges">
        <rect x="0" y="0" width="7" height="1" />
        <rect x="1" y="1" width="5" height="1" />
        <rect x="2" y="2" width="3" height="1" />
        <rect x="3" y="3" width="1" height="1" />
      </svg>
    </div>
  )
}

export function MyDocuments({ windowId }: ProcessComponentProps): ReactElement {
  const { close, open, title } = useProcessActions()
  const [nav, setNav] = useState<NavState>({ history: [[...DEFAULT_PATH]], index: 0 })
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [showTree, setShowTree] = useState(true)
  const [treeWidth, setTreeWidth] = useState(180)
  const [view, setView] = useState<FileGridView>('large')

  const path = nav.history[nav.index]
  const folder = useMemo(() => resolveFolder(path), [path])
  const canBack = nav.index > 0
  const canForward = nav.index < nav.history.length - 1
  const canUp = path.length > 1

  useEffect(() => {
    title(windowId, folder ? folder.name : 'My Documents')
  }, [folder, title, windowId])

  const navigate = (next: string[]): void => {
    setSelectedName(null)
    setNav(current => ({
      history: [...current.history.slice(0, current.index + 1), next],
      index: current.index + 1,
    }))
  }

  const back = (): void => {
    setSelectedName(null)
    setNav(current => (current.index > 0 ? { ...current, index: current.index - 1 } : current))
  }

  const forward = (): void => {
    setSelectedName(null)
    setNav(current => (current.index < current.history.length - 1 ? { ...current, index: current.index + 1 } : current))
  }

  const up = (): void => {
    if (canUp)
      navigate(path.slice(0, -1))
  }

  const openFile = (file: FsFile): void => {
    if (file.openApp)
      open(file.openApp)
  }

  const startSplitDrag = (event: React.PointerEvent<HTMLDivElement>): void => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = treeWidth
    const onMove = (moveEvent: PointerEvent): void => {
      setTreeWidth(Math.min(360, Math.max(120, startWidth + moveEvent.clientX - startX)))
    }
    const onUp = (): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const objectCount = folder?.children.length ?? 0
  const totalSize = folder ? folderSize(folder) : 0

  return (
    <div className="flex h-full min-h-0 flex-col bg-(--surface) text-(--window-text)">
      <InactiveClickGuard windowId={windowId}>
        <WindowMenuBar>
          <WindowMenuBarMenu value="file">
            <WindowMenuBarTrigger>
              <span className="underline">F</span>
              ile
            </WindowMenuBarTrigger>
            <WindowMenuBarContent>
              <MenuItem disabled>New</MenuItem>
              <MenuItem disabled>Open</MenuItem>
              <MenuSeparator />
              <MenuItem onClick={() => close(windowId)}>Close</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="edit">
            <WindowMenuBarTrigger>
              <span className="underline">E</span>
              dit
            </WindowMenuBarTrigger>
            <WindowMenuBarContent>
              <MenuItem disabled>Cut</MenuItem>
              <MenuItem disabled>Copy</MenuItem>
              <MenuItem disabled>Paste</MenuItem>
              <MenuSeparator />
              <MenuItem disabled>Select All</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="view">
            <WindowMenuBarTrigger>
              <span className="underline">V</span>
              iew
            </WindowMenuBarTrigger>
            <WindowMenuBarContent>
              <MenuCheckboxItem checked={showTree} onCheckedChange={setShowTree}>Folder List</MenuCheckboxItem>
              <MenuSeparator />
              <MenuRadioGroup value={view} onValueChange={value => setView(value as FileGridView)}>
                <MenuRadioItem value="large">Large Icons</MenuRadioItem>
                <MenuRadioItem value="list">List</MenuRadioItem>
              </MenuRadioGroup>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="help">
            <WindowMenuBarTrigger>
              <span className="underline">H</span>
              elp
            </WindowMenuBarTrigger>
            <WindowMenuBarContent>
              <MenuItem disabled>About Windows 98</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
        </WindowMenuBar>
      </InactiveClickGuard>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-(--button-shadow) bg-(--button-face) px-1 py-0.5">
        <ToolbarButton label="Back" icon={canBack ? ICONS.back : ICONS.backDisabled} disabled={!canBack} onClick={back} />
        <ToolbarButton label="Forward" icon={canForward ? ICONS.forward : ICONS.forwardDisabled} disabled={!canForward} onClick={forward} />
        <ToolbarButton label="Up One Level" icon={ICONS.up} disabled={!canUp} onClick={up} />
        <ToolbarSeparator />
        <ToolbarButton label="Cut" icon={ICONS.cut} disabled />
        <ToolbarButton label="Copy" icon={ICONS.copy} disabled />
        <ToolbarButton label="Paste" icon={ICONS.paste} disabled />
        <ToolbarSeparator />
        <ToolbarButton label="Properties" icon={ICONS.properties} disabled />
        <ToolbarSeparator />
        <ToolbarButton label="Views" icon={ICONS.views} onClick={() => setView(v => (v === 'large' ? 'list' : 'large'))} />
        <ToolbarButton label="Folders" icon={ICONS.folders} pressed={showTree} onClick={() => setShowTree(v => !v)} />
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-2 border-b border-(--button-shadow) bg-(--button-face) px-2 py-0.5">
        <span className="shrink-0 text-(--button-text)">Address</span>
        <div className="flex min-w-0 flex-1 items-center gap-1 bg-(--window) py-0.5 pl-1 shadow-(--shadow-border-field)">
          <img
            src={assetPath(folder?.icon ?? FS_ICONS.folder)}
            alt=""
            className="size-4 pixelated shrink-0"
            draggable={false}
          />
          <span className="flex-1 truncate text-(--window-text)">{formatAddress(path)}</span>
          <AddressDropdown />
        </div>
      </div>

      {/* Split view (shared sunken frame) */}
      <div className="m-0.5 flex min-h-0 flex-1 bg-(--window) shadow-(--shadow-border-field)">
        {showTree && (
          <>
            <div className="flex min-h-0 flex-col" style={{ width: treeWidth }}>
              <div className="flex items-center justify-between gap-1 py-0.5 pl-1 pr-0.5">
                <span className="text-(--button-text)">Folders</span>
                <button
                  type="button"
                  aria-label="Close folder list"
                  onClick={() => setShowTree(false)}
                  className="flex size-4 items-center justify-center bg-(--button-face) text-(--button-text) shadow-(--shadow-raised) active:shadow-(--shadow-sunken) focus:outline-none"
                >
                  <CloseGlyph />
                </button>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <FolderTree currentPath={path} onNavigate={navigate} />
              </ScrollArea>
            </div>
            <div
              role="separator"
              aria-orientation="vertical"
              onPointerDown={startSplitDrag}
              className="w-1 shrink-0 cursor-ew-resize bg-(--button-face)"
            />
          </>
        )}
        <ScrollArea className="min-h-0 min-w-0 flex-1 bg-(--window)">
          {folder
            ? (
                <FileGrid
                  folder={folder}
                  view={view}
                  selectedName={selectedName}
                  onSelect={setSelectedName}
                  onOpenFolder={name => navigate([...path, name])}
                  onOpenFile={openFile}
                />
              )
            : null}
        </ScrollArea>
      </div>

      {/* Status bar */}
      <WindowStatusBar className="px-0.5 py-0.5">
        <WindowStatusBarField grow>
          {objectCount}
          {' '}
          object(s)
        </WindowStatusBarField>
        <WindowStatusBarField grow={false} className="w-24">
          {totalSize > 0 ? formatSize(totalSize) : ''}
        </WindowStatusBarField>
        <WindowStatusBarField grow={false} className="flex w-32 items-center gap-1">
          <img src={assetPath(FS_ICONS.myComputer)} alt="" className="size-4 pixelated shrink-0" draggable={false} />
          <span className="truncate">My Computer</span>
        </WindowStatusBarField>
      </WindowStatusBar>
    </div>
  )
}
