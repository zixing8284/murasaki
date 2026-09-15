import type { CSSProperties, ReactElement } from 'react'
import type { VfsNode } from '../../../contexts/file-system'
import type { SortKey, SortState } from './sort'
import { useEffect, useRef, useState } from 'react'
import { IconTile } from '../../../components/icon-tile'
import { useVfsImageSrc } from '../../../contexts/file-system'
import { assetPath } from '../../../lib/asset-path'
import { formatModified, formatSize } from './filesystem'

export type FileGridView = 'large' | 'small' | 'list' | 'details' | 'thumbnails'

/** Swap a 16px icon path for its 32px sibling (flat `{name}-{size}.png`). */
function largeIcon(path: string): string {
  return path.replace(/-16\.png$/, '-32.png')
}

/** Inline editor shown over a node's label while renaming. */
function RenameInput({ initial, onCommit, onCancel }: {
  initial: string
  onCommit: (value: string) => void
  onCancel: () => void
}): ReactElement {
  const [value, setValue] = useState(initial)
  const ref = useRef<HTMLInputElement>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    const input = ref.current
    if (!input)
      return
    input.focus()
    // Select the base name (not the extension), matching Explorer.
    const dot = initial.lastIndexOf('.')
    input.setSelectionRange(0, dot > 0 ? dot : initial.length)
  }, [initial])

  // Enter and blur both fire; guard so the rename only commits once.
  const commit = (next: string): void => {
    if (doneRef.current)
      return
    doneRef.current = true
    onCommit(next)
  }
  const cancel = (): void => {
    if (doneRef.current)
      return
    doneRef.current = true
    onCancel()
  }

  return (
    <input
      ref={ref}
      value={value}
      aria-label="Rename"
      className="pointer-events-auto min-w-0 border border-(--window-frame) bg-(--window) px-0.5 text-(--window-text) outline-none"
      onChange={event => setValue(event.target.value)}
      onClick={event => event.stopPropagation()}
      onDoubleClick={event => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === 'Enter') {
          event.preventDefault()
          commit(value)
        }
        else if (event.key === 'Escape') {
          event.preventDefault()
          cancel()
        }
      }}
      onBlur={() => commit(value)}
    />
  )
}

/** Image preview for the Thumbnails view, falling back to the 32px icon. */
function Thumbnail({ node }: { node: VfsNode }): ReactElement {
  const src = useVfsImageSrc(node)
  if (node.type === 'file' && src) {
    return (
      <span className="pointer-events-auto flex size-11 items-center justify-center">
        <img src={src} alt="" draggable={false} className="max-h-11 max-w-11 object-contain shadow-(--shadow-border-field)" />
      </span>
    )
  }
  return (
    <img src={assetPath(largeIcon(node.icon))} alt="" draggable={false} className="pointer-events-auto size-8 shrink-0 pixelated" />
  )
}

interface ItemProps {
  node: VfsNode
  selected: boolean
  renaming: boolean
  onSelect: () => void
  onOpen: () => void
  onRenameCommit: (value: string) => void
  onRenameCancel: () => void
}

function IconItem({ node, view, selected, renaming, onSelect, onOpen, onRenameCommit, onRenameCancel }: ItemProps & { view: 'large' | 'small' | 'list' | 'thumbnails' }): ReactElement {
  const large = view === 'large'
  const thumbs = view === 'thumbnails'
  const tile = large || thumbs
  return (
    <button
      type="button"
      data-fs-path={node.path}
      data-selected={selected || undefined}
      className={`pointer-events-none text-(--window-text) outline-none ${thumbs ? 'w-24' : large ? 'w-18' : 'w-40 px-1 py-0.5'}`}
      onClick={renaming ? undefined : onSelect}
      onDoubleClick={renaming ? undefined : onOpen}
      onKeyDown={(event) => {
        if (!renaming && event.key === 'Enter') {
          event.preventDefault()
          onOpen()
        }
      }}
    >
      <IconTile
        icon={thumbs
          ? <Thumbnail node={node} />
          : (
              <img
                src={assetPath(large ? largeIcon(node.icon) : node.icon)}
                alt=""
                className={`${large ? 'size-8' : 'size-4'} shrink-0 pixelated`}
                draggable={false}
              />
            )}
        label={renaming ? '' : node.name}
        labelSlot={renaming ? <RenameInput initial={node.name} onCommit={onRenameCommit} onCancel={onRenameCancel} /> : undefined}
        selected={selected}
        variant={tile ? 'tile' : 'row'}
      />
    </button>
  )
}

// Shared column widths so the Details header and every row line up.
const DETAILS_COLUMNS: CSSProperties = {
  gridTemplateColumns: 'minmax(180px, 1fr) 90px 150px 150px',
}

function SortArrow({ dir }: { dir: 'asc' | 'desc' }): ReactElement {
  return dir === 'asc'
    ? (
        <svg aria-hidden="true" width="7" height="4" viewBox="0 0 7 4" fill="currentColor" shapeRendering="crispEdges" className="shrink-0">
          <rect x="3" y="0" width="1" height="1" />
          <rect x="2" y="1" width="3" height="1" />
          <rect x="1" y="2" width="5" height="1" />
          <rect x="0" y="3" width="7" height="1" />
        </svg>
      )
    : (
        <svg aria-hidden="true" width="7" height="4" viewBox="0 0 7 4" fill="currentColor" shapeRendering="crispEdges" className="shrink-0">
          <rect x="0" y="0" width="7" height="1" />
          <rect x="1" y="1" width="5" height="1" />
          <rect x="2" y="2" width="3" height="1" />
          <rect x="3" y="3" width="1" height="1" />
        </svg>
      )
}

