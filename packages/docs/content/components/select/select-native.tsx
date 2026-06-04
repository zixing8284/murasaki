'use client'

import { SelectNative } from '@murasaky/react98'

export function SelectNativeDemo(): React.ReactElement {
  return (
    <SelectNative name="size" label="Size:" defaultValue="medium">
      <option value="small">Small</option>
      <option value="medium">Medium</option>
      <option value="large">Large</option>
    </SelectNative>
  )
}
