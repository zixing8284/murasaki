'use client'

import { Label, TextBox } from '@murasaki-io/react98'

export function LabelBasicDemo(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 260 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Label htmlFor="label-demo-user">User name</Label>
        <TextBox id="label-demo-user" defaultValue="Guest" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Label htmlFor="label-demo-domain" disabled>Domain (unavailable)</Label>
        <TextBox id="label-demo-domain" defaultValue="WORKGROUP" disabled />
      </div>
    </div>
  )
}
