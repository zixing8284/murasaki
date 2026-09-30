import type { ReactElement } from 'react'
import type { VfsNode } from '../../../contexts/file-system'
import { TreeView, TreeViewItem } from '@murasaki-io/react98'
import { useState } from 'react'
import { fromSegments, RECYCLE_BIN_PATH, ROOT_PATH, toSegments } from '../../../contexts/file-system'
import { assetPath } from '../../../lib/asset-path'
import { ICON } from '../../../lib/icons'
import { FS_ICONS } from './filesystem'

function TreeIcon({ src }: { src: string }): ReactElement {
  return <img src={assetPath(src)} alt="" className="size-4 pixelated shrink-0" draggable={false} />
}

// Strict ancestors of a path, root-first (excludes the path itself).
function ancestorPaths(path: string): string[] {
  const segments = toSegments(path)
  const out: string[] = []
  for (let depth = 1; depth < segments.length; depth++)
    out.push(fromSegments(segments.slice(0, depth)))
  return out
}

interface FolderTreeNodeProps {
  node: VfsNode
  childrenByParent: Map<string, VfsNode[]>
  currentPath: string
  binHasItems: boolean
  expandedPaths: Set<string>
  onToggle: (path: string, expanded: boolean) => void
  onNavigate: (path: string) => void
  /** Render as a toggle-less namespace root (Desktop): children always shown. */
  root?: boolean
}

function FolderTreeNode({ node, childrenByParent, currentPath, binHasItems, expandedPaths, onToggle, onNavigate, root = false }: FolderTreeNodeProps): ReactElement {
  const subFolders = childrenByParent.get(node.path) ?? []
  const selected = node.path === currentPath
  const expanded = expandedPaths.has(node.path)

  // The Recycle Bin swaps between full/empty art by its contents; other generic
  // folders flip to an open-folder icon while expanded or selected (the current
  // folder reads as "open" even when its subtree is collapsed).
  const iconSrc = node.path === RECYCLE_BIN_PATH
    ? (binHasItems ? ICON.recycleBinFull.sm : ICON.recycleBin.sm)
    : node.icon === FS_ICONS.folder && (root || expanded || selected) ? FS_ICONS.folderOpen : node.icon
  const icon = <TreeIcon src={iconSrc} />

  const childNodes = subFolders.map(child => (
    <FolderTreeNode
      key={child.path}
      node={child}
      childrenByParent={childrenByParent}
      currentPath={currentPath}
      binHasItems={binHasItems}
      expandedPaths={expandedPaths}
      onToggle={onToggle}
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
      onExpandedChange={next => onToggle(node.path, next)}
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
  // Persistent expansion set. The +/- box and double-click add/remove entries;
  // navigating only *reveals* the current folder by adding its ancestors — it
  // never collapses branches. This matches Explorer, where a branch stays
  // expanded regardless of which folder is later selected.
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set(ancestorPaths(currentPath)))
  const [revealedFor, setRevealedFor] = useState(currentPath)
  if (revealedFor !== currentPath) {
    setRevealedFor(currentPath)
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      for (const ancestor of ancestorPaths(currentPath))
        next.add(ancestor)
      return next.size === prev.size ? prev : next
    })
  }

  const handleToggle = (path: string, expanded: boolean): void => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (expanded)
        next.add(path)
      else
        next.delete(path)
      return next
    })
  }

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
        expandedPaths={expandedPaths}
        onToggle={handleToggle}
        onNavigate={onNavigate}
        root
      />
    </TreeView>
  )
}
