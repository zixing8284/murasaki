import {
  Button,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ThemeProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Window,
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowMaximizeButton,
  WindowMinimizeButton,
  WindowTitle,
  WindowTitleBar,
} from '@murasaki-io/react98'

const rows = Array.from(
  { length: 16 },
  (_, index) => `SSR compatibility row ${index + 1}`,
)

export default function Page(): React.ReactElement {
  return (
    <ThemeProvider defaultTheme="windows-98" storageKey={null}>
      <main className="fixturePage">
        <Window positioning="absolute">
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
              <Tooltip>
                <TooltipTrigger>
                  <Button>Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>Rendered through the package client boundary</TooltipContent>
              </Tooltip>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label htmlFor="fixture-theme">Theme</label>
                <Select defaultValue="windows-98" name="theme">
                  <SelectTrigger id="fixture-theme" className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="windows-98">Windows 98</SelectItem>
                    <SelectItem value="windows-95">Windows 95</SelectItem>
                    <SelectItem value="slate">Slate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="fixtureScrollArea">
                <div className="fixtureScrollContent">
                  {rows.map(row => (
                    <p key={row}>{row}</p>
                  ))}
                </div>
              </ScrollArea>
            </WindowContent>
          </WindowFrame>
        </Window>
      </main>
    </ThemeProvider>
  )
}
