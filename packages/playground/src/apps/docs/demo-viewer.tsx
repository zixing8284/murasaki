import type { ComponentType } from 'react'
import { Suspense } from 'react'
import { CodeBlock } from './code-block'

interface DemoViewerProps {
  Demo: ComponentType
  source: string
}

export function DemoViewer({ Demo, source }: DemoViewerProps): React.ReactElement {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Demo preview area */}
      <div className="basis-[55%] shrink-0 overflow-hidden">
        <div className="p-3">
          <Suspense fallback={<div className="p-2 text-[11px]">Loading demo...</div>}>
            <Demo />
          </Suspense>
        </div>
      </div>

      {/* Resize divider */}
      <div className="h-px shrink-0 bg-(--color-btn-shadow) shadow-[0_1px_0_var(--color-btn-hilight)]" />

      {/* Source code area */}
      <div className="flex-1 min-h-0 shadow-sunken bg-white p-[2px] [&>.docs-code-block]:h-full">
        <CodeBlock code={source} lang="tsx" />
      </div>
    </div>
  )
}
