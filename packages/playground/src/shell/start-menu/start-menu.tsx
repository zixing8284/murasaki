import type { RefObject } from 'react'
import {
  Menu,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from '@murasaki-io/react98'
import { useEffect, useLayoutEffect, useState } from 'react'
import { APP_ID } from '../../contexts/process/directory'
import { useProcessActions } from '../../contexts/process/hooks'
import { useTaskbarSettings } from '../../contexts/taskbar-settings'
import { assetPath } from '../../lib/asset-path'
import { START_MENU_ICONS } from '../../lib/playground-assets'

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
  src: string
  /** Render at the large (32px) top-level size. Submenu rows stay 16px. */
  large?: boolean
}

function StartIcon({ src, large = false }: StartIconProps): React.ReactElement {
  return (
    <img
      src={assetPath(src)}
      alt=""
      className={`${large ? 'size-8' : 'size-4'} pixelated`}
      draggable={false}
    />
  )
}

const ICON = START_MENU_ICONS

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
                    <MenuItem onClick={() => launch(APP_ID.NOTEPAD)}>
                      <StartIcon src={ICON.notepad} />
                      Notepad
                    </MenuItem>
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
                <MenuItem onClick={() => launch(APP_ID.INTERNET_EXPLORER)}>
                  <StartIcon src={ICON.internetExplorer} />
                  Internet Explorer
                </MenuItem>
                <MenuItem onClick={() => launch(APP_ID.WELCOME)}>
                  <StartIcon src={ICON.welcome} />
                  Welcome!
                </MenuItem>
                <MenuItem onClick={() => launch(APP_ID.MEDIA_PLAYER)}>
                  <StartIcon src={ICON.mediaPlayer} />
                  Media Player
                </MenuItem>
                <MenuItem onClick={() => launch(APP_ID.WEBAMP)}>
                  <StartIcon src={ICON.webamp} />
                  Webamp
                </MenuItem>
                <MenuItem onClick={() => launch(APP_ID.THEME_DESIGNER)}>
                  <StartIcon src={ICON.themeDesigner} />
                  Theme Designer
                </MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuSub>
              <MenuSubTrigger>
                <StartIcon src={ICON.documents} large={bigTop} />
                Documents
              </MenuSubTrigger>
              <MenuSubContent boundaryRef={screenRef}>
                <MenuItem onClick={() => launch(APP_ID.MY_DOCUMENTS)}>
                  <StartIcon src={ICON.documents} />
                  My Documents
                </MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuSub>
              <MenuSubTrigger>
                <StartIcon src={ICON.settings} large={bigTop} />
                Settings
              </MenuSubTrigger>
              <MenuSubContent boundaryRef={screenRef}>
                <MenuItem onClick={() => launch(APP_ID.SETTINGS)}>
                  <StartIcon src={ICON.controlPanel} />
                  Control Panel
                </MenuItem>
                <MenuItem onClick={() => launch(APP_ID.MOUSE_PROPERTIES)}>
                  <StartIcon src={ICON.mouse} />
                  Mouse…
                </MenuItem>
                <MenuItem disabled>
                  <StartIcon src={ICON.printers} />
                  Printers
                </MenuItem>
                <MenuItem onClick={() => launch(APP_ID.TASKBAR_PROPERTIES)}>
                  <StartIcon src={ICON.taskbar} />
                  Taskbar…
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
