import type { ThemeId } from 'murasaki-react98'
import type { ProcessComponentProps } from '../../contexts/process'
import {
  Button,
  DropdownNative,
  Tabs,
  themeIds,
  useTheme,
} from 'murasaki-react98'
import { useState } from 'react'
import { useProcessActions } from '../../contexts/process'
import { RndWindow } from '../window/rnd-window'

const themeLabels: Record<ThemeId, string> = {
  'windows-98': 'Windows 98',
  'solarized-dark': 'Solarized Dark',
}

// ---------------------------------------------------------------------------
// Theme Preview — mini Win98 desktop rendered with scoped data-theme
// ---------------------------------------------------------------------------

function ThemePreview({ themeId }: { themeId: ThemeId }): React.ReactElement {
  // The data-theme attribute on this div scopes the CSS variable overrides
  // to the preview area only, without affecting the rest of the app.
  return (
    <div
      className="relative h-[220px] overflow-hidden border border-btn-dk-shadow bg-desktop"
      data-theme={themeId === 'windows-98' ? undefined : themeId}
    >
      {/* Desktop icon */}
      <div className="absolute top-3 left-3 flex flex-col items-center gap-0.5">
        <img
          src="/img/desktop/RecyclingBin.png"
          alt="Trash"
          className="w-8 h-8 pixelated"
        />
        <span className="text-[10px] text-center text-desktop-text">
          Trash
        </span>
      </div>

      {/* Inactive window */}
      <div className="absolute top-[35px] left-[70px] w-[260px] shadow-raised bg-btn-face">
        <div className="h-[18px] flex items-center px-1 text-[10px] font-bold bg-linear-to-r from-title-inactive to-title-inactive-gradient text-title-inactive-text">
          <span>Inactive Window</span>
          <div className="ml-auto flex gap-px">
            <PreviewTitleButton />
            <PreviewTitleButton />
            <PreviewTitleButton />
          </div>
        </div>
      </div>

      {/* Active window */}
      <div className="absolute top-[60px] left-[110px] w-[260px] shadow-raised bg-btn-face">
        {/* Active title bar */}
        <div className="h-[18px] flex items-center px-1 text-[10px] font-bold bg-linear-to-r from-title-active to-title-active-gradient text-title-active-text">
          <span className="font-bold">Active Window</span>
          <div className="ml-auto flex gap-px">
            <PreviewTitleButton />
            <PreviewTitleButton />
            <PreviewTitleButton />
          </div>
        </div>

        {/* Menu bar */}
        <div className="h-[16px] flex items-center gap-2 px-1 text-[10px] bg-menu-bg text-menu-text">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Help</span>
        </div>

        {/* Content area with scrollbar */}
        <div className="p-0.5">
          <div className="h-[72px] flex border border-btn-shadow">
            <div className="flex-1 p-1 text-[10px] bg-window-bg text-window-text">
              Window Text
            </div>
            {/* Vertical scrollbar */}
            <div className="w-[14px] flex flex-col bg-scrollbar">
              <div className="h-[14px] shadow-raised bg-btn-face" />
              <div className="flex-1" />
              <div className="h-[14px] shadow-raised bg-btn-face" />
            </div>
          </div>
          {/* Horizontal scrollbar */}
          <div className="h-[14px] flex mt-px bg-scrollbar">
            <div className="w-[14px] shadow-raised bg-btn-face" />
            <div className="flex-1" />
            <div className="w-[14px] shadow-raised bg-btn-face" />
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-[24px] flex items-center px-0.5 shadow-raised bg-btn-face">
        <div className="h-[18px] px-1 flex items-center text-[10px] shadow-raised bg-btn-face text-btn-text">
          <span>Start</span>
        </div>
        <div className="flex-1" />
        <div className="h-[18px] px-2 flex items-center text-[10px] text-btn-text">
          12:56
        </div>
      </div>
    </div>
  )
}

function PreviewTitleButton(): React.ReactElement {
  return <div className="w-[14px] h-[14px] shadow-raised bg-btn-face" />
}

// ---------------------------------------------------------------------------
// Display Properties App
// ---------------------------------------------------------------------------

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
        <Tabs defaultValue="theme" className="w-full">
          <Tabs.List>
            <Tabs.Tab value="theme">Theme</Tabs.Tab>
            <Tabs.Tab value="wallpaper">Wallpaper</Tabs.Tab>
            <Tabs.Tab value="appearance">Appearance</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="theme" className="flex flex-col gap-2">
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
          </Tabs.Panel>

          <Tabs.Panel value="wallpaper">
            <p className="text-btn-text">Wallpaper settings are not available.</p>
          </Tabs.Panel>

          <Tabs.Panel value="appearance">
            <p className="text-btn-text">Appearance settings are not available.</p>
          </Tabs.Panel>
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
