import type { ProcessComponentProps } from '../../contexts/process'
import { RndWindow } from '../../shell/window/rnd-window'
import { DocsLayout } from './docs-layout'

export function DocsApp({ windowId }: ProcessComponentProps): React.ReactElement | null {
  return (
    <RndWindow
      windowId={windowId}
      className="w-[750px] h-[90%] top-[10%] left-[60px]"
    >
      <DocsLayout />
    </RndWindow>
  )
}
