import { ThemeProvider } from 'murasaki-react98'
import { DesktopFilesProvider } from './contexts/desktop-files'
import { DesktopLayoutProvider } from './contexts/desktop-layout'
import { ProcessProvider } from './contexts/process'
import { Shell } from './shell/shell'

export function App(): React.ReactElement {
  return (
    <ThemeProvider>
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
