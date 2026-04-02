import { TextBox } from 'murasaki-react98'
import { useState } from 'react'

const LONG_TEXT = `The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump!
The five boxing wizards jump quickly.
Sphinx of black quartz, judge my vow.
Two driven jocks help fax my big quiz.
Crazy Frederick bought many very exquisite opal jewels.
We promptly judged antique ivory buckles for the next prize.
A mad boxer shot a quick, gloved jab to the jaw of his dizzy opponent.
The job requires extra pluck and zeal from every young wage earner.`

export default function DemoTextBoxMultiple(): React.ReactElement {
  const [value, setValue] = useState(LONG_TEXT)
  return (
    <div className="flex flex-col gap-2 w-64">
      <TextBox value={value} onChange={e => setValue(e.target.value)} multiline rows={5} />
      <div className="text-xs text-(--window-text)">
        Value:
        {value.replace(/\n/g, '⏎ ')}
      </div>
    </div>
  )
}
