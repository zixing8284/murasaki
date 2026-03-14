import type { ThemeId } from 'murasaki-react98'
import type { ProcessComponentProps } from '../../../contexts/process'
import {
  Button,
  DropdownNative,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  themeIds,
  useTheme,
} from 'murasaki-react98'
import { useState } from 'react'
import { useProcessActions } from '../../../contexts/process'
import { RndWindow } from '../../../shell/window/rnd-window'
import { ThemePreview } from './theme-preview'

const themeLabels: Record<ThemeId, string> = {
  'windows-98': 'Windows 98',
  'solarized-dark': 'Solarized Dark',
}

export function DisplayProperties({ windowId }: ProcessComponentProps): React.ReactElement | null {
  const { themeId: currentThemeId, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(currentThemeId)
  const actions = useProcessActions()

  const handleApply = (): void => {
    setTheme(selectedTheme)
  }

  const handleOk = (): void => {
    setTheme(selectedTheme)
    actions.close(windowId)
  }

  const handleCancel = (): void => {
    actions.close(windowId)
  }

  return (
    <RndWindow
      windowId={windowId}
      className="w-[420px] top-[12%] left-[25%]"
      disableMaximize
      disableMinimize
      disableResize
      titleIcon={(
        <img
          src="/img/computer.png"
          alt=""
          className="w-4 h-4 pixelated mr-1"
        />
      )}
    >
      <div className="flex flex-col gap-2">
        <Tabs defaultValue="theme" className="w-full" keepMounted>
          <TabList>
            <Tab value="theme">Theme</Tab>
            <Tab value="wallpaper">Wallpaper</Tab>
            <Tab value="appearance">Appearance</Tab>
          </TabList>

          <TabPanel value="theme" className="flex flex-col gap-2">
            <p className="text-btn-text leading-snug">
              A theme is a set of icons, visual styles, and sounds to alter the
              core experience of the user interface.
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-btn-text" htmlFor="theme-select">
                Selected Theme:
              </label>
              <DropdownNative
                id="theme-select"
                name="theme"
                value={selectedTheme}
                onChange={e => setSelectedTheme(e.target.value as ThemeId)}
                className="w-full"
              >
                {themeIds.map(id => (
                  <option key={id} value={id}>
                    {themeLabels[id]}
                  </option>
                ))}
              </DropdownNative>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-btn-text">Sample:</span>
              <ThemePreview themeId={selectedTheme} />
            </div>
          </TabPanel>

          <TabPanel value="wallpaper">
            <p className="text-btn-text">Wallpaper settings are not available.</p>
          </TabPanel>

          <TabPanel value="appearance">
            <p className="text-btn-text">Appearance settings are not available.</p>
          </TabPanel>
        </Tabs>

        {/* Bottom buttons */}
        <div className="flex justify-end gap-grouped-btn">
          <Button onClick={handleOk} className="min-w-[75px]">OK</Button>
          <Button onClick={handleCancel} className="min-w-[75px]">Cancel</Button>
          <Button onClick={handleApply} className="min-w-[75px]">Apply</Button>
        </div>
      </div>
    </RndWindow>
  )
}
