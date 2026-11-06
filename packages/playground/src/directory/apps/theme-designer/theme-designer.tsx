import type { ThemeId } from '@murasaki-io/react98'
import { FieldPanel, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, themeIds, themeLabels } from '@murasaki-io/react98'
import { ColorControls } from './color-controls'
import { FileControls } from './file-controls'
import { DesignerPreview } from './theme-preview'
import { useThemeColors } from './use-theme-colors'

export function ThemeDesigner(): React.ReactElement {
  const state = useThemeColors()

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden py-1">
      <div className="flex items-center gap-1 px-1">
        <label className="shrink-0 whitespace-nowrap text-(--button-text)" htmlFor="classic-theme-scheme">
          Scheme:
        </label>
        <Select
          name="classic-theme-scheme"
          value={state.currentSchemeId}
          onValueChange={(value) => {
            if (value !== 'custom')
              state.loadBuiltInScheme(value as ThemeId)
          }}
        >
          <SelectTrigger id="classic-theme-scheme" className="w-full min-w-0 flex-1 md:w-48 md:flex-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom</SelectItem>
            {themeIds.map(id => (
              <SelectItem key={id} value={id}>{themeLabels[id]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 md:flex-row">
        <div className="h-[30%] min-h-32 min-w-0 flex-none md:h-auto md:flex-1">
          <DesignerPreview colors={state.allColors} />
        </div>

        <FieldPanel className="min-h-0 w-full flex-1 overflow-y-auto md:w-44 md:flex-none md:overflow-visible">
          <ColorControls state={state} />
        </FieldPanel>
      </div>

      <div className="flex flex-col items-stretch gap-1 border-t border-(--button-shadow) pt-1.5 md:flex-row md:items-center md:justify-between">
        <FileControls state={state} />
        <span className="hidden text-(--gray-text) md:inline">
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
