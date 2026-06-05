'use client'

import { FieldPanel } from '@murasaki-io/react98'

export function FieldPanelSunkenDemo(): React.ReactElement {
  return (
    <FieldPanel variant="sunken" className="h-24 w-72">
      <div className="p-2 text-(--window-text)">
        <p className="m-0">Output</p>
        <p className="m-0">The operation completed successfully.</p>
      </div>
    </FieldPanel>
  )
}
