'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@murasaki-io/react98'
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
    <Select name={`select-${id}`} defaultValue="alpha">
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent maxHeight={160}>
        {OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
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
