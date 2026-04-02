import { TextBox } from 'murasaki-react98'
import * as React from 'react'

export default function DemoTextBoxBasic(): React.ReactElement {
  const [value, setValue] = React.useState('Hello, world!')
  return (
    <div className="flex flex-col gap-2 w-64">
      <TextBox value={value} onChange={e => setValue(e.target.value)} />
      <div className="text-xs text-(--window-text)">
        Value:
        {value}
      </div>
    </div>
  )
}
