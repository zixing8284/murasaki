import type { ThemeColorsState } from './use-theme-colors'
import { Button } from '@murasaki/react98'
import { useRef } from 'react'
import { downloadThemeFile, exportThemeFile, readFileAsText } from './theme-file'

interface FileControlsProps {
  state: ThemeColorsState
}

export function FileControls({ state }: FileControlsProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = (): void => {
    const content = exportThemeFile(state.allColors)
    downloadThemeFile(content, 'my-theme.theme')
  }

  const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file)
      return
    const content = await readFileAsText(file)
    state.loadFromThemeFile(content)
    // Reset file input so the same file can be loaded again
    if (fileInputRef.current)
      fileInputRef.current.value = ''
  }

  const handleLoadClick = (): void => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex items-center gap-(--grouped-button-spacing)">
      <Button onClick={handleLoadClick} className="min-w-18.75">
        Load Theme...
      </Button>
      <Button onClick={handleSave} className="min-w-18.75">
        Save Theme...
      </Button>
      <Button onClick={state.resetToDefaults} className="min-w-18.75">
        Reset
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".theme,.ini,.txt"
        onChange={handleLoad}
        className="hidden"
      />
    </div>
  )
}
