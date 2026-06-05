import { ThemeProvider } from '@murasaki-io/react98'
import { DesktopFilesProvider } from './contexts/desktop-files/provider'
import { DesktopLayoutProvider } from './contexts/desktop-layout/provider'
import { ProcessProvider } from './contexts/process/provider'
import { PLAYGROUND_STORAGE_KEYS } from './lib/persistence/schema'
import { Shell } from './shell/shell'

export function App(): React.ReactElement {
  return (
    <ThemeProvider storageKey={PLAYGROUND_STORAGE_KEYS.theme}>
      <DesktopFilesProvider>
        <DesktopLayoutProvider>
          <ProcessProvider>
            <Shell />
          </ProcessProvider>
        </DesktopLayoutProvider>
      </DesktopFilesProvider>
    </ThemeProvider>
  )
}
