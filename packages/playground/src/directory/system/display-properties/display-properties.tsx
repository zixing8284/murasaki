import type { ThemeId } from '@murasaki/react98'
import type { ProcessComponentProps } from '../../../contexts/process'
import {
  Button,
  Checkbox,
  SelectNative,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  themeIds,
  useTheme,
} from '@murasaki/react98'
import { useState } from 'react'
import { useProcessActions } from '../../../contexts/process'
import { useCrtEffect } from '../../../hooks/use-crt-effect'
import { useGradientTitlebar } from '../../../hooks/use-gradient-titlebar'
import { ThemePreview } from './theme-preview'

const themeLabels: Record<ThemeId, string> = {
  'windows-98': 'Windows 98',
  'solarized-dark': 'Solarized Dark',
}

export function DisplayProperties({ windowId }: ProcessComponentProps): React.ReactElement | null {
  const { themeId: currentThemeId, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(currentThemeId)
  const actions = useProcessActions()
  const [crtEnabled, setCrtEnabled] = useCrtEffect()
  const [gradientEnabled, setGradientEnabled] = useGradientTitlebar()

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
    <div className="flex flex-col gap-2">
      <Tabs defaultValue="theme" className="w-full" keepMounted>
        <TabList>
          <Tab value="theme">Theme</Tab>
          <Tab value="wallpaper">Wallpaper</Tab>
          <Tab value="appearance">Appearance</Tab>
        </TabList>

        <TabPanel value="theme" className="flex flex-col gap-2">
          <p className="text-(--button-text) leading-snug">
            A theme is a set of icons, visual styles, and sounds to alter the
            core experience of the user interface.
          </p>

          <div className="flex flex-col gap-1">
            <label className="text-(--button-text)" htmlFor="theme-select">
              Selected Theme:
            </label>
            <SelectNative
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
            </SelectNative>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-(--button-text)">Sample:</span>
            <ThemePreview themeId={selectedTheme} gradientTitlebar={gradientEnabled} />
          </div>
        </TabPanel>

        <TabPanel value="wallpaper">
          <p className="text-(--button-text)">Wallpaper settings are not available.</p>
        </TabPanel>

        <TabPanel value="appearance" className="flex flex-col gap-3">
          <Checkbox
            checked={crtEnabled}
            onChange={e => setCrtEnabled(e.target.checked)}
          >
            Enable CRT monitor effect
          </Checkbox>
          <Checkbox
            checked={gradientEnabled}
            onChange={e => setGradientEnabled(e.target.checked)}
          >
            Use gradient title bars
          </Checkbox>
        </TabPanel>
      </Tabs>

      <div className="flex justify-end gap-(--grouped-button-spacing)">
        <Button onClick={handleOk} className="min-w-18.75">OK</Button>
        <Button onClick={handleCancel} className="min-w-18.75">Cancel</Button>
        <Button
          onClick={handleApply}
          className="min-w-18.75"
          disabled={selectedTheme === currentThemeId}
        >
          Apply
        </Button>
      </div>
    </div>
  )
}
