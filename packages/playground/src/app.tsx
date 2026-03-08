import { ThemeProvider } from 'murasaki-react98'
import { ProcessProvider } from './contexts/process'
import { Shell } from './shell/shell'

export function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <ProcessProvider>
        <Shell />
      </ProcessProvider>
    </ThemeProvider>
  )
}
