import { ThemeProvider } from '@murasaki/react98'
import { DesktopFilesProvider } from './contexts/desktop-files'
import { DesktopLayoutProvider } from './contexts/desktop-layout'
import { ProcessProvider } from './contexts/process'
import { PLAYGROUND_STORAGE_KEYS } from './lib/persistence'
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
