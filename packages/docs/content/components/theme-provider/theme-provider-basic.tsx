'use client'

import { Button, FieldPanel, ThemeProvider, useTheme } from '@murasaki/react98'
import { useState } from 'react'

function ThemeControls(): React.ReactElement {
  const { themeId, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-2 p-2">
      <div>
        Active theme:
        {themeId}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setTheme('windows-98')}>Windows 98</Button>
        <Button onClick={() => setTheme('solarized-dark')}>Solarized</Button>
      </div>
    </div>
  )
}

export function ThemeProviderBasicDemo(): React.ReactElement {
  const [themeRoot, setThemeRoot] = useState<HTMLDivElement | null>(null)

  return (
    <div ref={setThemeRoot} className="w-80">
      <ThemeProvider defaultTheme="windows-98" storageKey={null} attributeTarget={themeRoot}>
        <FieldPanel>
          <ThemeControls />
        </FieldPanel>
      </ThemeProvider>
    </div>
  )
}
