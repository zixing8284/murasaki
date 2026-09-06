import type { ReactElement } from 'react'
import type { FsFolder } from './filesystem'
import { TreeView, TreeViewItem } from '@murasaki-io/react98'
import { useState } from 'react'
import { assetPath } from '../../../lib/asset-path'
import { DESKTOP_ROOT, FS_ICONS, isFolder } from './filesystem'

function TreeIcon({ src }: { src: string }): ReactElement {
  return <img src={assetPath(src)} alt="" className="size-4 pixelated shrink-0" draggable={false} />
}

interface FolderTreeNodeProps {
  folder: FsFolder
  path: string[]
  currentPath: readonly string[]
  onNavigate: (path: string[]) => void
}

function FolderTreeNode({ folder, path, currentPath, onNavigate }: FolderTreeNodeProps): ReactElement {
  const subFolders = folder.children.filter(isFolder)
  const pathKey = path.join('\u0000')
  const currentKey = currentPath.join('\u0000')
  const selected = pathKey === currentKey
  // This node is an ancestor-or-self of the current folder.
  const onActivePath = `${currentKey}\u0000`.startsWith(`${pathKey}\u0000`)

  // `null` follows the active path (auto-expands as the user navigates);
  // a boolean is the user's explicit expand/collapse choice.
  const [override, setOverride] = useState<boolean | null>(null)
  const expanded = override ?? onActivePath

  // Generic folders flip to an open-folder icon while expanded; folders with a
  // dedicated icon (drives, My Computer, My Documents…) keep their own.
  const iconSrc = folder.icon ?? (expanded ? FS_ICONS.folderOpen : FS_ICONS.folder)
  const icon = <TreeIcon src={iconSrc} />

  if (subFolders.length === 0) {
    return (
      <TreeViewItem
        label={folder.name}
        icon={icon}
        selected={selected}
        onClick={() => onNavigate(path)}
      />
    )
  }

  return (
    <TreeViewItem
      label={folder.name}
      icon={icon}
      selected={selected}
      expanded={expanded}
      onExpandedChange={setOverride}
      onClick={() => onNavigate(path)}
    >
      {subFolders.map(child => (
        <FolderTreeNode
          key={child.name}
          folder={child}
          path={[...path, child.name]}
          currentPath={currentPath}
          onNavigate={onNavigate}
        />
      ))}
    </TreeViewItem>
  )
}

interface FolderTreeProps {
  currentPath: readonly string[]
  onNavigate: (path: string[]) => void
}

export function FolderTree({ currentPath, onNavigate }: FolderTreeProps): ReactElement {
  return (
    <TreeView className="w-max min-w-full whitespace-nowrap p-0.5">
      <FolderTreeNode
        folder={DESKTOP_ROOT}
        path={[DESKTOP_ROOT.name]}
        currentPath={currentPath}
        onNavigate={onNavigate}
      />
    </TreeView>
  )
}
