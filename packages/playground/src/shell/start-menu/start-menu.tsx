import type { RefObject } from 'react'
import {
  Menu,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
} from '@murasaki/react98'
import { useEffect, useLayoutEffect, useState } from 'react'
import { APP_ID } from '../../contexts/process/directory'
import { useProcessActions } from '../../contexts/process/hooks'

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
}

function StartIcon({ src }: StartIconProps): React.ReactElement {
  return (
    <img
      src={src}
      alt=""
      className="w-4 h-4 pixelated"
      draggable={false}
    />
  )
}

const ICON = {
  windowsUpdate: '/icons/windows98-icons/ico/windows_update_small.ico',
  programs: '/img/startmenu/Programs.png',
  documents: '/img/startmenu/Documents.png',
  settings: '/img/startmenu/Settings.png',
  find: '/img/startmenu/Find.png',
  help: '/img/startmenu/Help.png',
  run: '/img/startmenu/Run.png',
  logOff: '/img/startmenu/LogOff.png',
  shutDown: '/img/startmenu/ShutDown.png',
  // programs submenu
  accessories: '/icons/windows98-icons/ico/directory_program_group.ico',
  notepad: '/icons/windows98-icons/ico/notepad.ico',
  calculator: '/icons/windows98-icons/ico/calculator.ico',
  paint: '/icons/windows98-icons/ico/paint.ico',
  internetExplorer: '/icons/windows98-icons/ico/msie2.ico',
  myComputer: '/icons/windows98-icons/ico/computer.ico',
  mediaPlayer: '/icons/windows98-icons/ico/media_player.ico',
  webamp: '/img/desktop/Webamp16.png',
  themeDesigner: '/icons/windows98-icons/ico/themes.ico',
  // settings submenu
  controlPanel: '/icons/windows98-icons/ico/directory_control_panel.ico',
  printers: '/icons/windows98-icons/ico/printer.ico',
  taskbar: '/icons/windows98-icons/ico/start_menu_shortcuts.ico',
  // find submenu
  findFiles: '/icons/windows98-icons/ico/search_file.ico',
  findComputer: '/icons/windows98-icons/ico/search_computer.ico',
  findWeb: '/icons/windows98-icons/ico/search_web.ico',
} as const

export function StartMenu({ onClose, anchorRef, screenRef }: StartMenuProps): React.ReactElement {
  const { open } = useProcessActions()
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
        onClick={onClose}
      />

      {/* Menu panel */}
      <div className="absolute bottom-7.5 left-0 z-247">
        <div className="min-h-25 w-50 flex flex-row items-stretch">
          {/* Stripe */}
          <div className="bg-linear-to-b from-(--active-title) to-(--gradient-active-title) w-5.25 min-h-fit flex flex-col justify-end pb-4 shadow-(--shadow-raised)">
            <span className="text-(--title-text) -rotate-90 origin-center whitespace-nowrap text-xs">
              @murasaki/react98
            </span>
          </div>

          {/* Menu Items */}
          <Menu className="flex-1" maxHeight={maxHeight}>
            <MenuItem icon={<StartIcon src={ICON.windowsUpdate} />}>
              Windows Update
            </MenuItem>
            <MenuSeparator />
            <MenuSub>
              <MenuSubTrigger icon={<StartIcon src={ICON.programs} />}>
                Programs
              </MenuSubTrigger>
              <MenuSubContent boundaryRef={screenRef}>
                <MenuSub>
                  <MenuSubTrigger icon={<StartIcon src={ICON.accessories} />}>
                    Accessories
                  </MenuSubTrigger>
                  <MenuSubContent boundaryRef={screenRef}>
                    <MenuItem
                      icon={<StartIcon src={ICON.notepad} />}
                      onClick={() => launch(APP_ID.NOTEPAD)}
                    >
                      Notepad
                    </MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.calculator} />} disabled>Calculator</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.paint} />} disabled>Paint</MenuItem>
                    <MenuSeparator />
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Accessibility</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Address Book</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Backup</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>CD Player</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>CharMap</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Clipboard Viewer</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Command Prompt</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Defragmenter</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Disk Cleanup</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Drive Converter</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>HyperTerminal</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Magnifier</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Media Player</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>MousePoint</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Narrator</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>NetMeeting</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>On-Screen Keyboard</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Phone Dialer</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Program Compatibility</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Resource Monitor</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Scheduled Tasks</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>ScanDisk</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Sound Recorder</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>System Information</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>System Monitor</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Task Scheduler</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Telnet Client</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Volume Control</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>Windows Explorer</MenuItem>
                    <MenuItem icon={<StartIcon src={ICON.notepad} />} disabled>WordPad</MenuItem>
                  </MenuSubContent>
                </MenuSub>
                <MenuSeparator />
                <MenuItem icon={<StartIcon src={ICON.internetExplorer} />} disabled>Internet Explorer</MenuItem>
                <MenuItem
                  icon={<StartIcon src={ICON.myComputer} />}
                  onClick={() => launch(APP_ID.MY_COMPUTER)}
                >
                  My Computer
                </MenuItem>
                <MenuItem
                  icon={<StartIcon src={ICON.mediaPlayer} />}
                  onClick={() => launch(APP_ID.MEDIA_PLAYER)}
                >
                  Media Player
                </MenuItem>
                <MenuItem
                  icon={<StartIcon src={ICON.webamp} />}
                  onClick={() => launch(APP_ID.WEBAMP)}
                >
                  Webamp
                </MenuItem>
                <MenuItem
                  icon={<StartIcon src={ICON.themeDesigner} />}
                  onClick={() => launch(APP_ID.THEME_DESIGNER)}
                >
                  Theme Designer
                </MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuSub>
              <MenuSubTrigger icon={<StartIcon src={ICON.documents} />}>
                Documents
              </MenuSubTrigger>
              <MenuSubContent boundaryRef={screenRef}>
                <MenuItem reserveIconSpace disabled>(Empty)</MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuSub>
              <MenuSubTrigger icon={<StartIcon src={ICON.settings} />}>
                Settings
              </MenuSubTrigger>
              <MenuSubContent boundaryRef={screenRef}>
                <MenuItem icon={<StartIcon src={ICON.controlPanel} />} disabled>Control Panel</MenuItem>
                <MenuItem icon={<StartIcon src={ICON.printers} />} disabled>Printers</MenuItem>
                <MenuItem icon={<StartIcon src={ICON.taskbar} />} disabled>Taskbar...</MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuSub>
              <MenuSubTrigger icon={<StartIcon src={ICON.find} />}>
                Find
              </MenuSubTrigger>
              <MenuSubContent boundaryRef={screenRef}>
                <MenuItem icon={<StartIcon src={ICON.findFiles} />} disabled>Files or Folders...</MenuItem>
                <MenuItem icon={<StartIcon src={ICON.findComputer} />} disabled>Computer...</MenuItem>
                <MenuItem icon={<StartIcon src={ICON.findWeb} />} disabled>On the Internet...</MenuItem>
              </MenuSubContent>
            </MenuSub>
            <MenuItem icon={<StartIcon src={ICON.help} />} disabled>
              Help
            </MenuItem>
            <MenuItem icon={<StartIcon src={ICON.run} />} disabled>
              Run...
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon={<StartIcon src={ICON.logOff} />} disabled>
              Log Off Guest...
            </MenuItem>
            <MenuItem icon={<StartIcon src={ICON.shutDown} />} disabled>
              Shut Down...
            </MenuItem>
          </Menu>
        </div>
      </div>
    </>
  )
}
