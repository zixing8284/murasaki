import type { ProcessComponentProps } from '../../../contexts/process/types'
import { Button, Checkbox, Tab, TabList, TabPanel, Tabs } from '@murasaki-io/react98'
import { useState } from 'react'
import { useProcessActions } from '../../../contexts/process/hooks'
import { useTaskbarSettings } from '../../../contexts/taskbar-settings'
import { assetPath } from '../../../lib/asset-path'
import { TASKBAR_SETTINGS_PREVIEW } from '../../../lib/playground-assets'

/** Static Windows 98 Taskbar Properties preview, matching win99.dev. */
function TaskbarPreview(): React.ReactElement {
  return (
    <div className="flex bg-(--window) p-0.5 shadow-(--shadow-border-field)">
      <img
        src={assetPath(TASKBAR_SETTINGS_PREVIEW)}
        alt="Taskbar preview"
        width="100%"
        height="auto"
        className="pixelated"
        draggable={false}
      />
    </div>
  )
}

export function TaskbarProperties({ windowId }: ProcessComponentProps): React.ReactElement {
  const { close } = useProcessActions()
  const { smallStartIcons, setSmallStartIcons } = useTaskbarSettings()

  const [draftSmall, setDraftSmall] = useState(smallStartIcons)
  const [appliedSmall, setAppliedSmall] = useState(smallStartIcons)
  const hasPendingChanges = draftSmall !== appliedSmall

  const handleApply = (): void => {
    setSmallStartIcons(draftSmall)
    setAppliedSmall(draftSmall)
  }

  const handleOk = (): void => {
    if (hasPendingChanges)
      handleApply()
    close(windowId)
  }

  const handleCancel = (): void => {
    close(windowId)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Tabs defaultValue="options" className="flex min-h-0 w-full flex-1 flex-col">
        <TabList>
          <Tab value="options">Taskbar Options</Tab>
        </TabList>

        <TabPanel value="options" className="flex min-h-0 flex-1 flex-col gap-4 p-3">
          <TaskbarPreview />

          <div className="flex flex-col gap-2">
            <Checkbox checked disabled>Always on top</Checkbox>
            <Checkbox disabled>Auto hide</Checkbox>
            <Checkbox
              checked={draftSmall}
              onCheckedChange={setDraftSmall}
            >
              Show small icons in Start menu
            </Checkbox>
            <Checkbox disabled>Show Clock</Checkbox>
          </div>
        </TabPanel>
      </Tabs>

      <div className="flex justify-end gap-(--grouped-button-spacing)">
        <Button onClick={handleOk} className="min-w-18.75">OK</Button>
        <Button onClick={handleCancel} className="min-w-18.75">Cancel</Button>
        <Button onClick={handleApply} disabled={!hasPendingChanges} className="min-w-18.75">Apply</Button>
      </div>
    </div>
  )
}
