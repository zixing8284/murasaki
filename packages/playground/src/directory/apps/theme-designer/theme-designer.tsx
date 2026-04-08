import type { ProcessComponentProps } from '../../../contexts/process'
import { FieldPanel } from 'murasaki-react98'
import { RndWindow } from '../../../shell/window/rnd-window'
import { ColorControls } from './color-controls'
import { FileControls } from './file-controls'
import { DesignerPreview } from './theme-preview'
import { useThemeColors } from './use-theme-colors'

export function ThemeDesigner({ windowId }: ProcessComponentProps): React.ReactElement | null {
  const state = useThemeColors()

  return (
    <RndWindow
      windowId={windowId}
      className="w-170 h-146   top-[8%] left-[12%]"
      disableMaximize
      disableResize
    >
      <div className="flex flex-col gap-1.5 h-full">
        {/* Main content: preview + controls */}
        <div className="flex gap-2 flex-1 min-h-0">
          {/* Left: Preview */}
          <div className="flex-1 min-w-0">
            <DesignerPreview colors={state.allColors} />
          </div>

          {/* Right: Color controls */}
          <FieldPanel className="w-44 shrink-0">
            <ColorControls state={state} />
          </FieldPanel>
        </div>

        {/* Bottom: File controls + attribution */}
        <div className="flex items-center justify-between border-t border-(--button-shadow) pt-1.5">
          <FileControls state={state} />
          <span className="text-(--gray-text)">
            Color derivation logic inspired by
            {' '}
            <a
              href="https://github.com/tpenguinltg/winclassic"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-(--hot-tracking-color)"
            >
              winclassic
            </a>
            {' '}by tPenguinLTG (MPL 2.0)
          </span>
        </div>
      </div>
    </RndWindow>
  )
}
