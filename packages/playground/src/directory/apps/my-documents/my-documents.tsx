import type { ReactElement, ReactNode } from 'react'
import type { VfsNode } from '../../../contexts/file-system'
import type { ProcessComponentProps } from '../../../contexts/process/types'
import type { FileGridView } from './file-grid'
import type { SortKey } from './sort'
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  Menu,
  MenuCheckboxItem,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  ProgressIndicator,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  TextBox,
  useContextMenu,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
  WindowStatusBar,
  WindowStatusBarField,
} from '@murasaki-io/react98'
import { useEffect, useState } from 'react'
import {
  associate,
  DEFAULT_PATH,
  fromSegments,
  getName,
  getParentPath,
  isAncestorOrSelf,
  openAppForNode,
  RECYCLE_BIN_PATH,
  toSegments,
  useAllNodes,
  useFileSystem,
  useFolderChildren,
} from '../../../contexts/file-system'
import { useProcessActions, useProcessLaunch } from '../../../contexts/process/hooks'
import { assetPath } from '../../../lib/asset-path'
import { ICON } from '../../../lib/icons'
import { EXPLORER_TOOLBAR_ICONS } from '../../../lib/playground-assets'
import { InactiveClickGuard } from '../../../shell/window/inactive-click-guard'
import { DialogWindow } from '../../shared/dialog-window'
import { FileGrid } from './file-grid'
import { formatAddress, formatSize, FS_ICONS } from './filesystem'
import { FolderTree } from './folder-tree'
import { sortNodes } from './sort'

const ICONS = EXPLORER_TOOLBAR_ICONS

// Order the Views toolbar button and Ctrl+cycling step through.
const VIEW_CYCLE: readonly FileGridView[] = ['large', 'small', 'list', 'details', 'thumbnails']
const RECENT_LIMIT = 10

// Windows 98 embossed splitter grip: two 1px dotted columns.
const SPLITTER_GRIP_STYLE = {
  backgroundImage:
    'linear-gradient(to bottom, var(--button-hilight) 1px, transparent 1px), linear-gradient(to bottom, var(--button-shadow) 1px, transparent 1px)',
  backgroundSize: '1px 4px, 1px 4px',
  backgroundPosition: '0 0, 1px 1px',
  backgroundRepeat: 'repeat-y, repeat-y',
} as const

interface NavState {
  history: string[][]
  index: number
}

/** Renders a label with a single underlined accelerator character. */
function withAccel(text: string, index: number): ReactNode {
  return (
    <span>
      {text.slice(0, index)}
      <span className="underline">{text.charAt(index)}</span>
      {text.slice(index + 1)}
    </span>
  )
}

function ToolbarButton({ label, icon, disabled, pressed, showText, onClick }: {
  label: string
  icon: string
  disabled?: boolean
  pressed?: boolean
  showText?: boolean
  onClick?: () => void
}): ReactElement {
  const iconState = disabled
    ? 'opacity-50 grayscale'
    : pressed
      ? ''
      : 'grayscale group-hover:grayscale-0 group-active:grayscale-0'
  return (
    <Button
      {...(pressed ? { active: true } : { flat: true })}
      iconOnly={!showText}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`group shrink-0${showText ? ' flex h-auto min-w-0 flex-col items-center justify-center gap-0.5 px-2 py-0.5' : ''}`}
    >
      <img src={assetPath(icon)} alt="" className={`size-5 shrink-0 pixelated ${iconState}`} draggable={false} />
      {showText && <span className="leading-none">{label}</span>}
    </Button>
  )
}

