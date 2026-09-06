import type { ReactElement } from 'react'
import type { FsFile, FsFolder, FsNode } from './filesystem'
import { assetPath } from '../../../lib/asset-path'
import { FS_ICONS, isFolder } from './filesystem'

export type FileGridView = 'large' | 'list'

interface FileGridItemProps {
  node: FsNode
  view: FileGridView
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}

function FileGridItem({ node, view, selected, onSelect, onOpen }: FileGridItemProps): ReactElement {
  const icon = isFolder(node) ? node.icon ?? FS_ICONS.folder : node.icon
  const large = view === 'large'
  return (
    <button
      type="button"
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
        src={assetPath(icon)}
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

interface FileGridProps {
  folder: FsFolder
  view: FileGridView
  selectedName: string | null
  onSelect: (name: string | null) => void
  onOpenFolder: (name: string) => void
  onOpenFile: (file: FsFile) => void
}

export function FileGrid({ folder, view, selectedName, onSelect, onOpenFolder, onOpenFile }: FileGridProps): ReactElement {
  return (
    <div
      className={`flex min-h-full w-full content-start gap-1 bg-(--window) p-2 ${
        view === 'large' ? 'flex-wrap' : 'flex-col flex-wrap'
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget)
          onSelect(null)
      }}
    >
      {folder.children.map(node => (
        <FileGridItem
          key={node.name}
          node={node}
          view={view}
          selected={selectedName === node.name}
          onSelect={() => onSelect(node.name)}
          onOpen={() => (isFolder(node) ? onOpenFolder(node.name) : onOpenFile(node))}
        />
      ))}
    </div>
  )
}
