import type { RefObject } from 'react'
import type { IconAsset } from '../../lib/icons'
import {
  Menu,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from '@murasaki-io/react98'
import { useEffect, useLayoutEffect, useState } from 'react'
import { getStartMenuApps, preloadApp } from '../../contexts/process/directory'
import { useProcessActions } from '../../contexts/process/hooks'
import { useTaskbarSettings } from '../../contexts/taskbar-settings'
import { assetPath } from '../../lib/asset-path'
import { ICON as ICONS } from '../../lib/icons'

interface StartMenuProps {
  onClose: () => void
  /**
   * Start button used to anchor the menu vertically. The menu's max-height
   * is derived from the gap between the screen top and this anchor so the
   * menu never extends past the screen edge — instead engaging the
   * `<Menu maxHeight>` scroll-arrow steppers when too tall.
   */
  anchorRef: RefObject<HTMLElement | null>
  /** Shell screen area containing both desktop and taskbar, excluding the browser viewport frame. */
  screenRef: RefObject<HTMLElement | null>
}

interface StartIconProps {
  /** Icon asset carrying both the 16px and 32px art. */
  src: IconAsset
  /** Render at the large (32px) top-level size. Submenu rows stay 16px. */
  large?: boolean
}

function StartIcon({ src, large = false }: StartIconProps): React.ReactElement {
  return (
    <img
      src={assetPath(large ? src.lg : src.sm)}
      alt=""
      className={`${large ? 'size-8' : 'size-4'} pixelated`}
      draggable={false}
    />
  )
}

/**
 * Icons for the Start menu's decorative "not installed" rows (stock Windows 98
 * entries kept for flavor). Real, launchable rows draw their icon straight from
 * the app registry via `getStartMenuApps`, so they never appear here.
 */
const ICON = {
  windowsUpdate: ICONS.windowsUpdate,
  programs: ICONS.programGroup,
  documents: ICONS.folderMyDocs,
  settings: ICONS.settings,
  find: ICONS.searchFile,
  help: ICONS.help,
  run: ICONS.consolePrompt,
  logOff: ICONS.logOff,
  shutDown: ICONS.shutDown,
  accessories: ICONS.programGroup,
  notepad: ICONS.notepad,
  calculator: ICONS.calculator,
  paint: ICONS.paint,
  printers: ICONS.printer,
  findFiles: ICONS.searchFile,
  findComputer: ICONS.searchComputer,
  findWeb: ICONS.searchWeb,
} as const

// Real, launchable rows are derived from the app registry — installing an app
// (declaring a `startMenu` placement) makes it appear here automatically.
const PROGRAMS = getStartMenuApps('programs')
const ACCESSORIES = getStartMenuApps('accessories')
const DOCUMENTS = getStartMenuApps('documents')
const SETTINGS = getStartMenuApps('settings')

export function StartMenu({ onClose, anchorRef, screenRef }: StartMenuProps): React.ReactElement {
  const { open } = useProcessActions()
  const { smallStartIcons } = useTaskbarSettings()
  const bigTop = !smallStartIcons
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)

  // Measure usable height between the viewport top and the Start button's
  // top edge so a tall start menu engages `<Menu maxHeight>` scroll-arrows
  // instead of being silently clipped by the desktop edge.
  useLayoutEffect(() => {
    const measure = (): void => {
      const anchor = anchorRef.current
      const screen = screenRef.current
      if (!anchor || !screen)
        return
      const rect = anchor.getBoundingClientRect()
      const screenRect = screen.getBoundingClientRect()
      // 4px padding mirrors `useLayer`'s default collisionPadding.
      const next = Math.max(0, rect.top - screenRect.top - 4)
      setMaxHeight(prev => (prev === next ? prev : next))
    }
    // Defer the initial measure off the effect's synchronous body so the
    // setState lands in a separate frame from mount.
    const rafId = window.requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [anchorRef, screenRef])

  // Close on Escape — outside-pointer close is handled by the overlay below.
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape')
        onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const launch = (appId: string): void => {
    open(appId as Parameters<typeof open>[0])
    onClose()
  }

  return (
    <>
      {/* Overlay to close menu on outside click */}
      <div
        className="absolute inset-0 z-246"
        role="presentation"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Menu panel */}
      <div className="absolute bottom-7.5 left-0 z-247">
        <div className="min-h-25 w-50 flex flex-row items-stretch">
          {/* Stripe */}
          <div className="bg-linear-to-b from-(--active-title) to-(--gradient-active-title) w-5.25 min-h-fit flex flex-col justify-end pb-4 shadow-(--shadow-raised)">
            <span className="text-(--title-text) -rotate-90 origin-center whitespace-nowrap text-xs">
              @murasaki-io/react98
            </span>
          </div>

          {/* Menu Items */}
          <Menu className="flex-1" maxHeight={maxHeight}>
            <MenuItem>
              <StartIcon src={ICON.windowsUpdate} large={bigTop} />
              Windows Update
            </MenuItem>
            <MenuSeparator />
            <MenuSub>
              <MenuSubTrigger>
                <StartIcon src={ICON.programs} large={bigTop} />
                Programs
              </MenuSubTrigger>
              <MenuSubContent boundaryRef={screenRef}>
                <MenuSub>
                  <MenuSubTrigger>
                    <StartIcon src={ICON.accessories} />
                    Accessories
                  </MenuSubTrigger>
                  <MenuSubContent boundaryRef={screenRef}>
                    {ACCESSORIES.map(app => (
                      <MenuItem key={app.appId} onClick={() => launch(app.appId)} onPointerEnter={() => preloadApp(app.appId)}>
                        <StartIcon src={app.icon} />
                        {app.label}
                      </MenuItem>
                    ))}
                    <MenuItem disabled>
                      <StartIcon src={ICON.calculator} />
                      Calculator
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.paint} />
                      Paint
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Accessibility
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Address Book
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Backup
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      CD Player
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      CharMap
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Clipboard Viewer
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Command Prompt
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Defragmenter
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Disk Cleanup
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Drive Converter
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      HyperTerminal
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Magnifier
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Media Player
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      MousePoint
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Narrator
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      NetMeeting
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      On-Screen Keyboard
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Phone Dialer
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Program Compatibility
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Resource Monitor
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Scheduled Tasks
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      ScanDisk
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Sound Recorder
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      System Information
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      System Monitor
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Task Scheduler
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Telnet Client
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Volume Control
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      Windows Explorer
                    </MenuItem>
                    <MenuItem disabled>
                      <StartIcon src={ICON.notepad} />
                      WordPad
                    </MenuItem>
                  </MenuSubContent>
                </MenuSub>
                <MenuSeparator />
                {PROGRAMS.map(app => (
                  <MenuItem key={app.appId} onClick={() => launch(app.appId)} onPointerEnter={() => preloadApp(app.appId)}>
                    <StartIcon src={app.icon} />
                    {app.label}
                  </MenuItem>
                ))}
              </MenuSubContent>
            </MenuSub>
            <MenuSub>
              <MenuSubTrigger>
                <StartIcon src={ICON.documents} large={bigTop} />
                Documents
              </MenuSubTrigger>
              <MenuSubContent boundaryRef={screenRef}>
                {DOCUMENTS.map(app => (
                  <MenuItem key={app.appId} onClick={() => launch(app.appId)} onPointerEnter={() => preloadApp(app.appId)}>
                    <StartIcon src={app.icon} />
                    {app.label}
                  </MenuItem>
                ))}
              </MenuSubContent>
            </MenuSub>
            <MenuSub>
              <MenuSubTrigger>
                <StartIcon src={ICON.settings} large={bigTop} />
                Settings
              </MenuSubTrigger>
              <MenuSubContent boundaryRef={screenRef}>
                {SETTINGS.map(app => (
                  <MenuItem key={app.appId} onClick={() => launch(app.appId)} onPointerEnter={() => preloadApp(app.appId)}>
                    <StartIcon src={app.icon} />
                    {app.label}
                  </MenuItem>
                ))}
                <MenuItem disabled>
                  <StartIcon src={ICON.printers} />
                  Printers
                </MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuSub>
              <MenuSubTrigger>
                <StartIcon src={ICON.find} large={bigTop} />
                Find
              </MenuSubTrigger>
              <MenuSubContent boundaryRef={screenRef}>
                <MenuItem disabled>
                  <StartIcon src={ICON.findFiles} />
                  Files or Folders…
                </MenuItem>
                <MenuItem disabled>
                  <StartIcon src={ICON.findComputer} />
                  Computer…
                </MenuItem>
                <MenuItem disabled>
                  <StartIcon src={ICON.findWeb} />
                  On the Internet…
                </MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuItem disabled>
              <StartIcon src={ICON.help} large={bigTop} />
              Help
            </MenuItem>
            <MenuItem disabled>
              <StartIcon src={ICON.run} large={bigTop} />
              Run…
            </MenuItem>
            <MenuSeparator />
            <MenuItem disabled>
              <StartIcon src={ICON.logOff} large={bigTop} />
              Log Off Guest…
            </MenuItem>
            <MenuItem disabled>
              <StartIcon src={ICON.shutDown} large={bigTop} />
              Shut Down…
            </MenuItem>
          </Menu>
        </div>
      </div>
    </>
  )
}
