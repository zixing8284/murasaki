import type { ProcessComponentProps } from '../../../contexts/process'
import { IframeWindow } from '../../../shell/window/iframe-window'

const DOCS_APP_URL = '/programs/docs/index.html'

function DocsIcon(): React.ReactElement {
  return (
    <img
      src="/img/desktop/MyComputer.png"
      alt=""
      className="w-4 h-4 pixelated shrink-0"
      draggable={false}
    />
  )
}

export function DocsApp({ windowId }: ProcessComponentProps): React.ReactElement | null {
  return (
    <IframeWindow
      windowId={windowId}
      src={DOCS_APP_URL}
      className="h-[90%] top-[10%] left-15"
      titleIcon={<DocsIcon />}
    />
  )
}
