import { Button } from '#/components/button/button'

import { useState } from 'react'

import { Window } from '../window'

export function LargeContent(): React.ReactElement {
  const [showWindow, setShowWindow] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        Window with large content demonstrates the scrollbar behavior.
      </p>
      <Button
        onClick={() => {
          setShowWindow(v => !v)
        }}
      >
        {showWindow ? 'Close Window' : 'Open Large Content Window'}
      </Button>
      {showWindow && (
        <Window
          draggable
          onClose={() => {
            setShowWindow(false)
          }}
          title="Large Content Window"
        >
          <div className="break-line">{generateLargeContent(20)}</div>
        </Window>
      )}
    </div>
  )
}

/**
 * Generates a large content string for demonstrating scrollbar behavior.
 * @param paragraphs - Number of paragraphs to generate
 * @returns A formatted string with numbered paragraphs
 */
function generateLargeContent(paragraphs = 20): string {
  const lines: string[] = []

  for (let i = 1; i <= paragraphs; i++) {
    lines.push(
      `[${String(i)}] Lorem ipsum dolor sit amet, consectetur adipiscing elit. `
      + `Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. `
      + `Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
    )
  }

  return lines.join('\n\n')
}
