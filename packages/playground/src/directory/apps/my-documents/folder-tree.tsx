import type { ReactElement } from 'react'
import type { VfsNode } from '../../../contexts/file-system'
import { TreeView, TreeViewItem } from '@murasaki-io/react98'
import { useState } from 'react'
import { isAncestorOrSelf, RECYCLE_BIN_PATH, ROOT_PATH } from '../../../contexts/file-system'
import { assetPath } from '../../../lib/asset-path'
import { ICON } from '../../../lib/icons'
import { FS_ICONS } from './filesystem'

function TreeIcon({ src }: { src: string }): ReactElement {
  return <img src={assetPath(src)} alt="" className="size-4 pixelated shrink-0" draggable={false} />
}

interface FolderTreeNodeProps {
  node: VfsNode
  childrenByParent: Map<string, VfsNode[]>
  currentPath: string
  binHasItems: boolean
  onNavigate: (path: string) => void
  /** Render as a toggle-less namespace root (Desktop): children always shown. */
  root?: boolean
}

function FolderTreeNode({ node, childrenByParent, currentPath, binHasItems, onNavigate, root = false }: FolderTreeNodeProps): ReactElement {
  const subFolders = childrenByParent.get(node.path) ?? []
  const selected = node.path === currentPath
  const onActivePath = isAncestorOrSelf(node.path, currentPath)

  // `null` follows the active path (auto-expands as the user navigates);
  // a boolean is the user's explicit expand/collapse choice.
  const [override, setOverride] = useState<boolean | null>(null)
  const expanded = override ?? onActivePath

  // The Recycle Bin swaps between full/empty art by its contents; other generic
  // folders flip to an open-folder icon while expanded.
  const iconSrc = node.path === RECYCLE_BIN_PATH
    ? (binHasItems ? ICON.recycleBinFull.sm : ICON.recycleBin.sm)
    : node.icon === FS_ICONS.folder && (root || expanded) ? FS_ICONS.folderOpen : node.icon
  const icon = <TreeIcon src={iconSrc} />

  const childNodes = subFolders.map(child => (
    <FolderTreeNode
      key={child.path}
      node={child}
      childrenByParent={childrenByParent}
      currentPath={currentPath}
      binHasItems={binHasItems}
      onNavigate={onNavigate}
    />
  ))

  if (root) {
    return (
      <TreeViewItem label={node.name} icon={icon} selected={selected} hideToggle onClick={() => onNavigate(node.path)}>
        {childNodes}
      </TreeViewItem>
    )
  }

  if (subFolders.length === 0) {
    return <TreeViewItem label={node.name} icon={icon} selected={selected} onClick={() => onNavigate(node.path)} />
  }

  return (
    <TreeViewItem
      label={node.name}
      icon={icon}
      selected={selected}
      expanded={expanded}
      onExpandedChange={setOverride}
      onClick={() => onNavigate(node.path)}
    >
      {childNodes}
    </TreeViewItem>
  )
}

interface FolderTreeProps {
  nodes: VfsNode[]
  currentPath: string
  onNavigate: (path: string) => void
}

export function FolderTree({ nodes, currentPath, onNavigate }: FolderTreeProps): ReactElement | null {
  const childrenByParent = new Map<string, VfsNode[]>()
  let rootNode: VfsNode | null = null
  for (const node of nodes) {
    if (node.type !== 'folder' || node.hideInTree)
      continue
    if (node.path === ROOT_PATH) {
      rootNode = node
      continue
    }
    const siblings = childrenByParent.get(node.parentPath)
    if (siblings)
      siblings.push(node)
    else
      childrenByParent.set(node.parentPath, [node])
  }

  for (const siblings of childrenByParent.values())
    siblings.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  if (!rootNode)
    return null

  const binHasItems = nodes.some(node => node.parentPath === RECYCLE_BIN_PATH)

  return (
    <TreeView className="w-max min-w-full whitespace-nowrap p-0.5">
      <FolderTreeNode
        node={rootNode}
        childrenByParent={childrenByParent}
        currentPath={currentPath}
        binHasItems={binHasItems}
        onNavigate={onNavigate}
        root
      />
    </TreeView>
  )
}
