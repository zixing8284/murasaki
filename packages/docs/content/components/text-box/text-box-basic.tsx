'use client'

import { TextBox } from '@murasaki/react98'
import { useState } from 'react'

export function TextBoxBasicDemo(): React.ReactElement {
  const [name, setName] = useState('Murasaki')

  return (
    <div className="flex flex-col gap-3">
      <TextBox label="Name" value={name} onChange={event => setName(event.target.value)} />
      <TextBox label="Notes" labelPosition="top" multiline rows={4} defaultValue="Pixel text needs breathing room." className="h-24 w-72" />
      <TextBox label="Read only" defaultValue="SYSTEM" readOnly />
    </div>
  )
}