function ToolbarSeparator(): ReactElement {
  return <div className="mx-0.5 my-0.5 w-0 self-stretch border-l border-l-(--button-shadow) border-r border-r-(--button-hilight)" />
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

/** History (recent locations) dropdown driven by the shared context menu. */
function HistoryTrigger({ disabled, showText }: { disabled: boolean, showText?: boolean }): ReactElement {
  const { openAt } = useContextMenu()
  return (
    <Button
      flat
      iconOnly={!showText}
      aria-label="Recent locations"
      title="Recent locations"
      disabled={disabled}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        openAt(rect.left, rect.bottom)
      }}
      className={`group shrink-0${showText ? ' flex h-auto min-w-0 flex-col items-center justify-center gap-0.5 px-2 py-0.5' : ''}`}
    >
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={`size-4 shrink-0${disabled ? ' opacity-50' : ''}`}>
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" strokeLinecap="square" />
      </svg>
      {showText && <span className="leading-none">History</span>}
    </Button>
  )
}

interface FolderContentProps {
  children: ReactNode
  writable: boolean
  onContextTarget: (path: string | null) => void
  onDeselect: () => void
  onDropFiles: (files: File[]) => void
}

/**
 * Content pane wrapper: opens the shared context menu at the pointer (reporting
 * the item path or blank space), deselects on blank clicks, and accepts dropped
 * files into a writable folder.
 */
function FolderContent({ children, writable, onContextTarget, onDeselect, onDropFiles }: FolderContentProps): ReactElement {
  const { openAt } = useContextMenu()
  const [dropActive, setDropActive] = useState(false)

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>): void => {
    const el = (event.target as HTMLElement).closest('[data-fs-path]')
    onContextTarget(el?.getAttribute('data-fs-path') ?? null)
    event.preventDefault()
    openAt(event.clientX, event.clientY)
  }
  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (!(event.target as HTMLElement).closest('[data-fs-path]'))
      onDeselect()
  }
  const hasFiles = (event: React.DragEvent): boolean =>
    Array.from(event.dataTransfer.types).includes('Files')

  return (
    <ScrollArea className="min-h-0 min-w-0 flex-1 bg-(--window)">
      <div
        className="min-h-full min-w-full"
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        onDragEnter={(event) => {
          if (writable && hasFiles(event))
            event.stopPropagation()
        }}
        onDragOver={(event) => {
          if (!writable || !hasFiles(event))
            return
          event.preventDefault()
          event.stopPropagation()
          event.dataTransfer.dropEffect = 'copy'
          setDropActive(true)
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={(event) => {
          if (!writable || !hasFiles(event))
            return
          event.preventDefault()
          event.stopPropagation()
          setDropActive(false)
          onDropFiles(Array.from(event.dataTransfer.files))
        }}
      >
        <div className={dropActive ? 'min-h-full outline-2 -outline-offset-2 outline-dotted outline-(--hilight)' : 'min-h-full'}>
          {children}
        </div>
      </div>
    </ScrollArea>
  )
}

function ImportProgressDialog({ done, total }: { done: number, total: number }): ReactElement {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <DialogWindow title="Copying…" onClose={() => {}}>
      <div className="flex w-72 flex-col gap-2 p-3">
        <p>
          Copying
          {total}
          {' '}
          item(s) to this folder…
        </p>
        <ProgressIndicator value={percent} />
        <p className="text-(--gray-text)">
          {done}
          {' of '}
          {total}
          {' complete'}
        </p>
      </div>
    </DialogWindow>
  )
}

function ConfirmDeleteDialog({ node, permanent, onCancel, onConfirm }: {
  node: VfsNode
  permanent: boolean
  onCancel: () => void
  onConfirm: () => void
}): ReactElement {
  return (
    <DialogWindow title={permanent ? 'Confirm File Delete' : 'Confirm Delete'} onClose={onCancel}>
      <div className="flex w-80 max-w-[90vw] flex-col gap-3 p-4">
        <p>
          {permanent
            ? `Are you sure you want to permanently delete ‘${node.name}’?`
            : `Are you sure you want to send ‘${node.name}’ to the Recycle Bin?`}
        </p>
        <div className="flex justify-end gap-2">
          <Button className="px-6" onClick={onConfirm}>Yes</Button>
          <Button className="px-6" onClick={onCancel}>No</Button>
        </div>
      </div>
    </DialogWindow>
  )
}

