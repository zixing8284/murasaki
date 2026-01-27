import { Checkbox } from '@/components/checkbox/checkbox'

import { GroupBox } from '../group-box'

export function Basic(): React.ReactElement {
  return (
    <GroupBox label="Settings">
      <div className="flex flex-col gap-2">
        <Checkbox name="demo-status">Show status bar</Checkbox>
        <Checkbox defaultChecked name="demo-toolbar">
          Show toolbar
        </Checkbox>
        <Checkbox name="demo-autosave">Enable auto-save</Checkbox>
      </div>
    </GroupBox>
  )
}
