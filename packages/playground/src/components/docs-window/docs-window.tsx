import type { ProcessComponentProps } from '../../contexts/process'
import { WindowApp } from '../window-app'
import { DocsLayout } from './docs-layout'

export function DocsWindow({ windowId }: ProcessComponentProps): React.ReactElement | null {
  return (
    <WindowApp
      windowId={windowId}
      className="w-[750px] h-[90%] top-[10%] left-[60px]"
      titleIcon={<img src="/img/desktop/MyComputer.png" alt="" className="w-4 h-4 pixelated" />}
    >
      <DocsLayout />
    </WindowApp>
  )
}
