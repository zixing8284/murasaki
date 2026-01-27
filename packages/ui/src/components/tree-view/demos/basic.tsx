import React from 'react'

import { TreeView } from '../tree-view'

export default function TreeViewBasicDemo(): React.ReactElement {
  return (
    <div>
      <TreeView>
        <TreeView.Item label="Table of Contents" />
        <TreeView.Item label="What is web development?" />
        <TreeView.Item label="CSS" icon={<span>📁</span>}>
          <TreeView.Item label="Selectors" />
          <TreeView.Item label="Specificity" />
          <TreeView.Item label="Properties" />
        </TreeView.Item>
        <TreeView.Item
          label="JavaScript"
          defaultExpanded
          icon={<span>📁</span>}
        >
          <TreeView.Item label="Avoid at all costs" />
          <TreeView.Item label="Unless">
            <TreeView.Item label="Avoid" />
            <TreeView.Item label="At">
              <TreeView.Item label="Avoid" />
              <TreeView.Item label="At" />
              <TreeView.Item label="All" />
              <TreeView.Item label="Cost" />
            </TreeView.Item>
            <TreeView.Item label="All" />
            <TreeView.Item label="Cost" />
          </TreeView.Item>
        </TreeView.Item>
        <TreeView.Item label="HTML" icon={<span>📁</span>} />
        <TreeView.Item label="Special Thanks" />
      </TreeView>
    </div>
  )
}
