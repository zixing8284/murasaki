import {
  WindowContent,
  WindowFrame,
  WindowProvider,
  WindowResizeGrip,
  WindowStatusBar,
  WindowStatusBarField,
  WindowTitleBar,
} from 'murasaki-react98'

export default function DemoBasicStatusBar(): React.ReactElement {
  return (
    <WindowProvider positioning="absolute">
      <WindowFrame className="relative w-80 h-auto">
        <WindowTitleBar>
          <span className="px-0.5 font-bold">My Application</span>
        </WindowTitleBar>
        <WindowContent className="p-3">
          <p>Window content goes here.</p>
        </WindowContent>
        <WindowStatusBar>
          <WindowStatusBarField>Press F1 for help</WindowStatusBarField>
          <WindowStatusBarField grow={false}>Ln 1, Col 1</WindowStatusBarField>
          <WindowStatusBarField grow={false}>INS</WindowStatusBarField>
        </WindowStatusBar>
        <WindowResizeGrip />
      </WindowFrame>
    </WindowProvider>
  )
}
