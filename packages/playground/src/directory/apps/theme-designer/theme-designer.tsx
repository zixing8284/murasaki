import { FieldPanel } from 'murasaki-react98'
import { ColorControls } from './color-controls'
import { FileControls } from './file-controls'
import { DesignerPreview } from './theme-preview'
import { useThemeColors } from './use-theme-colors'

export function ThemeDesigner(): React.ReactElement {
  const state = useThemeColors()

  return (
    <div className="flex flex-col gap-1.5 h-full">
      <div className="flex gap-2 flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          <DesignerPreview colors={state.allColors} />
        </div>

        <FieldPanel className="w-44 shrink-0">
          <ColorControls state={state} />
        </FieldPanel>
      </div>

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
          {' '}
          by tPenguinLTG (MPL 2.0)
        </span>
      </div>
    </div>
  )
}
