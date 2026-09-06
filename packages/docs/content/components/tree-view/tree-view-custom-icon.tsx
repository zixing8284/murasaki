'use client'

import { TreeView, TreeViewItem } from '@murasaki-io/react98'

/** A right-pointing triangle shown on collapsed branches. */
function ExpandTriangle(): React.ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 7 7" width="7" height="7" shapeRendering="crispEdges" fill="currentColor">
      <path d="M1 0h1v7H1zM2 1h1v5H2zM3 2h1v3H3zM4 3h1v1H4z" />
    </svg>
  )
}

/** A down-pointing triangle shown on expanded branches. */
function CollapseTriangle(): React.ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 7 7" width="7" height="7" shapeRendering="crispEdges" fill="currentColor">
      <path d="M0 1h7v1H0zM1 2h5v1H1zM2 3h3v1H2zM3 4h1v1H3z" />
    </svg>
  )
}

export function TreeViewCustomIconDemo(): React.ReactElement {
  return (
    <TreeView className="h-44 w-72 shadow-(--shadow-border-field)">
      <TreeViewItem
        label="Desktop"
        defaultExpanded
        expandIcon={<ExpandTriangle />}
        collapseIcon={<CollapseTriangle />}
      >
        <TreeViewItem label="My Computer" selected />
        <TreeViewItem label="Network Neighborhood" />
        <TreeViewItem
          label="Control Panel"
          defaultExpanded
          expandIcon={<ExpandTriangle />}
          collapseIcon={<CollapseTriangle />}
        >
          <TreeViewItem label="Display" />
          <TreeViewItem label="Mouse" />
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem label="Recycle Bin" />
    </TreeView>
  )
}
