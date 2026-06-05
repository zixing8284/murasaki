'use client'

import { Divider } from '@murasaki-io/react98'

export function DividerBasicDemo(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3 text-(--button-text) w-64">
      <div>General settings</div>
      <Divider />
      <div className="flex h-12 items-stretch gap-3">
        <span>Left pane</span>
        <Divider orientation="vertical" />
        <span>Right pane</span>
      </div>
    </div>
  )
}
