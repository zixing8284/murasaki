import type { ReactElement, ReactNode } from 'react'
import type { ProcessComponentProps } from '../../../contexts/process/types'
import type { FileGridView } from './file-grid'
import type { FsFile, FsNode } from './filesystem'
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
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  useContextMenu,
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
  isFolder,
  resolveFolder,
} from './filesystem'
import { FolderTree } from './folder-tree'

const ICONS = EXPLORER_TOOLBAR_ICONS

// Order the Views toolbar button and Ctrl+cycling step through.
const VIEW_CYCLE: readonly FileGridView[] = ['large', 'small', 'list', 'details']

// Windows 98 embossed splitter grip: two 1px dotted columns (highlight offset a
// pixel up-and-left of the shadow), matching the classic folder-pane divider.
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
function withAccel(label: string, index: number): ReactNode {
  // One wrapping span so the label stays a single flex item — otherwise the
  // menu row's `gap` would open a space around the underlined letter.
  return (
    <span>
      {label.slice(0, index)}
      <span className="underline">{label.charAt(index)}</span>
      {label.slice(index + 1)}
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
  // A pressed toggle stays sunken (`active`); everything else is a flat button
  // that raises on hover and sinks while held. The icon switches between a
  // grayscale idle state and full colour on hover via a CSS filter — no second
  // asset to preload.
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

interface FolderContentProps {
  children: ReactNode
  onContextTarget: (name: string | null) => void
  onDeselect: () => void
}

/**
 * Content pane wrapper that opens the shared context menu at the pointer,
 * reporting whether an item (`[data-fs-name]`) or blank space was clicked.
 */
function FolderContent({ children, onContextTarget, onDeselect }: FolderContentProps): ReactElement {
  const { openAt } = useContextMenu()
  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>): void => {
    const el = (event.target as HTMLElement).closest('[data-fs-name]')
    onContextTarget(el?.getAttribute('data-fs-name') ?? null)
    event.preventDefault()
    openAt(event.clientX, event.clientY)
  }
  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (!(event.target as HTMLElement).closest('[data-fs-name]'))
      onDeselect()
  }
  return (
    <ScrollArea className="min-h-0 min-w-0 flex-1 bg-(--window)">
      <div className="min-h-full min-w-full" onContextMenu={handleContextMenu} onClick={handleClick}>
        {children}
      </div>
    </ScrollArea>
  )
}

