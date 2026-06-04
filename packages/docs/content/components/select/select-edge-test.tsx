'use client'

import { Select } from '@murasaky/react98'
import { EdgeTestStage } from '../../../components/edge-test-stage'

const OPTIONS = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'bravo', label: 'Bravo' },
  { value: 'charlie', label: 'Charlie' },
  { value: 'delta', label: 'Delta' },
  { value: 'echo', label: 'Echo' },
  { value: 'foxtrot', label: 'Foxtrot' },
  { value: 'golf', label: 'Golf' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'india', label: 'India' },
  { value: 'juliet', label: 'Juliet' },
]

function SelectSlot({ id }: { id: string, label: string }): React.ReactElement {
  return (
    <Select
      name={`select-${id}`}
      options={OPTIONS}
      defaultValue="alpha"
      width={140}
      menuMaxHeight={160}
    />
  )
}

export function SelectEdgeTestDemo(): React.ReactElement {
  return (
    <EdgeTestStage
      height={420}
      SlotComponent={SelectSlot}
    />
  )
}
