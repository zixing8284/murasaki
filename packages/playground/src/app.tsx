import { ProcessProvider } from './contexts/process'
import { Shell } from './shell/shell'

export function App(): React.ReactElement {
  return (
    <ProcessProvider>
      <Shell />
    </ProcessProvider>
  )
}
