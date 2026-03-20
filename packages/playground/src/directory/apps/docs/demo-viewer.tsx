import type { ComponentType } from 'react'
import { FieldPanel } from 'murasaki-react98'
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

      {/* Source code area */}
      <FieldPanel className="flex-1 min-h-0 p-0.5 [&>.docs-code-block]:h-full">
        <CodeBlock code={source} lang="tsx" />
      </FieldPanel>
    </div>
  )
}
