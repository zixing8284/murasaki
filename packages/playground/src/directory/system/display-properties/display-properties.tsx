import type { ThemeId } from '@murasaki-io/react98'
import type { ProcessComponentProps } from '../../../contexts/process/types'
import type { WallpaperImageEntry } from '../../../lib/wallpaper-storage'
import type { WallpaperMode, WallpaperSettings } from '../../../lib/wallpapers'
import {
  Button,
  Checkbox,
  FieldPanel,
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
import { useEffect, useReducer, useRef } from 'react'
import { useProcessActions } from '../../../contexts/process/hooks'
import { useCrtEffect } from '../../../hooks/use-crt-effect'
import { areCrtTuningSettingsEqual, useCrtTuning } from '../../../hooks/use-crt-tuning'
import { useCustomWallpaperUrl } from '../../../hooks/use-custom-wallpaper-url'
import { useGradientTitlebar } from '../../../hooks/use-gradient-titlebar'
import { areWallpaperSettingsEqual, useWallpaper } from '../../../hooks/use-wallpaper'
import { useWallpaperColor } from '../../../hooks/use-wallpaper-color'
import { assetPath } from '../../../lib/asset-path'
import {
  isCustomWallpaperId,
  isSupportedWallpaperImage,
  listWallpaperImages,
  saveWallpaperImage,
} from '../../../lib/wallpaper-storage'
import {
  getWallpaperEntry,
  WALLPAPER_MODE_LABELS,
  WALLPAPERS,
} from '../../../lib/wallpapers'
import { ThemePreview } from './theme-preview'
import { WallpaperMonitor } from './wallpaper-monitor'

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

const WALLPAPER_LIST_ICON = '/icons/windows98-icons/png/paint_file-0.png'

function formatCustomWallpaperLabel(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const DISPLAY_MAX_CHARS = 24
  if (base.length <= DISPLAY_MAX_CHARS)
    return base

  return `${base.slice(0, DISPLAY_MAX_CHARS - 1).trimEnd()}…`
}

// ── Reducer for committed/selected state ────────────────────────────────────

interface FormState {
  selectedTheme: ThemeId
  committedCrtEnabled: boolean
  committedCrtTuning: { scanlineOpacity: number, jitterAmount: number, rollDuration: number, rollOpacity: number }
  committedGradientEnabled: boolean
  selectedWallpaper: WallpaperSettings
  committedWallpaper: WallpaperSettings
  committedWallpaperColor: string
  customWallpapers: WallpaperImageEntry[]
}

type FormAction
  = | { type: 'SET_SELECTED_THEME', value: ThemeId }
    | { type: 'SET_COMMITTED_CRT_ENABLED', value: boolean }
    | { type: 'SET_COMMITTED_CRT_TUNING', value: FormState['committedCrtTuning'] }
    | { type: 'SET_COMMITTED_GRADIENT_ENABLED', value: boolean }
    | { type: 'SET_SELECTED_WALLPAPER', value: WallpaperSettings }
    | { type: 'SET_COMMITTED_WALLPAPER', value: WallpaperSettings }
    | { type: 'SET_COMMITTED_WALLPAPER_COLOR', value: string }
    | { type: 'SET_CUSTOM_WALLPAPERS', value: WallpaperImageEntry[] }
    | { type: 'ADD_CUSTOM_WALLPAPER', value: WallpaperImageEntry }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_SELECTED_THEME':
      return { ...state, selectedTheme: action.value }
    case 'SET_COMMITTED_CRT_ENABLED':
      return { ...state, committedCrtEnabled: action.value }
    case 'SET_COMMITTED_CRT_TUNING':
      return { ...state, committedCrtTuning: action.value }
    case 'SET_COMMITTED_GRADIENT_ENABLED':
      return { ...state, committedGradientEnabled: action.value }
    case 'SET_SELECTED_WALLPAPER':
      return { ...state, selectedWallpaper: action.value }
    case 'SET_COMMITTED_WALLPAPER':
      return { ...state, committedWallpaper: action.value }
    case 'SET_COMMITTED_WALLPAPER_COLOR':
      return { ...state, committedWallpaperColor: action.value }
    case 'SET_CUSTOM_WALLPAPERS':
      return { ...state, customWallpapers: action.value }
    case 'ADD_CUSTOM_WALLPAPER':
      return { ...state, customWallpapers: [...state.customWallpapers, action.value] }
  }
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface ThemeTabProps {
  selectedTheme: ThemeId
  onSelectedThemeChange: (value: ThemeId) => void
  currentGradientEnabled: boolean
}