function DetailsHeaderCell({ label: text, sortKey, sort, onSort, align = 'left' }: {
  label: string
  sortKey: SortKey
  sort: SortState
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
}): ReactElement {
  const active = sort.key === sortKey
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex h-full min-w-0 items-center gap-1 bg-(--button-face) px-2 shadow-(--shadow-raised) outline-none ${align === 'right' ? 'justify-end' : ''}`}
    >
      <span className="truncate text-(--button-text)">{text}</span>
      {active && <SortArrow dir={sort.dir} />}
    </button>
  )
}

function DetailsRow({ node, selected, renaming, onSelect, onOpen, onRenameCommit, onRenameCancel }: ItemProps): ReactElement {
  return (
    <button
      type="button"
      style={DETAILS_COLUMNS}
      data-fs-path={node.path}
      data-selected={selected || undefined}
      className="grid w-full items-center py-px text-left outline-none"
      onClick={renaming ? undefined : onSelect}
      onDoubleClick={renaming ? undefined : onOpen}
      onKeyDown={(event) => {
        if (!renaming && event.key === 'Enter') {
          event.preventDefault()
          onOpen()
        }
      }}
    >
      <span className="flex min-w-0 items-center gap-1 pr-2 pl-1">
        <img src={assetPath(node.icon)} alt="" className="size-4 shrink-0 pixelated" draggable={false} />
        {renaming
          ? <RenameInput initial={node.name} onCommit={onRenameCommit} onCancel={onRenameCancel} />
          : (
              <span className={`truncate ${selected ? 'bg-(--hilight) text-(--hilight-text)' : 'text-(--window-text)'}`}>
                {node.name}
              </span>
            )}
      </span>
      <span className="truncate pr-2 text-right text-(--window-text)">
        {node.type === 'folder' ? '' : formatSize(node.size)}
      </span>
      <span className="truncate px-2 text-(--window-text)">{node.kind}</span>
      <span className="truncate px-2 text-(--window-text)">{formatModified(node.modifiedAt)}</span>
    </button>
  )
}

export interface FileGridProps {
  nodes: VfsNode[]
  view: FileGridView
  selectedPath: string | null
  renamePath: string | null
  sort: SortState
  onSelect: (path: string | null) => void
  onOpen: (node: VfsNode) => void
  onSortByColumn: (key: SortKey) => void
  onRenameCommit: (path: string, value: string) => void
  onRenameCancel: () => void
}

export function FileGrid({
  nodes,
  view,
  selectedPath,
  renamePath,
  sort,
  onSelect,
  onOpen,
  onSortByColumn,
  onRenameCommit,
  onRenameCancel,
}: FileGridProps): ReactElement {
  if (view === 'details') {
    return (
      <div className="min-w-full">
        <div style={DETAILS_COLUMNS} className="sticky top-0 z-1 grid h-4.75">
          <DetailsHeaderCell label="Name" sortKey="name" sort={sort} onSort={onSortByColumn} />
          <DetailsHeaderCell label="Size" sortKey="size" sort={sort} onSort={onSortByColumn} align="right" />
          <DetailsHeaderCell label="Type" sortKey="type" sort={sort} onSort={onSortByColumn} />
          <DetailsHeaderCell label="Modified" sortKey="modified" sort={sort} onSort={onSortByColumn} />
        </div>
        {nodes.map(node => (
          <DetailsRow
            key={node.path}
            node={node}
            selected={selectedPath === node.path}
            renaming={renamePath === node.path}
            onSelect={() => onSelect(node.path)}
            onOpen={() => onOpen(node)}
            onRenameCommit={value => onRenameCommit(node.path, value)}
            onRenameCancel={onRenameCancel}
          />
        ))}
      </div>
    )
  }

  // Icon views. `large`/`small`/`thumbnails` flow left-to-right and wrap;
  // `list` fills top-to-bottom into columns so it needs a bounded height.
  const containerClass
    = view === 'large'
      ? 'flex min-h-full w-full content-start flex-wrap gap-1 p-2'
      : view === 'thumbnails'
        ? 'flex min-h-full w-full content-start flex-wrap gap-2 p-2'
        : view === 'small'
          ? 'flex min-h-full w-full content-start flex-wrap gap-x-3 gap-y-0.5 p-2'
          : 'flex h-full content-start flex-col flex-wrap gap-x-4 p-2'

  return (
    <div className={`bg-(--window) ${containerClass}`}>
      {nodes.map(node => (
        <IconItem
          key={node.path}
          node={node}
          view={view}
          selected={selectedPath === node.path}
          renaming={renamePath === node.path}
          onSelect={() => onSelect(node.path)}
          onOpen={() => onOpen(node)}
          onRenameCommit={value => onRenameCommit(node.path, value)}
          onRenameCancel={onRenameCancel}
        />
      ))}
    </div>
  )
}
