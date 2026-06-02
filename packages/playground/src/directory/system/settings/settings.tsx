import type { ProcessComponentProps } from '../../../contexts/process'
import { Button, GroupBox, Tab, TabList, TabPanel, Tabs } from '@murasaki/react98'
import { useState } from 'react'
import { useProcessActions } from '../../../contexts/process'
import { assetPath } from '../../../lib/asset-path'
import { didResetComplete, resetPlaygroundData } from '../../../lib/persistence'

const CLEAR_CACHE_ICON = '/icons/windows98-icons/png/directory_open_file_mydocs-0.png'
const WARNING_ICON = '/icons/windows98-icons/png/no-0.png'
const BACKUP_ICON = '/icons/windows98-icons/png/printer_diskette-0.png'

function CacheIcon(): React.ReactElement {
  return (
    <span className="relative block h-8 w-10 shrink-0">
      <img
        src={assetPath(CLEAR_CACHE_ICON)}
        alt=""
        className="absolute left-0 top-0 h-8 w-8 pixelated"
        draggable={false}
      />
      <img
        src={assetPath(WARNING_ICON)}
        alt=""
        className="absolute bottom-0 right-0 h-4 w-4 pixelated"
        draggable={false}
      />
    </span>
  )
}

function BackupIcon(): React.ReactElement {
  return (
    <img
      src={assetPath(BACKUP_ICON)}
      alt=""
      className="h-8 w-8 shrink-0 pixelated"
      draggable={false}
    />
  )
}

function resetResultMessage(complete: boolean): string {
  return complete
    ? 'Cache cleared. Restarting Windows...'
    : 'Stored preferences were cleared. Some browser cache data could not be removed; restarting Windows...'
}

export function Settings({ windowId }: ProcessComponentProps): React.ReactElement {
  const actions = useProcessActions()
  const [clearing, setClearing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const handleClearCache = async (): Promise<void> => {
    if (clearing)
      return

    setConfirming(false)
    setClearing(true)
    setStatus('Clearing cache and stored data...')
    const result = await resetPlaygroundData()
    const complete = didResetComplete(result)
    setStatus(resetResultMessage(complete))
    window.setTimeout(() => window.location.reload(), 500)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Tabs defaultValue="cache" className="min-h-0 w-full flex-1">
        <TabList>
          <Tab value="about" disabled>About</Tab>
          <Tab value="terms" disabled>Terms</Tab>
          <Tab value="display" disabled>Display</Tab>
          <Tab value="permissions" disabled>Permissions</Tab>
          <Tab value="cache">Cache</Tab>
        </TabList>

        <TabPanel value="cache" className="flex min-h-0 flex-1 flex-col gap-4 p-3">
          <div className="space-y-2 text-(--button-text)">
            <p>Manage Murasaki cache and stored data.</p>
            <p>Clearing cache will remove all customizations and reload the system.</p>
          </div>

          <GroupBox label="Clear Cache & Data" className="px-3 pb-3 pt-2">
            <div className="flex gap-3">
              <CacheIcon />
              <div className="min-w-0 flex-1 space-y-1 text-(--button-text)">
                <p>Clear all browser cache and application data.</p>
                <p>This will remove stored preferences and reload the OS.</p>
                <p className="font-bold">Warning: This process cannot be undone.</p>
                {confirming && <p className="pt-1 font-bold">Click Confirm to clear stored data.</p>}
                {status && <p className="pt-1 text-(--button-text)">{status}</p>}
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              {confirming
                ? (
                    <div className="flex gap-(--grouped-button-spacing)">
                      <Button onClick={() => void handleClearCache()} disabled={clearing} className="min-w-20">Confirm</Button>
                      <Button onClick={() => setConfirming(false)} disabled={clearing} className="min-w-20">Cancel</Button>
                    </div>
                  )
                : (
                    <Button onClick={() => setConfirming(true)} disabled={clearing} className="min-w-20">
                      {clearing ? 'Clearing...' : 'Clear Cache'}
                    </Button>
                  )}
            </div>
          </GroupBox>

          <GroupBox label="Backup" className="px-3 pb-3 pt-2">
            <div className="flex gap-3">
              <BackupIcon />
              <div className="min-w-0 flex-1 space-y-1 text-(--button-text)">
                <p>Save or restore your Windows session data.</p>
                <p>Backup export is not available in this build.</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-(--grouped-button-spacing)">
              <Button disabled className="min-w-20">Backup</Button>
              <Button disabled className="min-w-20">Restore</Button>
            </div>
          </GroupBox>
        </TabPanel>
      </Tabs>

      <div className="flex justify-end gap-(--grouped-button-spacing)">
        <Button onClick={() => actions.close(windowId)} className="min-w-18.75">Close settings</Button>
        <Button onClick={() => actions.close(windowId)} className="min-w-18.75">Cancel</Button>
      </div>
    </div>
  )
}
