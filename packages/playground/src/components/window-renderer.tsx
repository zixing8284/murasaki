import { getAppDefinition } from '../stores/app-registry'
import { useWindowManager } from '../stores/window-manager'

export function WindowRenderer(): React.ReactElement {
  const windows = useWindowManager(s => s.windows)
  const windowIds = Object.keys(windows)

  return (
    <>
      {windowIds.map((id) => {
        const record = windows[id]
        const def = getAppDefinition(record.appId)
        if (!def)
          return null
        const Component = def.component
        return <Component key={id} windowId={id} />
      })}
    </>
  )
}
