'use client'

import { TreeView, TreeViewItem } from '@murasaki-io/react98'

export function TreeViewBasicDemo(): React.ReactElement {
  return (
    <TreeView className="h-44 w-72 shadow-(--shadow-border-field)">
      <TreeViewItem label="Desktop" defaultExpanded>
        <TreeViewItem label="My Computer" selected />
        <TreeViewItem label="Network Neighborhood" />
        <TreeViewItem label="Control Panel" defaultExpanded>
          <TreeViewItem label="Display" />
          <TreeViewItem label="Mouse" />
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem label="Recycle Bin" />
    </TreeView>
  )
}
