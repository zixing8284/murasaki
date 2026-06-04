'use client'

import { Button, FieldPanel, themeIds, themeLabels, ThemeProvider, useTheme } from '@murasaky/react98'
import { useState } from 'react'
import { ThemePreview } from './theme-preview'

function ThemeControls(): React.ReactElement {
  const { themeId, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex flex-wrap gap-2">
        {themeIds.map(id => (
          <Button key={id} onClick={() => setTheme(id)} className={id === themeId ? 'shadow-(--shadow-border-inset)' : ''}>
            {themeLabels[id]}
          </Button>
        ))}
      </div>
      <ThemePreview themeId={themeId} />
    </div>
  )
}

export function ThemeProviderBasicDemo(): React.ReactElement {
  const [themeRoot, setThemeRoot] = useState<HTMLDivElement | null>(null)

  return (
    <div ref={setThemeRoot} className="w-96">
      <ThemeProvider defaultTheme="windows-98" storageKey={null} attributeTarget={themeRoot}>
        <FieldPanel>
          <ThemeControls />
        </FieldPanel>
      </ThemeProvider>
    </div>
  )
}