function ConfirmEmptyDialog({ count, onCancel, onConfirm }: {
  count: number
  onCancel: () => void
  onConfirm: () => void
}): ReactElement {
  return (
    <DialogWindow title="Confirm Multiple File Delete" onClose={onCancel}>
      <div className="flex w-80 max-w-[90vw] flex-col gap-3 p-4">
        <p>{`Are you sure you want to permanently delete these ${count} item(s)?`}</p>
        <div className="flex justify-end gap-2">
          <Button className="px-6" onClick={onConfirm}>Yes</Button>
          <Button className="px-6" onClick={onCancel}>No</Button>
        </div>
      </div>
    </DialogWindow>
  )
}

export function MyDocuments({ windowId }: ProcessComponentProps): ReactElement {
  const { open, title } = useProcessActions()
  const launch = useProcessLaunch(windowId)
  const fs = useFileSystem()
  const allNodes = useAllNodes()

  const [nav, setNav] = useState<NavState>(() => ({ history: [[...toSegments(DEFAULT_PATH)]], index: 0 }))
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [renamePath, setRenamePath] = useState<string | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [sort, setSort] = useState<{ key: SortKey, dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' })
  const [view, setView] = useState<FileGridView>('large')
  const [showTree, setShowTree] = useState(true)
  const [treeWidth, setTreeWidth] = useState(180)
  const [showStandardButtons, setShowStandardButtons] = useState(true)
  const [showAddressBar, setShowAddressBar] = useState(true)
  const [showToolbarText, setShowToolbarText] = useState(true)
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [contextPath, setContextPath] = useState<string | null>(null)
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null)
  const [importState, setImportState] = useState<{ done: number, total: number } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ node: VfsNode, permanent: boolean } | null>(null)
  const [confirmEmpty, setConfirmEmpty] = useState(false)

  const path = nav.history[nav.index]
  const canonicalPath = fromSegments(path)
  const inRecycleBin = canonicalPath === RECYCLE_BIN_PATH
  const canBack = nav.index > 0
  const canForward = nav.index < nav.history.length - 1
  const canUp = path.length > 1

  const { children } = useFolderChildren(canonicalPath)
  const nodeByPath = new Map(allNodes.map(node => [node.path, node]))
  const folderNode = nodeByPath.get(canonicalPath) ?? null
  const writable = folderNode != null && !folderNode.system

  const searchQuery = search.trim().toLowerCase()
  const searching = searchQuery.length > 0
  const baseNodes = searching
    ? allNodes.filter(node =>
        node.path !== canonicalPath
        && isAncestorOrSelf(canonicalPath, node.path)
        && node.name.toLowerCase().includes(searchQuery))
    : children
  const displayNodes = sortNodes(baseNodes, sort)

  const contextNode = contextPath ? displayNodes.find(node => node.path === contextPath) ?? null : null
  const selectedNode = selectedPath ? displayNodes.find(node => node.path === selectedPath) ?? null : null

  // Record every visited folder and reset per-folder UI state on navigation.
  useEffect(() => {
    setSelectedPath(null)
    setRenamePath(null)
    setSearch('')
    setRecent(previous => [canonicalPath, ...previous.filter(entry => entry !== canonicalPath)].slice(0, RECENT_LIMIT))
  }, [canonicalPath])

  useEffect(() => {
    title(windowId, folderNode ? folderNode.name : getName(canonicalPath))
  }, [folderNode, canonicalPath, title, windowId])

  // Navigate to a folder requested at open time (e.g. the Recycle Bin icon).
  useEffect(() => {
    const target = launch?.path
    if (!target)
      return
    setNav(current => (fromSegments(current.history[current.index]) === target
      ? current
      : { history: [...current.history.slice(0, current.index + 1), toSegments(target)], index: current.index + 1 }))
  }, [launch?.nonce, launch?.path])

  const navigate = (targetCanonical: string): void => {
    if (targetCanonical === canonicalPath)
      return
    setNav(current => ({
      history: [...current.history.slice(0, current.index + 1), toSegments(targetCanonical)],
      index: current.index + 1,
    }))
  }

  const back = (): void => setNav(current => (current.index > 0 ? { ...current, index: current.index - 1 } : current))
  const forward = (): void => setNav(current => (current.index < current.history.length - 1 ? { ...current, index: current.index + 1 } : current))
  const up = (): void => {
    if (canUp)
      navigate(getParentPath(canonicalPath))
  }

  const openNode = (node: VfsNode): void => {
    if (node.type === 'folder') {
      navigate(node.path)
      return
    }
    const appId = openAppForNode(node)
    if (appId)
      open(appId, { launch: { path: node.path } })
  }

  const cycleView = (): void => {
    setView(current => VIEW_CYCLE[(VIEW_CYCLE.indexOf(current) + 1) % VIEW_CYCLE.length])
  }

  const arrangeBy = (key: SortKey): void => setSort({ key, dir: 'asc' })
  const sortByColumn = (key: SortKey): void => {
    setSort(current => (current.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  const createFolder = async (): Promise<void> => {
    if (!writable)
      return
    const node = await fs.createFolder(canonicalPath)
    setSelectedPath(node.path)
    setRenamePath(node.path)
  }

  const createFile = async (name: string): Promise<void> => {
    if (!writable)
      return
    const association = associate(name)
    const node = await fs.createFile(canonicalPath, {
      name,
      kind: association.kind,
      icon: association.icon,
      mimeType: association.category === 'text' ? 'text/plain' : undefined,
      openApp: association.openApp,
      textContent: '',
    })
    setSelectedPath(node.path)
    setRenamePath(node.path)
  }

  const commitRename = async (targetPath: string, value: string): Promise<void> => {
    setRenamePath(null)
    const trimmed = value.trim()
    if (!trimmed)
      return
    const node = await fs.rename(targetPath, trimmed)
    if (node)
      setSelectedPath(node.path)
  }

  const runDelete = async (): Promise<void> => {
    if (!confirmDelete)
      return
    const { node, permanent } = confirmDelete
    setConfirmDelete(null)
    if (selectedPath === node.path)
      setSelectedPath(null)
    if (permanent)
      await fs.remove(node.path)
    else
      await fs.recycle(node.path)
  }

  const requestDelete = (node: VfsNode): void => {
    setConfirmDelete({ node, permanent: inRecycleBin })
  }

  const restore = async (node: VfsNode): Promise<void> => {
    if (selectedPath === node.path)
      setSelectedPath(null)
    await fs.restore(node.path)
  }

  const runEmptyRecycleBin = async (): Promise<void> => {
    setConfirmEmpty(false)
    setSelectedPath(null)
    await fs.emptyRecycleBin()
  }

  const importDropped = async (files: File[]): Promise<void> => {
    if (!writable || files.length === 0)
      return
    setImportState({ done: 0, total: files.length })
    try {
      await fs.importFiles(canonicalPath, files, (done, total) => setImportState({ done, total }))
    }
    finally {
      setImportState(null)
    }
  }

  const toggleSearch = (): void => {
    setShowSearch((visible) => {
      if (visible)
        setSearch('')
      return !visible
    })
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

  const objectCount = displayNodes.length
  const totalSize = displayNodes.reduce((sum, node) => (node.type === 'file' ? sum + node.size : sum), 0)
  const addressCrumbs = path.map((_, index) => path.slice(0, index + 1))
  const recentLocations = recent.filter(entry => entry !== canonicalPath)

  return (
    <div ref={setContentEl} className="flex h-full min-h-0 flex-col bg-(--surface) text-(--window-text)">
      <InactiveClickGuard windowId={windowId}>
        <WindowMenuBar>
          <WindowMenuBarMenu value="file">
            <WindowMenuBarTrigger>
              <span className="underline">F</span>
              ile
            </WindowMenuBarTrigger>
            <WindowMenuBarContent>
              <MenuSub>
                <MenuSubTrigger reserveIconSpace disabled={!writable}>{withAccel('New', 0)}</MenuSubTrigger>
                <MenuSubContent>
                  <MenuItem reserveIconSpace onClick={createFolder}>Folder</MenuItem>
                  <MenuSeparator />
                  <MenuItem reserveIconSpace onClick={() => createFile('New Text Document.txt')}>Text Document</MenuItem>
                  <MenuItem reserveIconSpace onClick={() => createFile('New HTML Document.html')}>HTML Document</MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuItem reserveIconSpace disabled={!contextNode && !selectedNode} onClick={() => openNode((contextNode ?? selectedNode)!)}>{withAccel('Open', 0)}</MenuItem>
              <MenuSeparator />
              <MenuItem reserveIconSpace disabled={!selectedNode || inRecycleBin} onClick={() => selectedNode && setRenamePath(selectedNode.path)}>Rename</MenuItem>
              <MenuItem reserveIconSpace disabled={!selectedNode || selectedNode.system} onClick={() => selectedNode && requestDelete(selectedNode)}>{withAccel('Delete', 0)}</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="edit">
            <WindowMenuBarTrigger>
              <span className="underline">E</span>
              dit
            </WindowMenuBarTrigger>
            <WindowMenuBarContent>
              <MenuItem reserveIconSpace disabled>{withAccel('Cut', 2)}</MenuItem>
              <MenuItem reserveIconSpace disabled>{withAccel('Copy', 0)}</MenuItem>
              <MenuItem reserveIconSpace disabled>{withAccel('Paste', 0)}</MenuItem>
              <MenuSeparator />
              <MenuItem reserveIconSpace disabled>{withAccel('Select All', 7)}</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="view">
            <WindowMenuBarTrigger>
              <span className="underline">V</span>
              iew
            </WindowMenuBarTrigger>
            <WindowMenuBarContent>
              <MenuSub>
                <MenuSubTrigger reserveIconSpace>{withAccel('Toolbars', 0)}</MenuSubTrigger>
                <MenuSubContent>
                  <MenuCheckboxItem checked={showStandardButtons} onCheckedChange={setShowStandardButtons}>{withAccel('Standard Buttons', 9)}</MenuCheckboxItem>
                  <MenuCheckboxItem checked={showAddressBar} onCheckedChange={setShowAddressBar}>{withAccel('Address Bar', 0)}</MenuCheckboxItem>
                  <MenuCheckboxItem checked={showToolbarText} onCheckedChange={setShowToolbarText}>{withAccel('Show Text', 5)}</MenuCheckboxItem>
                </MenuSubContent>
              </MenuSub>
              <MenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>{withAccel('Status Bar', 7)}</MenuCheckboxItem>
              <MenuCheckboxItem checked={showSearch} onCheckedChange={toggleSearch}>{withAccel('Search', 0)}</MenuCheckboxItem>
              <MenuSeparator />
              <MenuRadioGroup value={view} onValueChange={value => setView(value as FileGridView)}>
                <MenuRadioItem value="large">{withAccel('Large Icons', 0)}</MenuRadioItem>
                <MenuRadioItem value="small">{withAccel('Small Icons', 0)}</MenuRadioItem>
                <MenuRadioItem value="list">{withAccel('List', 1)}</MenuRadioItem>
                <MenuRadioItem value="details">{withAccel('Details', 0)}</MenuRadioItem>
                <MenuRadioItem value="thumbnails">{withAccel('Thumbnails', 0)}</MenuRadioItem>
              </MenuRadioGroup>
              <MenuSeparator />
              <MenuSub>
                <MenuSubTrigger reserveIconSpace>{withAccel('Arrange Icons', 0)}</MenuSubTrigger>
                <MenuSubContent>
                  <MenuRadioGroup value={sort.key} onValueChange={value => arrangeBy(value as SortKey)}>
                    <MenuRadioItem value="name">by Name</MenuRadioItem>
                    <MenuRadioItem value="type">by Type</MenuRadioItem>
                    <MenuRadioItem value="size">by Size</MenuRadioItem>
                    <MenuRadioItem value="modified">by Date</MenuRadioItem>
                  </MenuRadioGroup>
                </MenuSubContent>
              </MenuSub>
              <MenuCheckboxItem checked={showTree} onCheckedChange={setShowTree}>{withAccel('Folders', 0)}</MenuCheckboxItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="help">
            <WindowMenuBarTrigger>
              <span className="underline">H</span>
              elp
            </WindowMenuBarTrigger>
            <WindowMenuBarContent>
              <MenuItem reserveIconSpace disabled>{withAccel('About Windows 98', 0)}</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
        </WindowMenuBar>
      </InactiveClickGuard>

      {/* Toolbar (Standard Buttons) */}
      {showStandardButtons && (
        <div className="flex items-stretch gap-0.5 border-b border-(--button-shadow) bg-(--button-face) px-1 py-0.5">
          <ToolbarButton label="Back" icon={canBack ? ICONS.back : ICONS.backDisabled} disabled={!canBack} showText={showToolbarText} onClick={back} />
          <ToolbarButton label="Forward" icon={canForward ? ICONS.forward : ICONS.forwardDisabled} disabled={!canForward} showText={showToolbarText} onClick={forward} />
          <ContextMenu container={contentEl}>
            <HistoryTrigger disabled={recentLocations.length === 0} showText={showToolbarText} />
            <ContextMenuContent>
              <Menu>
                {recentLocations.map(location => (
                  <MenuItem key={location} reserveIconSpace onClick={() => navigate(location)}>
                    {formatAddress(toSegments(location))}
                  </MenuItem>
                ))}
              </Menu>
            </ContextMenuContent>
          </ContextMenu>
          <ToolbarButton label="Up" icon={ICONS.up} disabled={!canUp} showText={showToolbarText} onClick={up} />
          <ToolbarSeparator />
          <ToolbarButton label="Search" icon={ICONS.search} pressed={showSearch} showText={showToolbarText} onClick={toggleSearch} />
          <ToolbarButton label="Folders" icon={ICONS.folders} pressed={showTree} showText={showToolbarText} onClick={() => setShowTree(value => !value)} />
          <ToolbarSeparator />
          <ToolbarButton label="Views" icon={ICONS.views} showText={showToolbarText} onClick={cycleView} />
        </div>
      )}

      {/* Address bar */}
      {showAddressBar && (
        <div className="flex items-center gap-2 border-b border-(--button-shadow) bg-(--button-face) px-2 py-0.5">
          <span className="shrink-0 text-(--button-text)">Address</span>
          <div className="flex min-w-0 flex-1">
            <Select
              value={String(path.length - 1)}
              onValueChange={(value) => {
                const depth = Number(value)
                const target = addressCrumbs[depth]
                if (target && depth !== path.length - 1)
                  navigate(fromSegments(target))
              }}
            >
              <SelectTrigger className="gap-1">
                <img src={assetPath(folderNode?.icon ?? FS_ICONS.folder)} alt="" className="size-4 shrink-0 pixelated" draggable={false} />
                <span className="min-w-0 flex-1 truncate text-left">{formatAddress(path)}</span>
              </SelectTrigger>
              <SelectContent>
                {addressCrumbs.map((crumb, depth) => (
                  <SelectItem key={crumb.join('/')} value={String(depth)} textValue={formatAddress(crumb)}>
                    <span className="flex min-w-0 items-center gap-1" style={{ paddingLeft: depth * 12 }}>
                      <img src={assetPath(nodeByPath.get(fromSegments(crumb))?.icon ?? FS_ICONS.folder)} alt="" className="size-4 shrink-0 pixelated" draggable={false} />
                      <span className="truncate">{crumb[crumb.length - 1]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Search bar */}
      {showSearch && (
        <div className="flex items-center gap-2 border-b border-(--button-shadow) bg-(--button-face) px-2 py-1">
          <img src={assetPath(ICON.searchFile.sm)} alt="" className="size-4 shrink-0 pixelated" draggable={false} />
          <TextBox
            aria-label="Search this folder"
            placeholder="Search this folder…"
            value={search}
            onValueChange={setSearch}
            wrapperClassName="flex-1"
            className="w-full"
          />
        </div>
      )}

      {/* Split view */}
      <div className="m-0.5 flex min-h-0 flex-1 bg-(--window) shadow-(--shadow-border-field)">
        {showTree && (
          <>
            <div className="flex min-h-0 flex-col" style={{ width: treeWidth }}>
              <div className="flex items-center justify-between gap-1 border-b border-(--button-shadow) px-1 py-0.5">
                <span className="text-(--button-text)">Folders</span>
                <Button flat iconOnly aria-label="Close folder list" onClick={() => setShowTree(false)} className="size-4 min-h-0">
                  <CloseGlyph />
                </Button>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <FolderTree nodes={allNodes} currentPath={canonicalPath} onNavigate={navigate} />
              </ScrollArea>
            </div>
            <div
              role="separator"
              aria-orientation="vertical"
              onPointerDown={startSplitDrag}
              className="relative w-2 shrink-0 cursor-ew-resize border-l border-l-(--button-shadow) border-r-2 border-r-(--window-frame) bg-(--button-face) shadow-[inset_1px_0_0_var(--button-hilight)]"
            >
              <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-0.75 h-7.5 w-0.5 -translate-y-1/2" style={SPLITTER_GRIP_STYLE} />
            </div>
          </>
        )}
        <ContextMenu container={contentEl}>
          <FolderContent
            writable={writable}
            onContextTarget={setContextPath}
            onDeselect={() => setSelectedPath(null)}
            onDropFiles={files => void importDropped(files)}
          >
            <FileGrid
              nodes={displayNodes}
              view={view}
              selectedPath={selectedPath}
              renamePath={renamePath}
              sort={sort}
              onSelect={setSelectedPath}
              onOpen={openNode}
              onSortByColumn={sortByColumn}
              onRenameCommit={(targetPath, value) => void commitRename(targetPath, value)}
              onRenameCancel={() => setRenamePath(null)}
            />
          </FolderContent>
          <ContextMenuContent>
            <Menu>
              {contextNode
                ? (
                    <>
                      <MenuItem reserveIconSpace className="font-bold" onClick={() => contextNode && openNode(contextNode)}>{withAccel('Open', 0)}</MenuItem>
                      {contextNode.type === 'folder'
                        ? <MenuItem reserveIconSpace onClick={() => contextNode && openNode(contextNode)}>{withAccel('Explore', 0)}</MenuItem>
                        : <MenuItem reserveIconSpace disabled>{withAccel('Explore', 0)}</MenuItem>}
                      <MenuSeparator />
                      {inRecycleBin
                        ? (
                            <>
                              <MenuItem reserveIconSpace onClick={() => contextNode && void restore(contextNode)}>{withAccel('Restore', 0)}</MenuItem>
                              <MenuItem reserveIconSpace onClick={() => contextNode && requestDelete(contextNode)}>{withAccel('Delete', 0)}</MenuItem>
                            </>
                          )
                        : (
                            <>
                              <MenuItem reserveIconSpace disabled={contextNode.system} onClick={() => setRenamePath(contextNode.path)}>{withAccel('Rename', 3)}</MenuItem>
                              <MenuItem reserveIconSpace disabled={contextNode.system} onClick={() => contextNode && requestDelete(contextNode)}>{withAccel('Delete', 0)}</MenuItem>
                            </>
                          )}
                    </>
                  )
                : (
                    <>
                      {inRecycleBin
                        ? (
                            <MenuItem reserveIconSpace disabled={objectCount === 0} onClick={() => setConfirmEmpty(true)}>Empty Recycle Bin</MenuItem>
                          )
                        : (
                            <>
                              <MenuSub>
                                <MenuSubTrigger reserveIconSpace disabled={!writable}>{withAccel('New', 0)}</MenuSubTrigger>
                                <MenuSubContent>
                                  <MenuItem reserveIconSpace onClick={createFolder}>Folder</MenuItem>
                                  <MenuSeparator />
                                  <MenuItem reserveIconSpace onClick={() => createFile('New Text Document.txt')}>Text Document</MenuItem>
                                  <MenuItem reserveIconSpace onClick={() => createFile('New HTML Document.html')}>HTML Document</MenuItem>
                                </MenuSubContent>
                              </MenuSub>
                              <MenuSeparator />
                              <MenuItem reserveIconSpace disabled={!canBack} onClick={back}>{withAccel('Back', 0)}</MenuItem>
                              <MenuItem reserveIconSpace disabled={!canForward} onClick={forward}>{withAccel('Forward', 0)}</MenuItem>
                            </>
                          )}
                      <MenuSeparator />
                      <MenuSub>
                        <MenuSubTrigger reserveIconSpace>{withAccel('View', 0)}</MenuSubTrigger>
                        <MenuSubContent>
                          <MenuRadioGroup value={view} onValueChange={value => setView(value as FileGridView)}>
                            <MenuRadioItem value="large">Large Icons</MenuRadioItem>
                            <MenuRadioItem value="small">Small Icons</MenuRadioItem>
                            <MenuRadioItem value="list">List</MenuRadioItem>
                            <MenuRadioItem value="details">Details</MenuRadioItem>
                            <MenuRadioItem value="thumbnails">Thumbnails</MenuRadioItem>
                          </MenuRadioGroup>
                        </MenuSubContent>
                      </MenuSub>
                      <MenuSub>
                        <MenuSubTrigger reserveIconSpace>{withAccel('Arrange Icons', 0)}</MenuSubTrigger>
                        <MenuSubContent>
                          <MenuRadioGroup value={sort.key} onValueChange={value => arrangeBy(value as SortKey)}>
                            <MenuRadioItem value="name">by Name</MenuRadioItem>
                            <MenuRadioItem value="type">by Type</MenuRadioItem>
                            <MenuRadioItem value="size">by Size</MenuRadioItem>
                            <MenuRadioItem value="modified">by Date</MenuRadioItem>
                          </MenuRadioGroup>
                        </MenuSubContent>
                      </MenuSub>
                    </>
                  )}
            </Menu>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {/* Status bar */}
      {showStatusBar && (
        <WindowStatusBar>
          <WindowStatusBarField grow>
            {selectedNode ? '1 object selected' : `${objectCount} object(s)`}
          </WindowStatusBarField>
          <WindowStatusBarField grow={false} className="w-24">
            {selectedNode
              ? (selectedNode.type === 'file' ? formatSize(selectedNode.size) : '')
              : (totalSize > 0 ? formatSize(totalSize) : '')}
          </WindowStatusBarField>
          <WindowStatusBarField grow={false} className="flex w-32 items-center gap-1">
            <img src={assetPath(FS_ICONS.myComputer)} alt="" className="size-4 shrink-0 pixelated" draggable={false} />
            <span className="truncate">My Computer</span>
          </WindowStatusBarField>
        </WindowStatusBar>
      )}

      {importState && <ImportProgressDialog done={importState.done} total={importState.total} />}
      {confirmDelete && (
        <ConfirmDeleteDialog
          node={confirmDelete.node}
          permanent={confirmDelete.permanent}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => void runDelete()}
        />
      )}
      {confirmEmpty && (
        <ConfirmEmptyDialog
          count={objectCount}
          onCancel={() => setConfirmEmpty(false)}
          onConfirm={() => void runEmptyRecycleBin()}
        />
      )}
    </div>
  )
}