function ThemeTab({ selectedTheme, onSelectedThemeChange, currentGradientEnabled }: ThemeTabProps): React.ReactElement {
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

interface WallpaperTabProps {
  selectedWallpaper: WallpaperSettings
  onSelectedWallpaperChange: (value: WallpaperSettings) => void
  currentWallpaperColor: string
  onWallpaperColorChange: (value: string) => void
  customWallpapers: WallpaperImageEntry[]
  onCustomWallpaperAdd: (entry: WallpaperImageEntry) => void
}

function WallpaperTab({
  selectedWallpaper,
  onSelectedWallpaperChange,
  currentWallpaperColor,
  onWallpaperColorChange,
  customWallpapers,
  onCustomWallpaperAdd,
}: WallpaperTabProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const isNoneWallpaperSelected = selectedWallpaper.id === 'none'

  const selectedWallpaperEntry = getWallpaperEntry(selectedWallpaper.id)
  const customPreviewUrl = useCustomWallpaperUrl(selectedWallpaper.id)
  const wallpaperPreviewSrc = isCustomWallpaperId(selectedWallpaper.id)
    ? customPreviewUrl
    : selectedWallpaperEntry?.src
      ? assetPath(selectedWallpaperEntry.src)
      : null

  function handleBrowseClick(): void {
    fileInputRef.current?.click()
  }

  function handleColorPickerOpen(): void {
    colorInputRef.current?.click()
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    // Reset the input so the same file can be re-selected.
    event.target.value = ''
    if (!file || !isSupportedWallpaperImage(file))
      return

    try {
      const entry = await saveWallpaperImage(file)
      onCustomWallpaperAdd(entry)
      const next: WallpaperSettings = { id: entry.id, mode: 'stretch' }
      onSelectedWallpaperChange(next)
    }
    catch {
      // Silently ignore storage failures.
    }
  }

  return (
    <TabPanel value="wallpaper" className="flex flex-col gap-2 p-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Upload wallpaper image"
        onChange={e => void handleFileChange(e)}
      />
      <input
        ref={colorInputRef}
        type="color"
        className="sr-only"
        aria-label="Desktop color"
        value={currentWallpaperColor}
        onChange={event => onWallpaperColorChange(event.target.value)}
      />

      <div className="flex justify-center py-1">
        <WallpaperMonitor
          wallpaperSrc={wallpaperPreviewSrc}
          wallpaperMode={selectedWallpaper.mode}
          screenColor={isNoneWallpaperSelected ? currentWallpaperColor : '#008080'}
        />
      </div>

      <div className="relative border border-(--button-shadow) px-3 pb-3 pt-4">
        <span className="pointer-events-none absolute -top-2 left-3 bg-(--button-face) px-1 text-(--button-text)">
          Wallpaper
        </span>

        <p className="mb-2 text-(--button-text)">Select a picture or pattern:</p>

        <div className="grid grid-cols-[1fr_11rem] gap-x-3 gap-y-2">
          <FieldPanel className="h-44">
            <div
              id="wallpaper-list"
              role="listbox"
              aria-label="Wallpaper"
            >
              {WALLPAPERS.map((wp) => {
                const isSelected = selectedWallpaper.id === wp.id
                return (
                  <button
                    key={wp.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`flex w-full cursor-pointer items-center gap-1 px-2 py-0.5 text-left ${
                      isSelected
                        ? 'bg-(--hilight) text-(--hilight-text)'
                        : 'text-(--window-text)'
                    }`}
                    onClick={() => {
                      const next: WallpaperSettings = { id: wp.id, mode: wp.defaultMode }
                      onSelectedWallpaperChange(next)
                    }}
                  >
                    <img
                      src={assetPath(WALLPAPER_LIST_ICON)}
                      alt=""
                      className="size-4 shrink-0 pixelated"
                      draggable={false}
                    />
                    <span>{wp.label}</span>
                  </button>
                )
              })}

              {customWallpapers.map((wp) => {
                const isSelected = selectedWallpaper.id === wp.id
                return (
                  <button
                    key={wp.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`flex w-full cursor-pointer items-center gap-1 px-2 py-0.5 text-left ${
                      isSelected
                        ? 'bg-(--hilight) text-(--hilight-text)'
                        : 'text-(--window-text)'
                    }`}
                    onClick={() => {
                      const next: WallpaperSettings = { id: wp.id, mode: 'stretch' }
                      onSelectedWallpaperChange(next)
                    }}
                  >
                    <img
                      src={assetPath(WALLPAPER_LIST_ICON)}
                      alt=""
                      className="size-4 shrink-0 pixelated"
                      draggable={false}
                    />
                    <span title={wp.name}>{formatCustomWallpaperLabel(wp.name)}</span>
                  </button>
                )
              })}
            </div>
          </FieldPanel>

          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={handleBrowseClick}>
              Browse...
            </Button>
            <Button className="w-full" disabled>
              Pattern...
            </Button>

            <label className="mt-1 text-(--button-text)" htmlFor="wallpaper-display">
              Display:
            </label>
            <Select
              id="wallpaper-display"
              name="wallpaper-display"
              className="w-full"
              options={[
                { label: WALLPAPER_MODE_LABELS.centered, value: 'centered' },
                { label: WALLPAPER_MODE_LABELS.tiled, value: 'tiled' },
                { label: WALLPAPER_MODE_LABELS.stretch, value: 'stretch' },
              ]}
              value={selectedWallpaper.mode}
              onValueChange={(value) => {
                const next: WallpaperSettings = { ...selectedWallpaper, mode: value as WallpaperMode }
                onSelectedWallpaperChange(next)
              }}
            />

            <span className="mt-1 text-(--button-text)">Color:</span>
            <button
              type="button"
              className="min-h-[23px] w-full border border-(--button-shadow)"
              style={{ backgroundColor: currentWallpaperColor }}
              onClick={handleColorPickerOpen}
              aria-label={isNoneWallpaperSelected ? 'Pick desktop background color' : 'Pick desktop icon label background color'}
              title={isNoneWallpaperSelected
                ? 'Pick desktop background color (used when wallpaper is None)'
                : 'Pick desktop icon label background color (used when wallpaper is visible)'}
            />
          </div>
        </div>
      </div>
    </TabPanel>
  )
}

interface AppearanceTabProps {
  currentCrtEnabled: boolean
  onCrtEnabledChange: (value: boolean) => void
  currentCrtTuning: { scanlineOpacity: number, jitterAmount: number, rollDuration: number, rollOpacity: number }
  onCrtTuningChange: (value: AppearanceTabProps['currentCrtTuning']) => void
  currentGradientEnabled: boolean
  onGradientEnabledChange: (value: boolean) => void
}

function AppearanceTab({
  currentCrtEnabled,
  onCrtEnabledChange,
  currentCrtTuning,
  onCrtTuningChange,
  currentGradientEnabled,
  onGradientEnabledChange,
}: AppearanceTabProps): React.ReactElement {
  const crtTuningDisabled = !currentCrtEnabled

  return (
    <TabPanel value="appearance" className="flex flex-col gap-3 p-3">
      <Checkbox
        checked={currentCrtEnabled}
        onCheckedChange={onCrtEnabledChange}
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
                onClick={() => onCrtTuningChange(preset.settings)}
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
            onValueChange={value => onCrtTuningChange({ ...currentCrtTuning, scanlineOpacity: value })}
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
            onValueChange={value => onCrtTuningChange({ ...currentCrtTuning, jitterAmount: value })}
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
            onValueChange={value => onCrtTuningChange({ ...currentCrtTuning, rollDuration: value })}
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
            onValueChange={value => onCrtTuningChange({ ...currentCrtTuning, rollOpacity: value })}
          />
          <span className="w-8 text-right">{Math.round(currentCrtTuning.rollOpacity * 100)}</span>
        </label>
      </div>

      <Checkbox
        checked={currentGradientEnabled}
        onCheckedChange={onGradientEnabledChange}
      >
        Use gradient title bars
      </Checkbox>
    </TabPanel>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

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
    || currentWallpaperColor !== form.committedWallpaperColor

  const applySettings = (): void => {
    if (form.selectedTheme !== currentThemeId) {
      setTheme(form.selectedTheme)
    }
    // CRT/gradient/wallpaper are already live — just advance the committed baseline.
    dispatch({ type: 'SET_COMMITTED_CRT_ENABLED', value: currentCrtEnabled })
    dispatch({ type: 'SET_COMMITTED_CRT_TUNING', value: currentCrtTuning })
    dispatch({ type: 'SET_COMMITTED_GRADIENT_ENABLED', value: currentGradientEnabled })
    dispatch({ type: 'SET_COMMITTED_WALLPAPER', value: form.selectedWallpaper })
    dispatch({ type: 'SET_COMMITTED_WALLPAPER_COLOR', value: currentWallpaperColor })
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
    if (currentWallpaperColor !== form.committedWallpaperColor) {
      setWallpaperColor(form.committedWallpaperColor)
    }
    actions.close(windowId)
  }

  // Live-preview: wallpaper changes apply immediately on selection.
  function handleSelectedWallpaperChange(next: WallpaperSettings): void {
    dispatch({ type: 'SET_SELECTED_WALLPAPER', value: next })
    setWallpaper(next)
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
          currentWallpaperColor={currentWallpaperColor}
          onWallpaperColorChange={setWallpaperColor}
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
