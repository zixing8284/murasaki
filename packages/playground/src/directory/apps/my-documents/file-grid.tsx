import type { CSSProperties, ReactElement } from 'react'
import type { FsFile, FsFolder, FsNode } from './filesystem'
import { assetPath } from '../../../lib/asset-path'
import { formatSize, FS_ICONS, isFolder, nodeKind, nodeModified } from './filesystem'

export type FileGridView = 'large' | 'small' | 'list' | 'details'

function nodeIcon(node: FsNode): string {
  return isFolder(node) ? node.icon ?? FS_ICONS.folder : node.icon
}

interface IconItemProps {
  node: FsNode
  view: 'large' | 'small' | 'list'
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}

function IconItem({ node, view, selected, onSelect, onOpen }: IconItemProps): ReactElement {
  const large = view === 'large'
  return (
    <button
      type="button"
      data-fs-name={node.name}
      data-selected={selected || undefined}
      className={
        large
          ? 'group flex w-18 flex-col items-center gap-0.5 p-1 text-center outline-none'
          : 'group flex w-40 items-center gap-1 px-1 py-0.5 text-left outline-none'
      }
      onClick={onSelect}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          onOpen()
        }
      }}
    >
      <img
        src={assetPath(nodeIcon(node))}
        alt=""
        className={`${large ? 'size-8' : 'size-4'} shrink-0 pixelated`}
        draggable={false}
      />
      <span
        className={`max-w-full px-0.5 leading-tight ${large ? 'wrap-break-word' : 'truncate'} ${
          selected
            ? 'bg-(--hilight) text-(--hilight-text)'
            : 'text-(--window-text)'
        }`}
      >
        {node.name}
      </span>
    </button>
  )
}

// Shared column widths so the Details header and every row line up.
const DETAILS_COLUMNS: CSSProperties = {
  gridTemplateColumns: 'minmax(180px, 1fr) 90px 150px 110px',
}

function DetailsHeaderCell({ label, sorted, align = 'left' }: {
  label: string
  sorted?: boolean
  align?: 'left' | 'right'
}): ReactElement {
  return (
    <div
      className={`flex h-full min-w-0 items-center gap-1 bg-(--button-face) px-2 shadow-(--shadow-raised) ${
        align === 'right' ? 'justify-end' : ''
      }`}
    >
      <span className="truncate text-(--button-text)">{label}</span>
      {sorted && (
        <svg aria-hidden="true" width="7" height="4" viewBox="0 0 7 4" fill="currentColor" shapeRendering="crispEdges" className="shrink-0">
          <rect x="3" y="0" width="1" height="1" />
          <rect x="2" y="1" width="3" height="1" />
          <rect x="1" y="2" width="5" height="1" />
          <rect x="0" y="3" width="7" height="1" />
        </svg>
      )}
    </div>
  )
}

interface DetailsRowProps {
  node: FsNode
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}

function DetailsRow({ node, selected, onSelect, onOpen }: DetailsRowProps): ReactElement {
  return (
    <button
      type="button"
      style={DETAILS_COLUMNS}
      data-fs-name={node.name}
      data-selected={selected || undefined}
      className="grid w-full items-center py-px text-left outline-none"
      onClick={onSelect}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          onOpen()
        }
      }}
    >
      <span className="flex min-w-0 items-center gap-1 pr-2 pl-1">
        <img src={assetPath(nodeIcon(node))} alt="" className="size-4 shrink-0 pixelated" draggable={false} />
        <span className={`truncate ${selected ? 'bg-(--hilight) text-(--hilight-text)' : 'text-(--window-text)'}`}>
          {node.name}
        </span>
      </span>
      <span className="truncate pr-2 text-right text-(--window-text)">
        {isFolder(node) ? '' : formatSize(node.size)}
      </span>
      <span className="truncate px-2 text-(--window-text)">{nodeKind(node)}</span>
      <span className="truncate px-2 text-(--window-text)">{nodeModified(node)}</span>
    </button>
  )
}

interface FileGridProps {
  folder: FsFolder
  view: FileGridView
  selectedName: string | null
  onSelect: (name: string | null) => void
  onOpenFolder: (name: string) => void
  onOpenFile: (file: FsFile) => void
}

export function FileGrid({ folder, view, selectedName, onSelect, onOpenFolder, onOpenFile }: FileGridProps): ReactElement {
  const openNode = (node: FsNode): void => {
    if (isFolder(node))
      onOpenFolder(node.name)
    else
      onOpenFile(node)
  }

  if (view === 'details') {
    return (
      <div
        className="min-w-full"
        onClick={(event) => {
          if (event.target === event.currentTarget)
            onSelect(null)
        }}
      >
        <div style={DETAILS_COLUMNS} className="sticky top-0 z-1 grid h-4.75">
          <DetailsHeaderCell label="Name" sorted />
          <DetailsHeaderCell label="Size" />
          <DetailsHeaderCell label="Type" />
          <DetailsHeaderCell label="Modified" />
        </div>
        {folder.children.map(node => (
          <DetailsRow
            key={node.name}
            node={node}
            selected={selectedName === node.name}
            onSelect={() => onSelect(node.name)}
            onOpen={() => openNode(node)}
          />
        ))}
      </div>
    )
  }

  // Icon views. `large`/`small` flow left-to-right and wrap (row-major); `list`
  // fills top-to-bottom into columns (column-major) so it needs a bounded height.
  const containerClass
    = view === 'large'
      ? 'flex min-h-full w-full content-start flex-wrap gap-1 p-2'
      : view === 'small'
        ? 'flex min-h-full w-full content-start flex-wrap gap-x-3 gap-y-0.5 p-2'
        : 'flex h-full content-start flex-col flex-wrap gap-x-4 p-2'

  return (
    <div
      className={`bg-(--window) ${containerClass}`}
      onClick={(event) => {
        if (event.target === event.currentTarget)
          onSelect(null)
      }}
    >
      {folder.children.map(node => (
        <IconItem
          key={node.name}
          node={node}
          view={view}
          selected={selectedName === node.name}
          onSelect={() => onSelect(node.name)}
          onOpen={() => openNode(node)}
        />
      ))}
    </div>
  )
}
