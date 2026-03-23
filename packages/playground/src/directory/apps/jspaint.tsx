import type { ProcessComponentProps } from '../../contexts/process'
import { IframeWindow } from '../../shell/window/iframe-window'

const JSPaintApp_URL = 'https://jspaint.app/'

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
      className="w-[900px] h-[650px] top-[5%] left-[5%]"
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-top-navigation-by-user-activation"
      referrerPolicy="no-referrer-when-downgrade"
      titleIcon={<JspaintIcon />}
    />
  )
}
