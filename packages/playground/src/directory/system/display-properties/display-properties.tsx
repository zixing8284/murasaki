import type { ThemeId } from '@murasaki-io/react98'
import type { ProcessComponentProps } from '../../../contexts/process/types'
import type { WallpaperImageEntry } from '../../../lib/wallpaper-storage'
import type { WallpaperMode, WallpaperSettings } from '../../../lib/wallpapers'
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
import { useCallback, useEffect, useRef, useState } from 'react'
import { useProcessActions } from '../../../contexts/process/hooks'
import { useCrtEffect } from '../../../hooks/use-crt-effect'
import { areCrtTuningSettingsEqual, useCrtTuning } from '../../../hooks/use-crt-tuning'
import { useCustomWallpaperUrl } from '../../../hooks/use-custom-wallpaper-url'
import { useGradientTitlebar } from '../../../hooks/use-gradient-titlebar'
import { areWallpaperSettingsEqual, useWallpaper } from '../../../hooks/use-wallpaper'
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

const WALLPAPER_MONITOR_FRAME = '/img/wallpaper-monitor-frame.svg'
const WALLPAPER_LIST_ICON = '/img/display_16.png'
const WALLPAPER_MONITOR_SCREEN = {
  left: 43,
  top: 34,
  width: 124,
  height: 94,
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
  const [currentWallpaper, setWallpaper] = useWallpaper()
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperSettings>(currentWallpaper)
  const [committedWallpaper, setCommittedWallpaper] = useState(currentWallpaper)
  const crtTuningDisabled = !currentCrtEnabled
  const selectedWallpaperEntry = getWallpaperEntry(selectedWallpaper.id)
  const customPreviewUrl = useCustomWallpaperUrl(selectedWallpaper.id)
  const wallpaperPreviewSrc = isCustomWallpaperId(selectedWallpaper.id)
    ? customPreviewUrl
    : selectedWallpaperEntry?.src
      ? assetPath(selectedWallpaperEntry.src)
      : null

  const [customWallpapers, setCustomWallpapers] = useState<WallpaperImageEntry[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    listWallpaperImages()
      .then((entries) => {
        if (active)
          setCustomWallpapers(entries)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // CRT/gradient are applied immediately for live preview; only theme is deferred.
  const hasPendingChanges = selectedTheme !== currentThemeId
    || currentCrtEnabled !== committedCrtEnabled
    || !areCrtTuningSettingsEqual(currentCrtTuning, committedCrtTuning)
    || currentGradientEnabled !== committedGradientEnabled
    || !areWallpaperSettingsEqual(selectedWallpaper, committedWallpaper)

  const applySettings = (): void => {
    if (selectedTheme !== currentThemeId) {
      setTheme(selectedTheme)
    }
    // CRT/gradient/wallpaper are already live — just advance the committed baseline.
    setCommittedCrtEnabled(currentCrtEnabled)
    setCommittedCrtTuning(currentCrtTuning)
    setCommittedGradientEnabled(currentGradientEnabled)
    setCommittedWallpaper(selectedWallpaper)
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
    if (!areWallpaperSettingsEqual(selectedWallpaper, committedWallpaper)) {
      setWallpaper(committedWallpaper)
    }
    actions.close(windowId)
  }

  const handleBrowseClick = useCallback((): void => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    // Reset the input so the same file can be re-selected.
    event.target.value = ''
    if (!file || !isSupportedWallpaperImage(file))
      return

    try {
      const entry = await saveWallpaperImage(file)
      setCustomWallpapers(prev => [...prev, entry])
      const next: WallpaperSettings = { id: entry.id, mode: 'stretch' }
      setSelectedWallpaper(next)
      setWallpaper(next)
    }
    catch {
      // Silently ignore storage failures.
    }
  }, [setWallpaper])

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

        <TabPanel value="wallpaper" className="flex flex-col gap-2 p-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => void handleFileChange(e)}
          />

          <div className="flex justify-center py-1">
            <div className="relative h-[181px] w-[183px] shrink-0">
              <div
                className="absolute overflow-hidden bg-[#008080]"
                style={{
                  left: WALLPAPER_MONITOR_SCREEN.left,
                  top: WALLPAPER_MONITOR_SCREEN.top,
                  width: WALLPAPER_MONITOR_SCREEN.width,
                  height: WALLPAPER_MONITOR_SCREEN.height,
                }}
              >
                {wallpaperPreviewSrc
                  ? selectedWallpaper.mode === 'tiled'
                    ? (
                        <div
                          className="size-full bg-repeat bg-left-top"
                          style={{ backgroundImage: `url(${wallpaperPreviewSrc})` }}
                        />
                      )
                    : selectedWallpaper.mode === 'centered'
                      ? (
                          <div className="flex size-full items-center justify-center">
                            <img
                              src={wallpaperPreviewSrc}
                              alt="Wallpaper preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )
                      : (
                          <img
                            src={wallpaperPreviewSrc}
                            alt="Wallpaper preview"
                            className="size-full object-cover"
                          />
                        )
                  : null}
              </div>
              <img
                src={assetPath(WALLPAPER_MONITOR_FRAME)}
                alt=""
                className="absolute inset-0 size-full pointer-events-none select-none pixelated"
                draggable={false}
              />
            </div>
          </div>

          <div className="relative border border-(--button-shadow) px-3 pb-3 pt-4">
            <span className="pointer-events-none absolute -top-2 left-3 bg-(--button-face) px-1 text-(--button-text)">
              Wallpaper
            </span>

            <p className="mb-2 text-(--button-text)">Select a picture or pattern:</p>

            <div className="grid grid-cols-[1fr_11rem] gap-x-3 gap-y-2">
              <div
                id="wallpaper-list"
                role="listbox"
                aria-label="Wallpaper"
                className="h-44 overflow-y-auto border border-(--button-shadow) bg-(--window)"
              >
                {WALLPAPERS.map((wp) => {
                  const isSelected = selectedWallpaper.id === wp.id
                  return (
                    <div
                      key={wp.id}
                      role="option"
                      aria-selected={isSelected}
                      className={`flex cursor-pointer items-center gap-1 px-2 py-0.5 ${
                        isSelected
                          ? 'bg-(--hilight) text-(--hilight-text)'
                          : 'text-(--window-text)'
                      }`}
                      onClick={() => {
                        const next: WallpaperSettings = { id: wp.id, mode: wp.defaultMode }
                        setSelectedWallpaper(next)
                        setWallpaper(next)
                      }}
                    >
                      <img
                        src={assetPath(WALLPAPER_LIST_ICON)}
                        alt=""
                        className="size-4 shrink-0 pixelated"
                        draggable={false}
                      />
                      <span>{wp.label}</span>
                    </div>
                  )
                })}

                {customWallpapers.map((wp) => {
                  const isSelected = selectedWallpaper.id === wp.id
                  return (
                    <div
                      key={wp.id}
                      role="option"
                      aria-selected={isSelected}
                      className={`flex cursor-pointer items-center gap-1 px-2 py-0.5 ${
                        isSelected
                          ? 'bg-(--hilight) text-(--hilight-text)'
                          : 'text-(--window-text)'
                      }`}
                      onClick={() => {
                        const next: WallpaperSettings = { id: wp.id, mode: 'stretch' }
                        setSelectedWallpaper(next)
                        setWallpaper(next)
                      }}
                    >
                      <img
                        src={assetPath(WALLPAPER_LIST_ICON)}
                        alt=""
                        className="size-4 shrink-0 pixelated"
                        draggable={false}
                      />
                      <span>{wp.name}</span>
                    </div>
                  )
                })}
              </div>

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
                    setSelectedWallpaper(next)
                    setWallpaper(next)
                  }}
                />

                <span className="mt-1 text-(--button-text)">Color:</span>
                <div className="h-7 w-full border border-(--button-shadow) bg-[#008080]" />
              </div>
            </div>
          </div>
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
