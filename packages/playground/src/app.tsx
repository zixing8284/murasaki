import { ThemeProvider } from '@murasaki-io/react98'
import { CursorSchemeProvider } from './contexts/cursor-scheme'
import { DesktopFilesProvider } from './contexts/desktop-files/provider'
import { DesktopLayoutProvider } from './contexts/desktop-layout/provider'
import { ProcessProvider } from './contexts/process/provider'
import { SystemCursorProvider } from './contexts/system-cursor'
import { TaskbarSettingsProvider } from './contexts/taskbar-settings'
import { PLAYGROUND_STORAGE_KEYS } from './lib/persistence/schema'
import { Shell } from './shell/shell'

export function App(): React.ReactElement {
  return (
    <ThemeProvider storageKey={PLAYGROUND_STORAGE_KEYS.theme}>
      <DesktopFilesProvider>
        <DesktopLayoutProvider>
          <ProcessProvider>
            <CursorSchemeProvider>
              <SystemCursorProvider>
                <TaskbarSettingsProvider>
                  <Shell />
                </TaskbarSettingsProvider>
              </SystemCursorProvider>
            </CursorSchemeProvider>
          </ProcessProvider>
        </DesktopLayoutProvider>
      </DesktopFilesProvider>
    </ThemeProvider>
  )
}
