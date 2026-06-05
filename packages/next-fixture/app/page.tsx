import {
  Button,
  ScrollArea,
  Select,
  ThemeProvider,
  Tooltip,
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowMaximizeButton,
  WindowMinimizeButton,
  WindowProvider,
  WindowTitle,
  WindowTitleBar,
} from '@murasaki-io/react98'

const options = [
  { label: 'Windows 98', value: 'windows-98' },
  { label: 'Windows 95', value: 'windows-95' },
  { label: 'Slate', value: 'slate' },
]

const rows = Array.from(
  { length: 16 },
  (_, index) => `SSR compatibility row ${index + 1}`,
)

export default function Page(): React.ReactElement {
  return (
    <ThemeProvider defaultTheme="windows-98" storageKey={null}>
      <main className="fixturePage">
        <WindowProvider positioning="absolute">
          <WindowFrame className="fixtureWindow">
            <WindowTitleBar>
              <WindowTitle>@murasaki-io/react98</WindowTitle>
              <WindowButtons>
                <WindowMinimizeButton />
                <WindowMaximizeButton />
                <WindowCloseButton />
              </WindowButtons>
            </WindowTitleBar>
            <WindowContent className="fixtureContent">
              <Tooltip text="Rendered through the package client boundary">
                <Button>Hover me</Button>
              </Tooltip>
              <Select
                defaultValue="windows-98"
                label="Theme"
                name="theme"
                options={options}
                width={220}
              />
              <ScrollArea className="fixtureScrollArea">
                <div className="fixtureScrollContent">
                  {rows.map(row => (
                    <p key={row}>{row}</p>
                  ))}
                </div>
              </ScrollArea>
            </WindowContent>
          </WindowFrame>
        </WindowProvider>
      </main>
    </ThemeProvider>
  )
}
