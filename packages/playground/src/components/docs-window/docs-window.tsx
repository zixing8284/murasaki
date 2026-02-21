import type { AppWindowProps } from '../../stores/app-registry'
import { WindowApp } from '../window-app'
import { DocsLayout } from './docs-layout'

export function DocsWindow({ windowId }: AppWindowProps): React.ReactElement | null {
  return (
    <WindowApp
      windowId={windowId}
      className="w-[750px]"
      style={{ height: '70%', top: '10%', left: '60px' }}
      titleIcon={<img src="/img/desktop/MyComputer.png" alt="" className="w-4 h-4 pixelated" />}
    >
      <DocsLayout />
    </WindowApp>
  )
}
