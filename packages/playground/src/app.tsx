import { ThemeProvider } from 'murasaki-react98'
import { DesktopFilesProvider } from './contexts/desktop-files'
import { ProcessProvider } from './contexts/process'
import { Shell } from './shell/shell'

export function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <DesktopFilesProvider>
        <ProcessProvider>
          <Shell />
        </ProcessProvider>
      </DesktopFilesProvider>
    </ThemeProvider>
  )
}
