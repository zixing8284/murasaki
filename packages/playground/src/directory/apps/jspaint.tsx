import type { ProcessComponentProps } from '../../contexts/process'
import { IframeWindow } from '../../shell/window/iframe-window'

const JSPaintApp_URL = '/programs/jspaint/index.html'

function JspaintIcon(): React.ReactElement {
  return (
    <img
      src="/img/desktop/InternetExplorer.png"
      alt=""
      className="w-4 h-4 pixelated shrink-0"
      draggable={false}
    />
  )
}

export function JspaintApp({ windowId }: ProcessComponentProps): React.ReactElement {
  return (
    <IframeWindow
      windowId={windowId}
      src={JSPaintApp_URL}
      className="top-[5%] left-[5%]"
      titleIcon={<JspaintIcon />}
    />
  )
}
