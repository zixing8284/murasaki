import type { ProcessComponentProps } from '../../../contexts/process/types'
import type { WallpaperSettings } from '../../../lib/wallpapers'
import { Button, Tab, TabList, Tabs, useTheme } from '@murasaki-io/react98'
import { useEffect, useReducer } from 'react'
import { useProcessActions } from '../../../contexts/process/hooks'
import { useCrtEffect } from '../../../hooks/use-crt-effect'
import { areCrtTuningSettingsEqual, useCrtTuning } from '../../../hooks/use-crt-tuning'
import { useGradientTitlebar } from '../../../hooks/use-gradient-titlebar'
import { areWallpaperSettingsEqual, useWallpaper } from '../../../hooks/use-wallpaper'
import { useWallpaperColor } from '../../../hooks/use-wallpaper-color'
import { listWallpaperImages } from '../../../lib/wallpaper-storage'
import { AppearanceTab } from './appearance-tab'
import { formReducer } from './form-state'
import { ThemeTab } from './theme-tab'
import { WallpaperTab } from './wallpaper-tab'

export function DisplayProperties({ windowId }: ProcessComponentProps): React.ReactElement | null {
  const { themeId: currentThemeId, setTheme } = useTheme()
  const actions = useProcessActions()
  const [currentCrtEnabled, setCrtEnabled] = useCrtEffect()
  const [currentCrtTuning, setCrtTuning] = useCrtTuning()
  const [currentGradientEnabled, setGradientEnabled] = useGradientTitlebar()
  const [currentWallpaper, setWallpaper] = useWallpaper()
  const [currentWallpaperColor, setWallpaperColor] = useWallpaperColor()

  const [form, dispatch] = useReducer(formReducer, {
    selectedTheme: currentThemeId,
    committedCrtEnabled: currentCrtEnabled,
    committedCrtTuning: currentCrtTuning,
    committedGradientEnabled: currentGradientEnabled,
    selectedWallpaper: currentWallpaper,
    selectedWallpaperColor: currentWallpaperColor,
    committedWallpaper: currentWallpaper,
    committedWallpaperColor: currentWallpaperColor,
    customWallpapers: [],
  })

  useEffect(() => {
    let active = true
    listWallpaperImages()
      .then((entries) => {
        if (active)
          dispatch({ type: 'SET_CUSTOM_WALLPAPERS', value: entries })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // CRT/gradient are applied immediately for live preview; only theme is deferred.
  const hasPendingChanges = form.selectedTheme !== currentThemeId
    || currentCrtEnabled !== form.committedCrtEnabled
    || !areCrtTuningSettingsEqual(currentCrtTuning, form.committedCrtTuning)
    || currentGradientEnabled !== form.committedGradientEnabled
    || !areWallpaperSettingsEqual(form.selectedWallpaper, form.committedWallpaper)
    || form.selectedWallpaperColor !== form.committedWallpaperColor

  const applySettings = (): void => {
    if (form.selectedTheme !== currentThemeId) {
      setTheme(form.selectedTheme)
    }
    // CRT/gradient stay live; wallpaper and color are committed from the staged form values.
    dispatch({ type: 'SET_COMMITTED_CRT_ENABLED', value: currentCrtEnabled })
    dispatch({ type: 'SET_COMMITTED_CRT_TUNING', value: currentCrtTuning })
    dispatch({ type: 'SET_COMMITTED_GRADIENT_ENABLED', value: currentGradientEnabled })
    setWallpaper(form.selectedWallpaper)
    setWallpaperColor(form.selectedWallpaperColor)
    dispatch({ type: 'SET_COMMITTED_WALLPAPER', value: form.selectedWallpaper })
    dispatch({ type: 'SET_COMMITTED_WALLPAPER_COLOR', value: form.selectedWallpaperColor })
  }

  const handleOk = (): void => {
    applySettings()
    actions.close(windowId)
  }

  const handleCancel = (): void => {
    // Revert any live-previewed changes that were never applied.
    if (currentCrtEnabled !== form.committedCrtEnabled) {
      setCrtEnabled(form.committedCrtEnabled)
    }
    if (!areCrtTuningSettingsEqual(currentCrtTuning, form.committedCrtTuning)) {
      setCrtTuning(form.committedCrtTuning)
    }
    if (currentGradientEnabled !== form.committedGradientEnabled) {
      setGradientEnabled(form.committedGradientEnabled)
    }
    if (!areWallpaperSettingsEqual(form.selectedWallpaper, form.committedWallpaper)) {
      setWallpaper(form.committedWallpaper)
    }
    if (form.selectedWallpaperColor !== form.committedWallpaperColor) {
      setWallpaperColor(form.committedWallpaperColor)
    }
    actions.close(windowId)
  }

  function handleSelectedWallpaperChange(next: WallpaperSettings): void {
    dispatch({ type: 'SET_SELECTED_WALLPAPER', value: next })
  }

  function handleWallpaperColorChange(nextColor: string): void {
    dispatch({ type: 'SET_SELECTED_WALLPAPER_COLOR', value: nextColor })
  }

  return (
    <div className="flex flex-col gap-3">
      <Tabs defaultValue="theme" className="w-full" keepMounted>
        <TabList>
          <Tab value="theme">Theme</Tab>
          <Tab value="wallpaper">Wallpaper</Tab>
          <Tab value="appearance">Appearance</Tab>
        </TabList>

        <ThemeTab
          selectedTheme={form.selectedTheme}
          onSelectedThemeChange={value => dispatch({ type: 'SET_SELECTED_THEME', value })}
          currentGradientEnabled={currentGradientEnabled}
        />

        <WallpaperTab
          selectedWallpaper={form.selectedWallpaper}
          onSelectedWallpaperChange={handleSelectedWallpaperChange}
          selectedWallpaperColor={form.selectedWallpaperColor}
          onWallpaperColorChange={handleWallpaperColorChange}
          customWallpapers={form.customWallpapers}
          onCustomWallpaperAdd={entry => dispatch({ type: 'ADD_CUSTOM_WALLPAPER', value: entry })}
        />

        <AppearanceTab
          currentCrtEnabled={currentCrtEnabled}
          onCrtEnabledChange={setCrtEnabled}
          currentCrtTuning={currentCrtTuning}
          onCrtTuningChange={setCrtTuning}
          currentGradientEnabled={currentGradientEnabled}
          onGradientEnabledChange={setGradientEnabled}
        />
      </Tabs>

      <div className="flex justify-end gap-(--grouped-button-spacing)">
        <Button onClick={handleOk} className="min-w-18.75">Apply and close</Button>
        <Button onClick={handleCancel} className="min-w-18.75">Cancel</Button>
        <Button
          onClick={applySettings}
          className="min-w-18.75"
          disabled={!hasPendingChanges}
        >
          Apply
        </Button>
      </div>
    </div>
  )
}
