'use client'

import { ProgressIndicator } from '@murasaki/react98'

export function ProgressIndicatorBasicDemo(): React.ReactElement {
  return (
    <div className="flex w-72 flex-col gap-3">
      <ProgressIndicator value={42} />
      <ProgressIndicator value={72} variant="tile" hideValue />
      <ProgressIndicator value={100} shadow={false} />
    </div>
  )
}
