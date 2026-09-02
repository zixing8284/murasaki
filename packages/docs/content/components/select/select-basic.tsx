'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@murasaki-io/react98'

export function SelectBasicDemo(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 260 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label htmlFor="select-color">Color:</label>
        <Select name="color" defaultValue="red">
          <SelectTrigger id="select-color" className="w-[180px]">
            <SelectValue placeholder="Select a color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="red">Red</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="blue">Blue</SelectItem>
            <SelectItem value="yellow">Yellow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label htmlFor="select-disabled">Disabled:</label>
        <Select name="disabled-example" defaultValue="none" disabled>
          <SelectTrigger id="select-disabled" className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No options</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
