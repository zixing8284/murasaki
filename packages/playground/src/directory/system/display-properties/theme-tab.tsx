import type { ThemeId } from '@murasaki-io/react98'
import { Select, TabPanel, themeIds, themeLabels } from '@murasaki-io/react98'
import { ThemePreview } from './theme-preview'

const themeOptions = themeIds.map(id => ({
  label: themeLabels[id],
  value: id,
}))

interface ThemeTabProps {
  selectedTheme: ThemeId
  onSelectedThemeChange: (value: ThemeId) => void
  currentGradientEnabled: boolean
}

export function ThemeTab({ selectedTheme, onSelectedThemeChange, currentGradientEnabled }: ThemeTabProps): React.ReactElement {
  return (
    <TabPanel value="theme" className="flex flex-col gap-3 p-3">
      <p className="text-(--button-text) leading-snug">
        A theme is a set of icons, visual styles, and sounds to alter the
        core experience of the user interface.
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-(--button-text)" htmlFor="theme-select">
          Selected Theme:
        </label>
        <Select
          id="theme-select"
          name="theme"
          className="w-full"
          options={themeOptions}
          value={selectedTheme}
          onValueChange={value => onSelectedThemeChange(value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-(--button-text)">Sample:</span>
        <ThemePreview themeId={selectedTheme} gradientTitlebar={currentGradientEnabled} />
      </div>
    </TabPanel>
  )
}
