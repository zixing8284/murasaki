import type { NavNode } from './docs-nav'
import { FieldPanel, TreeView, TreeViewItem } from 'murasaki-react98'
import { Suspense, useState } from 'react'
import { DemoViewer } from './demo-viewer'
import { docsNavTree } from './docs-nav'

function findNode(nodes: NavNode[], id: string): NavNode | undefined {
  for (const node of nodes) {
    if (node.id === id)
      return node
    if (node.children) {
      const found = findNode(node.children, id)
      if (found)
        return found
    }
  }
  return undefined
}

export function DocsLayout(): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string>('welcome')
  const selectedNode = findNode(docsNavTree, selectedId)

  return (
    <div className="flex h-full p-1">
      {/* Left panel - TreeView navigation */}
      <FieldPanel className="w-45 shrink-0 h-full">
        <TreeView>
          <TreeViewItem
            label="Welcome"
            selected={selectedId === 'welcome'}
            onClick={() => setSelectedId('welcome')}
          />
          {docsNavTree.map(node => (
            <TreeViewItem
              key={node.id}
              label={node.label}
              defaultExpanded
              preventCollapse={node.id !== selectedId}
              selected={selectedId === node.id}
              onClick={() => setSelectedId(node.id)}
            >
              {node.children?.map(child => (
                <TreeViewItem
                  key={child.id}
                  label={child.label}
                  selected={selectedId === child.id}
                  onClick={() => setSelectedId(child.id)}
                />
              ))}
            </TreeViewItem>
          ))}
        </TreeView>
      </FieldPanel>

      {/* Right panel - Content area */}
      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
        <Suspense key={selectedId} fallback={<div className="p-3">Loading...</div>}>
          {selectedNode?.type === 'component' && selectedNode.component && (
            <div className="docs-mdx-content p-3 h-full overflow-auto">
              <selectedNode.component />
            </div>
          )}
          {selectedNode?.type === 'demo' && selectedNode.component && selectedNode.source && (
            <DemoViewer Demo={selectedNode.component} source={selectedNode.source} />
          )}
          {!selectedNode && (
            <div className="p-3 text-[11px] text-(--gray-text)">
              Select a component from the tree to view its documentation.
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
