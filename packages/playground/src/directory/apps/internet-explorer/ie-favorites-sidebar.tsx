import type { ReactElement } from 'react'
import { Divider, TreeView, TreeViewItem, WindowCloseButton } from '@murasaki-io/react98'
import { useState } from 'react'
import { assetPath } from '../../../lib/asset-path'
import favoritesData from './ie-favorites.json'

const ICON = {
  folderClosed: '/icons/folder-closed-16.png',
  folderOpen: '/icons/folder-my-docs-32.png',
  html: '/icons/html-file-16.png',
}

interface FavoritesLink {
  type: 'link'
  name: string
  url: string
}

interface FavoritesFolder {
  type: 'folder'
  name: string
  children: FavoritesEntry[]
}

type FavoritesEntry = FavoritesLink | FavoritesFolder

interface IeFavoritesSidebarProps {
  onNavigate: (url: string) => void
  onClose: () => void
}

function FolderIcon({ open }: { open: boolean }): ReactElement {
  return (
    <img
      src={assetPath(open ? ICON.folderOpen : ICON.folderClosed)}
      alt=""
      className="size-4 object-contain pixelated shrink-0"
      draggable={false}
    />
  )
}

function HtmlIcon(): ReactElement {
  return (
    <img
      src={assetPath(ICON.html)}
      alt=""
      className="size-4 object-contain pixelated shrink-0"
      draggable={false}
    />
  )
}

function FolderItem({ entry, onNavigate }: { entry: FavoritesFolder, onNavigate: (url: string) => void }): ReactElement {
  const [expanded, setExpanded] = useState(false)

  return (
    <TreeViewItem
      label={entry.name}
      expanded={expanded}
      onExpandedChange={setExpanded}
      icon={<FolderIcon open={expanded} />}
    >
      {entry.children.map((child, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <FavoritesNode key={i} entry={child} onNavigate={onNavigate} />
      ))}
    </TreeViewItem>
  )
}

function FavoritesNode({ entry, onNavigate }: { entry: FavoritesEntry, onNavigate: (url: string) => void }): ReactElement {
  if (entry.type === 'folder') {
    return <FolderItem entry={entry} onNavigate={onNavigate} />
  }

  return (
    <TreeViewItem
      label={entry.name}
      icon={<HtmlIcon />}
      onClick={() => onNavigate(entry.url)}
    />
  )
}

export function IeFavoritesSidebar({ onNavigate, onClose }: IeFavoritesSidebarProps): ReactElement {
  return (
    <div className="m-0.5 flex w-44 shrink-0 flex-col overflow-hidden shadow-(--shadow-border-field)">
      <div className="flex shrink-0 items-center gap-1.5 bg-(--button-face) px-1.5 py-0.5">
        <img
          src={assetPath('/icons/favorites-16.png')}
          alt=""
          className="size-4 shrink-0 object-contain pixelated"
          draggable={false}
        />
        <span className="flex-1 leading-none text-(--button-text)">Favorites</span>
        <WindowCloseButton onClick={onClose} />
      </div>
      <Divider />
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-(--window)">
        <TreeView>
          {(favoritesData as FavoritesEntry[]).map((entry, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <FavoritesNode key={i} entry={entry} onNavigate={onNavigate} />
          ))}
        </TreeView>
      </div>
    </div>
  )
}
