import type { NavNode } from './docs-nav'
import { TreeView } from 'murasaki-react98'
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
  const [selectedId, setSelectedId] = useState<string>(docsNavTree[0]?.id ?? '')
  const selectedNode = findNode(docsNavTree, selectedId)

  return (
    <div className="flex h-full">
      {/* Left panel - TreeView navigation */}
      <div className="w-45 shrink-0 overflow-y-auto overflow-x-hidden bg-white">
        <TreeView className="border-none! shadow-none! bg-transparent! h-full">
          <TreeView.Item
            label="Welcome"
            onClick={() => setSelectedId('welcome')}
          />
          {docsNavTree.map(node => (
            <TreeView.Item
              key={node.id}
              label={node.label}
              defaultExpanded
              onClick={() => setSelectedId(node.id)}
            >
              {node.children?.map(child => (
                <TreeView.Item
                  key={child.id}
                  label={child.label}
                  onClick={() => setSelectedId(child.id)}
                />
              ))}
            </TreeView.Item>
          ))}
        </TreeView>
      </div>

      {/* Vertical divider */}
      <div className="w-px bg-(--color-btn-shadow) shadow-[1px_0_0_var(--color-btn-hilight)]" />

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
            <div className="p-3 text-[11px] text-gray-500">
              Select a component from the tree to view its documentation.
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
