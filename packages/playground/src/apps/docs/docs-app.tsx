import type { ProcessComponentProps } from '../../contexts/process'
import { AppWindow } from '../../shell/window/app-window'
import { DocsLayout } from './docs-layout'

export function DocsApp({ windowId }: ProcessComponentProps): React.ReactElement | null {
  return (
    <AppWindow
      windowId={windowId}
      className="w-[750px] h-[90%] top-[10%] left-[60px]"
      titleIcon={<img src="/img/desktop/MyComputer.png" alt="" className="w-4 h-4 pixelated" />}
    >
      <DocsLayout />
    </AppWindow>
  )
}
