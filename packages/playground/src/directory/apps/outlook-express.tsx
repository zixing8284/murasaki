import type { ReactElement } from 'react'
import type { ProcessComponentProps } from '../../contexts/process'
import {
  Button,
  Divider,
  MenuItem,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
  WindowStatusBar,
  WindowStatusBarField,
} from '@murasaki/react98'
import { useCallback, useState } from 'react'
import { useProcessActions } from '../../contexts/process'
import { InactiveClickGuard } from '../../shell/window/inactive-click-guard'

const DEFAULT_TO = 'zixing8284@gmail.com'

function renderMenuLabel(menu: string): ReactElement {
  const [accelerator = '', ...rest] = menu

  return (
    <>
      <span className="underline">{accelerator}</span>
      {rest.join('')}
    </>
  )
}

function AboutDialog({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-72 bg-(--button-face) shadow-(--shadow-raised)">
        <div className="flex items-center justify-between bg-(--active-title) px-2 py-0.5">
          <span className="text-(--title-text) font-bold">About Outlook Express</span>
          <Button className="leading-none p-0" onClick={onClose}>
            &times;
          </Button>
        </div>
        <div className="flex flex-col items-center gap-3 p-4">
          <img
            src="/icons/windows98-icons/png/outlook_express-2.png"
            alt=""
            className="size-12 pixelated"
            draggable={false}
          />
          <div className="text-center text-(--window-text)">
            <p className="font-bold">Outlook Express</p>
            <p className="mt-1">Version 1.0</p>
            <p className="mt-0.5 text-(--gray-text)">murasaki edition</p>
          </div>
          <Divider className="w-full" />
          <Button className="px-6" onClick={onClose}>OK</Button>
        </div>
      </div>
    </div>
  )
}

export function OutlookExpress({ windowId }: ProcessComponentProps): ReactElement {
  const { close } = useProcessActions()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showAbout, setShowAbout] = useState(false)

  const handleSend = useCallback(() => {
    const params = new URLSearchParams()
    if (subject)
      params.set('subject', subject)
    if (body)
      params.set('body', body)

    const queryString = params.toString()
    const mailtoUrl = `mailto:${DEFAULT_TO}${queryString ? `?${queryString}` : ''}`

    window.open(mailtoUrl, '_blank')
  }, [subject, body])

  const handleNew = useCallback(() => {
    setSubject('')
    setBody('')
  }, [])

  const handleClose = useCallback(() => {
    close(windowId)
  }, [close, windowId])

  return (
    <div className="relative flex h-full flex-col">
      <InactiveClickGuard windowId={windowId} className="shrink-0">
        <WindowMenuBar className="h-5">
          <WindowMenuBarMenu value="file">
            <WindowMenuBarTrigger>{renderMenuLabel('File')}</WindowMenuBarTrigger>
            <WindowMenuBarContent className="w-36">
              <MenuItem reserveIconSpace onClick={handleNew}>New</MenuItem>
              <MenuItem reserveIconSpace onClick={handleClose}>Close</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
          <WindowMenuBarMenu value="help">
            <WindowMenuBarTrigger>{renderMenuLabel('Help')}</WindowMenuBarTrigger>
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
          <input
            type="email"
            value={DEFAULT_TO}
            readOnly
            className="flex-1 h-5 border-none bg-(--button-face) px-1.5 text-(--gray-text) shadow-(--shadow-border-field) outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 text-right text-(--window-text) shrink-0">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="(no subject)"
            className="flex-1 h-5 border-none bg-(--window) px-1.5 text-(--window-text) shadow-(--shadow-border-field) outline-none"
          />
        </div>
      </div>

      <Divider />

      <div className="flex-1 min-h-0 bg-(--button-face) p-1">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your message here..."
          className="h-full w-full resize-none border-none bg-(--window) p-1.5 text-(--window-text) shadow-(--shadow-border-field) outline-none"
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
