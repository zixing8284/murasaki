export const sunkenPanelBasicSource = String.raw`import { SunkenPanel } from 'murasaki-react98'

export function SunkenPanelBasicExample(): React.ReactElement {
  return (
    <SunkenPanel className="h-24 w-72 bg-(--window)">
      <div className="p-2 text-(--window-text)">
        <p className="m-0">Output</p>
        <p className="m-0">The operation completed successfully.</p>
      </div>
    </SunkenPanel>
  )
}`
