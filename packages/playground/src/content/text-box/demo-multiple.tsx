import { TextBox } from 'murasaki-react98'
import { useState } from 'react'

export default function DemoTextBoxMultiple(): React.ReactElement {
  const [value, setValue] = useState('Multiline\nText!')
  return (
    <div className="flex flex-col gap-2 w-64">
      <TextBox value={value} onChange={e => setValue(e.target.value)} multiline rows={4} />
      <div className="text-xs text-(--window-text)">
        Value:
        {value.replace(/\n/g, '⏎ ')}
      </div>
    </div>
  )
}
