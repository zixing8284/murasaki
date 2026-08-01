import type { ReactElement } from 'react'
import type { ProcessComponentProps } from '../../contexts/process/types'
import {
  Button,
  Divider,
  MenuItem,
  TextBox,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
  WindowStatusBar,
  WindowStatusBarField,
} from '@murasaki-io/react98'
import { useState } from 'react'
import { useProcessActions } from '../../contexts/process/hooks'
import { assetPath } from '../../lib/asset-path'
import { InactiveClickGuard } from '../../shell/window/inactive-click-guard'
import { DialogWindow } from '../shared/dialog-window'

const DEFAULT_TO = 'zixing8284@gmail.com'

function AboutDialog({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <DialogWindow title="About Outlook Express" onClose={onClose}>
      <div className="flex flex-col items-center gap-3 p-4 w-64">
        <img
          src={assetPath('/icons/outlook-express-16.png')}
          alt=""
          className="size-12 pixelated"
          draggable={false}
        />
        <div className="text-center">
          <p className="font-bold">Outlook Express</p>
          <p className="mt-1">Version 1.0</p>
          <p className="mt-0.5 text-(--gray-text)">murasaki edition</p>
        </div>
        <Divider className="w-full" />
        <Button className="px-6" onClick={onClose}>Close</Button>
      </div>
    </DialogWindow>
  )
}

function MenuLabel({ menu }: { menu: string }): ReactElement {
  const [accelerator = '', ...rest] = menu

  return (
    <>
      <span className="underline">{accelerator}</span>
      {rest.join('')}
    </>
  )
}

export function OutlookExpress({ windowId }: ProcessComponentProps): ReactElement {
  const { close } = useProcessActions()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showAbout, setShowAbout] = useState(false)

  const handleSend = (): void => {
    const params = new URLSearchParams()
    if (subject)
      params.set('subject', subject)
    if (body)
      params.set('body', body)

    const queryString = params.toString()
    const mailtoUrl = `mailto:${DEFAULT_TO}${queryString ? `?${queryString}` : ''}`

    window.open(mailtoUrl, '_blank')
  }

  const handleNew = (): void => {
    setSubject('')
    setBody('')
  }

  const handleWindowClose = (): void => {
    close(windowId)
  }

  return (
    <div className="relative flex h-full flex-col">
      <InactiveClickGuard windowId={windowId} className="shrink-0">
        <WindowMenuBar className="h-5">
          <WindowMenuBarMenu value="file">
            <WindowMenuBarTrigger><MenuLabel menu="File" /></WindowMenuBarTrigger>
            <WindowMenuBarContent className="w-36">
              <MenuItem reserveIconSpace onClick={handleNew}>New</MenuItem>
              <MenuItem reserveIconSpace onClick={handleWindowClose}>Close</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="help">
            <WindowMenuBarTrigger><MenuLabel menu="Help" /></WindowMenuBarTrigger>
            <WindowMenuBarContent className="w-48">
              <MenuItem reserveIconSpace onClick={() => setShowAbout(true)}>About Outlook Express</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
        </WindowMenuBar>
      </InactiveClickGuard>

      <Divider />

      <div className="flex flex-col gap-1 bg-(--button-face) p-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-12 text-right text-(--window-text) shrink-0">To:</span>
          <TextBox
            type="email"
            value={DEFAULT_TO}
            readOnly
            aria-label="To"
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 text-right text-(--window-text) shrink-0">Subject:</span>
          <TextBox
            type="text"
            value={subject}
            onValueChange={setSubject}
            placeholder="(no subject)"
            aria-label="Subject"
            className="flex-1"
          />
        </div>
      </div>

      <Divider />

      <div className="flex-1 min-h-0 bg-(--button-face) p-1">
        <TextBox
          multiline
          value={body}
          onValueChange={setBody}
          placeholder="Write your message here..."
          aria-label="Message body"
          className="size-full"
        />
      </div>

      <Divider />

      <div className="flex items-center justify-end gap-1 bg-(--button-face) px-2 py-1.5 shrink-0">
        <Button className="px-4" onClick={handleSend}>Send</Button>
      </div>

      <WindowStatusBar className="shrink-0 pt-1">
        <WindowStatusBarField className="truncate">
          {subject ? `Subject: ${subject}` : 'Ready'}
        </WindowStatusBarField>
      </WindowStatusBar>

      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
    </div>
  )
}
