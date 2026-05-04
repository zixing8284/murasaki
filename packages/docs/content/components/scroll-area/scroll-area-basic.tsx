'use client'

import { ScrollArea } from 'murasaki-react98'

const rows = Array.from({ length: 18 }, (_, index) => `Item ${String(index + 1).padStart(2, '0')}`)

export function ScrollAreaBasicDemo(): React.ReactElement {
  return (
    <ScrollArea className="h-32 w-64 bg-(--window) shadow-(--shadow-border-field)">
      <ul className="m-0 list-none p-1.5">
        {rows.map(row => (
          <li key={row} className="px-1.5 py-0.5 hover:bg-(--hilight) hover:text-(--hilight-text)">
            {row}
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
