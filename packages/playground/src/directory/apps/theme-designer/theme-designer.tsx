import type { ThemeId } from '@murasaky/react98'
import type { ThemeSchemeSelection } from './use-theme-colors'
import { FieldPanel, Select, themeIds, themeLabels } from '@murasaky/react98'
import { ColorControls } from './color-controls'
import { FileControls } from './file-controls'
import { DesignerPreview } from './theme-preview'
import { useThemeColors } from './use-theme-colors'

const schemeOptions = [
  { label: 'Custom', value: 'custom' as const },
  ...themeIds.map(id => ({
    label: themeLabels[id],
    value: id,
  })),
]

export function ThemeDesigner(): React.ReactElement {
  const state = useThemeColors()

  return (
    <div className="flex flex-col gap-1.5 h-full py-1">
      <div className="flex items-center gap-1 px-1">
        <label className="text-(--button-text)" htmlFor="classic-theme-scheme">
          Scheme:
        </label>
        <Select<ThemeSchemeSelection>
          id="classic-theme-scheme"
          name="classic-theme-scheme"
          className="w-48"
          options={schemeOptions}
          value={state.currentSchemeId}
          onValueChange={(value) => {
            if (value !== 'custom')
              state.loadBuiltInScheme(value as ThemeId)
          }}
        />
      </div>

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
