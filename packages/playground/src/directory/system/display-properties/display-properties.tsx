import type { ThemeId } from '@murasaki-io/react98'
import type { ProcessComponentProps } from '../../../contexts/process/types'
import {
  Button,
  Checkbox,
  Select,
  Slider,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  themeIds,
  themeLabels,
  useTheme,
} from '@murasaki-io/react98'
import { useState } from 'react'
import { useProcessActions } from '../../../contexts/process/hooks'
import { useCrtEffect } from '../../../hooks/use-crt-effect'
import { areCrtTuningSettingsEqual, useCrtTuning } from '../../../hooks/use-crt-tuning'
import { useGradientTitlebar } from '../../../hooks/use-gradient-titlebar'
import { ThemePreview } from './theme-preview'

const themeOptions = themeIds.map(id => ({
  label: themeLabels[id],
  value: id,
}))

const CRT_PRESETS = {
  soft: {
    label: 'Soft CRT',
    settings: {
      scanlineOpacity: 0.18,
      jitterAmount: 0.08,
      rollDuration: 24,
      rollOpacity: 0.04,
    },
  },
  arcade: {
    label: 'Arcade CRT',
    settings: {
      scanlineOpacity: 0.24,
      jitterAmount: 0.28,
      rollDuration: 18,
      rollOpacity: 0.08,
    },
  },
  heavy: {
    label: 'Heavy CRT',
    settings: {
      scanlineOpacity: 0.4,
      jitterAmount: 1.1,
      rollDuration: 12,
      rollOpacity: 0.16,
    },
  },
} as const

