'use client'

import { Button, Tooltip } from '@murasaki/react98'
import { EdgeTestStage } from '../../../components/edge-test-stage'

const TOOLTIP_TEXT = 'C:\\Windows\\Start Menu\\Programs\\Accessories\\System Tools'

export function TooltipEdgeTestDemo(): React.ReactElement {
  return (
    <EdgeTestStage
      renderSlot={({ id, label }) => (
        <Tooltip key={id} text={TOOLTIP_TEXT} side="bottom" delay={100}>
          <Button className="min-w-9">{label}</Button>
        </Tooltip>
      )}
    />
  )
}
