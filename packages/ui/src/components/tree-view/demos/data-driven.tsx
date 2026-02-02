import type { TreeViewItemProps } from '../tree-view'

import * as React from 'react'
import { TreeView } from '../tree-view'

interface TreeNode extends Omit<TreeViewItemProps, 'children'> {
  id: string
  children?: TreeNode[]
}

/**
 * Recursively render TreeView items from data
 */
function renderTreeItems(nodes: TreeNode[]): React.ReactNode {
  return nodes.map(node => (
    <TreeView.Item
      key={node.id}
      label={node.label}
      icon={node.icon}
      {...(node.defaultExpanded !== undefined && { defaultExpanded: node.defaultExpanded })}
      {...(node.disabled !== undefined && { disabled: node.disabled })}
      {...(node.className !== undefined && { className: node.className })}
      {...(node.onClick !== undefined && { onClick: node.onClick })}
    >
      {node.children && renderTreeItems(node.children)}
    </TreeView.Item>
  ))
}

const fileSystemData: TreeNode[] = [
  {
    id: 'root-1',
    label: 'Documents',
    icon: <span>📁</span>,
    defaultExpanded: true,
    children: [
      {
        id: 'folder-1',
        label: 'Work',
        icon: <span>📁</span>,
        children: [
          { id: 'file-1', label: 'Report.pdf', icon: <span>📄</span> },
          { id: 'file-2', label: 'Budget.xlsx', icon: <span>📊</span> },
        ],
      },
      {
        id: 'folder-2',
        label: 'Personal',
        icon: <span>📁</span>,
        children: [
          { id: 'file-3', label: 'Photos', icon: <span>🖼️</span> },
          { id: 'file-4', label: 'Notes.txt', icon: <span>📝</span> },
        ],
      },
    ],
  },
  {
    id: 'root-2',
    label: 'Music',
    icon: <span>🎵</span>,
    children: [
      {
        id: 'folder-3',
        label: 'Playlists',
        icon: <span>📋</span>,
        children: [
          { id: 'file-5', label: 'Favorite Songs.m3u', icon: <span>🎶</span> },
          { id: 'file-6', label: 'Workout.m3u', icon: <span>💪</span> },
        ],
      },
      { id: 'file-7', label: 'podcast.mp3', icon: <span>🎙️</span> },
    ],
  },
]

export default function TreeViewDataDemo(): React.ReactElement {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold">File System</h3>
      <TreeView>{renderTreeItems(fileSystemData)}</TreeView>
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { renderTreeItems, type TreeNode }
