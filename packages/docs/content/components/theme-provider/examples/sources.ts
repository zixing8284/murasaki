export const themeProviderBasicSource = String.raw`import { Button, FieldPanel, ThemeProvider, useTheme } from 'murasaki-react98'

function ThemeControls(): React.ReactElement {
  const { themeId, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-2 p-2">
      <div>Active theme: {themeId}</div>
      <div className="flex gap-2">
        <Button onClick={() => setTheme('windows-98')}>Windows 98</Button>
        <Button onClick={() => setTheme('solarized-dark')}>Solarized</Button>
      </div>
    </div>
  )
}

export function ThemeProviderBasicExample(): React.ReactElement {
  return (
    <ThemeProvider defaultTheme="windows-98" storageKey={null}>
      <FieldPanel className="w-80">
        <ThemeControls />
      </FieldPanel>
    </ThemeProvider>
  )
}`
