import type { WallpaperImageEntry } from '../../../lib/wallpaper-storage'
import type { WallpaperMode, WallpaperSettings } from '../../../lib/wallpapers'
import { Button, FieldPanel, GroupBox, Select, TabPanel } from '@murasaki-io/react98'
import { useCallback, useEffect, useRef } from 'react'
import { useCustomWallpaperUrl } from '../../../hooks/use-custom-wallpaper-url'
import { assetPath } from '../../../lib/asset-path'
import {
  isCustomWallpaperId,
  isSupportedWallpaperImage,
  saveWallpaperImage,
} from '../../../lib/wallpaper-storage'
import {
  getWallpaperEntry,
  WALLPAPER_MODE_LABELS,
  WALLPAPERS,
} from '../../../lib/wallpapers'
import { WallpaperMonitor } from './wallpaper-monitor'

const WALLPAPER_LIST_ICON = '/icons/paint-file-16.png'

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

interface WallpaperTabProps {
  selectedWallpaper: WallpaperSettings
  onSelectedWallpaperChange: (value: WallpaperSettings) => void
  selectedDesktopBgColor: string
  onDesktopBgColorChange: (value: string) => void
  onDesktopBgColorInput: (value: string) => void
  selectedIconLabelBgColor: string
  onIconLabelBgColorChange: (value: string) => void
  onIconLabelBgColorInput: (value: string) => void
  customWallpapers: WallpaperImageEntry[]
  onCustomWallpaperAdd: (entry: WallpaperImageEntry) => void
}

export function WallpaperTab({
  selectedWallpaper,
  onSelectedWallpaperChange,
  selectedDesktopBgColor,
  onDesktopBgColorChange,
  onDesktopBgColorInput,
  selectedIconLabelBgColor,
  onIconLabelBgColorChange,
  onIconLabelBgColorInput,
  customWallpapers,
  onCustomWallpaperAdd,
}: WallpaperTabProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const desktopColorInputRef = useRef<HTMLInputElement>(null)
  const iconLabelColorInputRef = useRef<HTMLInputElement>(null)

  // Throttle onInput to 100ms to avoid excessive updates while dragging the color picker.
  const desktopBgTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const iconLabelBgTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const throttledDesktopBgInput = useCallback((value: string) => {
    clearTimeout(desktopBgTimerRef.current)
    desktopBgTimerRef.current = setTimeout(onDesktopBgColorInput, 100, value)
  }, [onDesktopBgColorInput])

  const throttledIconLabelBgInput = useCallback((value: string) => {
    clearTimeout(iconLabelBgTimerRef.current)
    iconLabelBgTimerRef.current = setTimeout(onIconLabelBgColorInput, 100, value)
  }, [onIconLabelBgColorInput])

  useEffect(() => {
    return () => {
      clearTimeout(desktopBgTimerRef.current)
      clearTimeout(iconLabelBgTimerRef.current)
    }
  }, [])

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

  function handleDesktopColorPickerOpen(): void {
    desktopColorInputRef.current?.click()
  }

  function handleIconLabelColorPickerOpen(): void {
    iconLabelColorInputRef.current?.click()
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
      const next: WallpaperSettings = { id: entry.id, mode: selectedWallpaper.mode }
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
        ref={desktopColorInputRef}
        type="color"
        className="sr-only"
        aria-label="Desktop background color"
        value={selectedDesktopBgColor}
        onInput={event => throttledDesktopBgInput(event.currentTarget.value)}
        onChange={event => onDesktopBgColorChange(event.currentTarget.value)}
      />
      <input
        ref={iconLabelColorInputRef}
        type="color"
        className="sr-only"
        aria-label="Icon label background color"
        value={selectedIconLabelBgColor}
        onInput={event => throttledIconLabelBgInput(event.currentTarget.value)}
        onChange={event => onIconLabelBgColorChange(event.currentTarget.value)}
      />

      <div className="flex justify-center py-1">
        <WallpaperMonitor
          wallpaperSrc={wallpaperPreviewSrc}
          wallpaperMode={selectedWallpaper.mode}
          screenColor={selectedDesktopBgColor}
        />
      </div>

      <GroupBox label="Wallpaper">
        <p className="mb-2 text-(--button-text)">Select a picture or pattern:</p>

        <div className="flex gap-3">
          <FieldPanel className="h-44 flex-2 min-w-0">
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
                    className={`flex min-w-full w-max cursor-pointer items-center gap-1 pl-2 pr-2 py-0.5 text-left ${
                      isSelected
                        ? 'relative border border-dotted border-(--hilight-text) bg-(--hilight) pt-0 pb-0 pr-px text-(--hilight-text)'
                        : 'text-(--window-text)'
                    }`}
                    onClick={() => {
                      const next: WallpaperSettings = { id: wp.id, mode: selectedWallpaper.mode }
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
                    className={`flex min-w-full w-max cursor-pointer items-center gap-1 pl-2 pr-2 py-0.5 text-left ${
                      isSelected
                        ? 'relative border border-dotted border-(--hilight-text) bg-(--hilight) pt-0 pb-0 pr-px text-(--hilight-text)'
                        : 'text-(--window-text)'
                    }`}
                    onClick={() => {
                      const next: WallpaperSettings = { id: wp.id, mode: selectedWallpaper.mode }
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

          <div className="flex h-44 flex-1 min-w-15 flex-col justify-between">
            <div className="flex flex-col gap-1">
              <Button className="w-full" onClick={handleBrowseClick}>
                Browse...
              </Button>
              <Button className="w-full" disabled>
                Pattern...
              </Button>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-(--button-text)" htmlFor="wallpaper-display">
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
                  { label: WALLPAPER_MODE_LABELS.fill, value: 'fill' },
                ]}
                value={selectedWallpaper.mode}
                onValueChange={(value) => {
                  const next: WallpaperSettings = { ...selectedWallpaper, mode: value as WallpaperMode }
                  onSelectedWallpaperChange(next)
                }}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-(--button-text)">Desktop color:</span>
              <button
                type="button"
                className="h-5 w-full cursor-pointer shadow-[inset_1px_1px_0_var(--button-shadow),inset_-1px_-1px_0_var(--button-hilight)]"
                style={{ backgroundColor: selectedDesktopBgColor }}
                onClick={handleDesktopColorPickerOpen}
                aria-label="Pick desktop background color"
                title="Desktop background color"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-(--button-text)">Icon label color:</span>
              <button
                type="button"
                className="h-5 w-full cursor-pointer shadow-[inset_1px_1px_0_var(--button-shadow),inset_-1px_-1px_0_var(--button-hilight)]"
                style={{ backgroundColor: selectedIconLabelBgColor }}
                onClick={handleIconLabelColorPickerOpen}
                aria-label="Pick icon label background color"
                title="Icon label background color"
              />
            </div>
          </div>
        </div>
      </GroupBox>
    </TabPanel>
  )
}