export function MyDocuments({ windowId }: ProcessComponentProps): ReactElement {
  const { close, open, title } = useProcessActions()
  const [nav, setNav] = useState<NavState>({ history: [[...DEFAULT_PATH]], index: 0 })
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [showTree, setShowTree] = useState(true)
  const [treeWidth, setTreeWidth] = useState(180)
  const [view, setView] = useState<FileGridView>('large')
  // Toolbars submenu toggles (View ▸ Toolbars / Status Bar).
  const [showStandardButtons, setShowStandardButtons] = useState(true)
  const [showAddressBar, setShowAddressBar] = useState(true)
  const [showToolbarText, setShowToolbarText] = useState(true)
  const [showStatusBar, setShowStatusBar] = useState(true)
  // The item under the last right-click (null ⇒ blank area), and the pane
  // element the context menu is clamped to.
  const [contextName, setContextName] = useState<string | null>(null)
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null)

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

  const openNode = (node: FsNode): void => {
    if (isFolder(node))
      navigate([...path, node.name])
    else
      openFile(node)
  }

  const cycleView = (): void => {
    setView(current => VIEW_CYCLE[(VIEW_CYCLE.indexOf(current) + 1) % VIEW_CYCLE.length])
  }

  // The node the context menu acts on (null ⇒ blank-area menu).
  const contextNode: FsNode | null = contextName
    ? folder?.children.find(child => child.name === contextName) ?? null
    : null

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
  // Address dropdown lists the current location's ancestry (Win98 shows the
  // namespace here); selecting a crumb navigates to it.
  const addressCrumbs = path.map((_, index) => path.slice(0, index + 1))

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
              <MenuItem reserveIconSpace disabled>{withAccel('New', 0)}</MenuItem>
              <MenuItem reserveIconSpace disabled>{withAccel('Open', 0)}</MenuItem>
              <MenuSeparator />
              <MenuItem reserveIconSpace onClick={() => close(windowId)}>{withAccel('Close', 0)}</MenuItem>
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
              <MenuSeparator />
              <MenuRadioGroup value={view} onValueChange={value => setView(value as FileGridView)}>
                <MenuRadioItem value="large">{withAccel('Large Icons', 0)}</MenuRadioItem>
                <MenuRadioItem value="small">{withAccel('Small Icons', 0)}</MenuRadioItem>
                <MenuRadioItem value="list">{withAccel('List', 1)}</MenuRadioItem>
                <MenuRadioItem value="details">{withAccel('Details', 0)}</MenuRadioItem>
              </MenuRadioGroup>
              <MenuSeparator />
              <MenuCheckboxItem checked={showTree} onCheckedChange={setShowTree}>{withAccel('Folders', 0)}</MenuCheckboxItem>
              <MenuItem reserveIconSpace onClick={() => setSelectedName(null)}>{withAccel('Refresh', 0)}</MenuItem>
              <MenuSeparator />
              <MenuItem reserveIconSpace disabled>{withAccel('Folder Options...', 7)}</MenuItem>
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
          <ToolbarButton label="Up" icon={ICONS.up} disabled={!canUp} showText={showToolbarText} onClick={up} />
          <ToolbarSeparator />
          <ToolbarButton label="Cut" icon={ICONS.cut} disabled showText={showToolbarText} />
          <ToolbarButton label="Copy" icon={ICONS.copy} disabled showText={showToolbarText} />
          <ToolbarButton label="Paste" icon={ICONS.paste} disabled showText={showToolbarText} />
          <ToolbarSeparator />
          <ToolbarButton label="Properties" icon={ICONS.properties} disabled showText={showToolbarText} />
          <ToolbarSeparator />
          <ToolbarButton label="Views" icon={ICONS.views} showText={showToolbarText} onClick={cycleView} />
          <ToolbarButton label="Folders" icon={ICONS.folders} pressed={showTree} showText={showToolbarText} onClick={() => setShowTree(v => !v)} />
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
                  navigate(target)
              }}
            >
              <SelectTrigger className="gap-1">
                <img
                  src={assetPath(folder?.icon ?? FS_ICONS.folder)}
                  alt=""
                  className="size-4 pixelated shrink-0"
                  draggable={false}
                />
                <span className="min-w-0 flex-1 truncate text-left">{formatAddress(path)}</span>
              </SelectTrigger>
              <SelectContent>
                {addressCrumbs.map((crumb, depth) => (
                  <SelectItem key={crumb.join('/')} value={String(depth)} textValue={formatAddress(crumb)}>
                    <span className="flex min-w-0 items-center gap-1" style={{ paddingLeft: depth * 12 }}>
                      <img
                        src={assetPath(resolveFolder(crumb)?.icon ?? FS_ICONS.folder)}
                        alt=""
                        className="size-4 pixelated shrink-0"
                        draggable={false}
                      />
                      <span className="truncate">{crumb[crumb.length - 1]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Split view (shared sunken frame) */}
      <div className="m-0.5 flex min-h-0 flex-1 bg-(--window) shadow-(--shadow-border-field)">
        {showTree && (
          <>
            <div className="flex min-h-0 flex-col" style={{ width: treeWidth }}>
              <div className="flex items-center justify-between gap-1 border-b border-(--button-shadow) px-1 py-0.5">
                <span className="text-(--button-text)">Folders</span>
                <Button
                  flat
                  iconOnly
                  aria-label="Close folder list"
                  onClick={() => setShowTree(false)}
                  className="size-4 min-h-0"
                >
                  <CloseGlyph />
                </Button>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                <FolderTree currentPath={path} onNavigate={navigate} />
              </ScrollArea>
            </div>
            <div
              role="separator"
              aria-orientation="vertical"
              onPointerDown={startSplitDrag}
              className="relative w-2 shrink-0 cursor-ew-resize border-l border-l-(--button-shadow) border-r-2 border-r-(--window-frame) bg-(--button-face) shadow-[inset_1px_0_0_var(--button-hilight)]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-0.75 h-7.5 w-0.5 -translate-y-1/2"
                style={SPLITTER_GRIP_STYLE}
              />
            </div>
          </>
        )}
        <ContextMenu container={contentEl}>
          <FolderContent onContextTarget={setContextName} onDeselect={() => setSelectedName(null)}>
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
          </FolderContent>
          <ContextMenuContent>
            <Menu>
              {contextNode
                ? (
                    <>
                      <MenuItem reserveIconSpace className="font-bold" onClick={() => contextNode && openNode(contextNode)}>{withAccel('Open', 0)}</MenuItem>
                      {isFolder(contextNode)
                        ? <MenuItem reserveIconSpace onClick={() => contextNode && openNode(contextNode)}>{withAccel('Explore', 0)}</MenuItem>
                        : <MenuItem reserveIconSpace disabled>{withAccel('Explore', 0)}</MenuItem>}
                      <MenuSeparator />
                      <MenuSub>
                        <MenuSubTrigger reserveIconSpace>{withAccel('Send To', 5)}</MenuSubTrigger>
                        <MenuSubContent>
                          <MenuItem reserveIconSpace disabled>3½ Floppy (A:)</MenuItem>
                          <MenuItem reserveIconSpace disabled>My Documents</MenuItem>
                        </MenuSubContent>
                      </MenuSub>
                      <MenuSeparator />
                      <MenuItem reserveIconSpace disabled>{withAccel('Cut', 2)}</MenuItem>
                      <MenuItem reserveIconSpace disabled>{withAccel('Copy', 0)}</MenuItem>
                      <MenuSeparator />
                      <MenuItem reserveIconSpace disabled>{withAccel('Delete', 0)}</MenuItem>
                      <MenuItem reserveIconSpace disabled>{withAccel('Rename', 3)}</MenuItem>
                      <MenuSeparator />
                      <MenuItem reserveIconSpace disabled>{withAccel('Create Shortcut', 7)}</MenuItem>
                      <MenuSeparator />
                      <MenuItem reserveIconSpace disabled>{withAccel('Properties', 1)}</MenuItem>
                    </>
                  )
                : (
                    <>
                      <MenuSub>
                        <MenuSubTrigger reserveIconSpace>{withAccel('New', 0)}</MenuSubTrigger>
                        <MenuSubContent>
                          <MenuItem reserveIconSpace disabled>Folder</MenuItem>
                          <MenuItem reserveIconSpace disabled>Shortcut</MenuItem>
                          <MenuSeparator />
                          <MenuItem reserveIconSpace disabled>Text Document</MenuItem>
                        </MenuSubContent>
                      </MenuSub>
                      <MenuSeparator />
                      <MenuItem reserveIconSpace disabled={!canBack} onClick={back}>{withAccel('Back', 0)}</MenuItem>
                      <MenuItem reserveIconSpace disabled={!canForward} onClick={forward}>{withAccel('Forward', 0)}</MenuItem>
                      <MenuItem reserveIconSpace onClick={() => setSelectedName(null)}>{withAccel('Refresh', 0)}</MenuItem>
                      <MenuSeparator />
                      <MenuSub>
                        <MenuSubTrigger reserveIconSpace>{withAccel('View', 0)}</MenuSubTrigger>
                        <MenuSubContent>
                          <MenuRadioGroup value={view} onValueChange={value => setView(value as FileGridView)}>
                            <MenuRadioItem value="large">Large Icons</MenuRadioItem>
                            <MenuRadioItem value="small">Small Icons</MenuRadioItem>
                            <MenuRadioItem value="list">List</MenuRadioItem>
                            <MenuRadioItem value="details">Details</MenuRadioItem>
                          </MenuRadioGroup>
                        </MenuSubContent>
                      </MenuSub>
                      <MenuSub>
                        <MenuSubTrigger reserveIconSpace>{withAccel('Arrange Icons', 0)}</MenuSubTrigger>
                        <MenuSubContent>
                          <MenuItem reserveIconSpace disabled>by Name</MenuItem>
                          <MenuItem reserveIconSpace disabled>by Type</MenuItem>
                          <MenuItem reserveIconSpace disabled>by Size</MenuItem>
                        </MenuSubContent>
                      </MenuSub>
                      <MenuSeparator />
                      <MenuItem reserveIconSpace disabled>{withAccel('Paste', 0)}</MenuItem>
                      <MenuItem reserveIconSpace disabled>{withAccel('Paste Shortcut', 6)}</MenuItem>
                      <MenuSeparator />
                      <MenuItem reserveIconSpace disabled>{withAccel('Properties', 1)}</MenuItem>
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
      )}
    </div>
  )
}