export function DisplayProperties({ windowId }: ProcessComponentProps): React.ReactElement | null {
  const { themeId: currentThemeId, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(currentThemeId)
  const actions = useProcessActions()
  const [currentCrtEnabled, setCrtEnabled] = useCrtEffect()
  const [currentCrtTuning, setCrtTuning] = useCrtTuning()
  // Track the value at dialog open (or last Apply) so Cancel can revert.
  const [committedCrtEnabled, setCommittedCrtEnabled] = useState(currentCrtEnabled)
  const [committedCrtTuning, setCommittedCrtTuning] = useState(currentCrtTuning)
  const [currentGradientEnabled, setGradientEnabled] = useGradientTitlebar()
  const [committedGradientEnabled, setCommittedGradientEnabled] = useState(currentGradientEnabled)
  const crtTuningDisabled = !currentCrtEnabled

  // CRT/gradient are applied immediately for live preview; only theme is deferred.
  const hasPendingChanges = selectedTheme !== currentThemeId
    || currentCrtEnabled !== committedCrtEnabled
    || !areCrtTuningSettingsEqual(currentCrtTuning, committedCrtTuning)
    || currentGradientEnabled !== committedGradientEnabled

  const applySettings = (): void => {
    if (selectedTheme !== currentThemeId) {
      setTheme(selectedTheme)
    }
    // CRT/gradient are already live — just advance the committed baseline.
    setCommittedCrtEnabled(currentCrtEnabled)
    setCommittedCrtTuning(currentCrtTuning)
    setCommittedGradientEnabled(currentGradientEnabled)
  }

  const handleApply = (): void => {
    applySettings()
  }

  const handleOk = (): void => {
    applySettings()
    actions.close(windowId)
  }

  const handleCancel = (): void => {
    // Revert any live-previewed changes that were never applied.
    if (currentCrtEnabled !== committedCrtEnabled) {
      setCrtEnabled(committedCrtEnabled)
    }
    if (!areCrtTuningSettingsEqual(currentCrtTuning, committedCrtTuning)) {
      setCrtTuning(committedCrtTuning)
    }
    if (currentGradientEnabled !== committedGradientEnabled) {
      setGradientEnabled(committedGradientEnabled)
    }
    actions.close(windowId)
  }

  return (
    <div className="flex flex-col gap-3">
      <Tabs defaultValue="theme" className="w-full" keepMounted>
        <TabList>
          <Tab value="theme">Theme</Tab>
          <Tab value="wallpaper">Wallpaper</Tab>
          <Tab value="appearance">Appearance</Tab>
        </TabList>

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
              onValueChange={value => setSelectedTheme(value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-(--button-text)">Sample:</span>
            <ThemePreview themeId={selectedTheme} gradientTitlebar={currentGradientEnabled} />
          </div>
        </TabPanel>

        <TabPanel value="wallpaper" className="flex flex-col gap-3 p-3">
          <p className="text-(--button-text)">Wallpaper settings are not available.</p>
        </TabPanel>

        <TabPanel value="appearance" className="flex flex-col gap-3 p-3">
          <Checkbox
            checked={currentCrtEnabled}
            onCheckedChange={setCrtEnabled}
          >
            Enable CRT monitor effect
          </Checkbox>

          <div className={`flex flex-col gap-2 p-2${crtTuningDisabled ? ' opacity-60' : ''}`}>
            <div className="text-(--button-text)">CRT tuning</div>

            <div className="flex flex-wrap items-center gap-1">
              <span className="mr-1 text-(--button-text)">Presets:</span>
              {Object.values(CRT_PRESETS).map((preset) => {
                const active = areCrtTuningSettingsEqual(currentCrtTuning, preset.settings)
                return (
                  <Button
                    key={preset.label}
                    className="min-w-20"
                    disabled={crtTuningDisabled || active}
                    onClick={() => setCrtTuning(preset.settings)}
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>

            <label className="grid grid-cols-[7rem_1fr_auto] items-center gap-2 text-(--button-text)">
              <span>Scanlines</span>
              <Slider
                disabled={crtTuningDisabled}
                min={0}
                max={0.6}
                step={0.01}
                value={currentCrtTuning.scanlineOpacity}
                onValueChange={value => setCrtTuning({ ...currentCrtTuning, scanlineOpacity: value })}
              />
              <span className="w-8 text-right">{Math.round(currentCrtTuning.scanlineOpacity * 100)}</span>
            </label>

            <label className="grid grid-cols-[7rem_1fr_auto] items-center gap-2 text-(--button-text)">
              <span>Jitter</span>
              <Slider
                disabled={crtTuningDisabled}
                min={0}
                max={2}
                step={0.02}
                value={currentCrtTuning.jitterAmount}
                onValueChange={value => setCrtTuning({ ...currentCrtTuning, jitterAmount: value })}
              />
              <span className="w-8 text-right">{currentCrtTuning.jitterAmount.toFixed(2)}</span>
            </label>

            <label className="grid grid-cols-[7rem_1fr_auto] items-center gap-2 text-(--button-text)">
              <span>Roll (sec)</span>
              <Slider
                disabled={crtTuningDisabled}
                min={8}
                max={40}
                step={0.5}
                value={currentCrtTuning.rollDuration}
                onValueChange={value => setCrtTuning({ ...currentCrtTuning, rollDuration: value })}
              />
              <span className="w-8 text-right">{currentCrtTuning.rollDuration.toFixed(1)}</span>
            </label>

            <label className="grid grid-cols-[7rem_1fr_auto] items-center gap-2 text-(--button-text)">
              <span>Roll fade</span>
              <Slider
                disabled={crtTuningDisabled}
                min={0}
                max={0.25}
                step={0.01}
                value={currentCrtTuning.rollOpacity}
                onValueChange={value => setCrtTuning({ ...currentCrtTuning, rollOpacity: value })}
              />
              <span className="w-8 text-right">{Math.round(currentCrtTuning.rollOpacity * 100)}</span>
            </label>
          </div>

          <Checkbox
            checked={currentGradientEnabled}
            onCheckedChange={setGradientEnabled}
          >
            Use gradient title bars
          </Checkbox>
        </TabPanel>
      </Tabs>

      <div className="flex justify-end gap-(--grouped-button-spacing)">
        <Button onClick={handleOk} className="min-w-18.75">Apply and close</Button>
        <Button onClick={handleCancel} className="min-w-18.75">Cancel</Button>
        <Button
          onClick={handleApply}
          className="min-w-18.75"
          disabled={!hasPendingChanges}
        >
          Apply
        </Button>
      </div>
    </div>
  )
}
