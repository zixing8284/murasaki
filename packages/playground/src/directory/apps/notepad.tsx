import type { ReactElement } from 'react'
import type { ProcessComponentProps } from '../../contexts/process/types'
import {
  MenuItem,
  MenuSeparator,
  TextBox,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
} from '@murasaki-io/react98'
import { useEffect, useRef, useState } from 'react'
import { getFile, getName, useFileSystem } from '../../contexts/file-system'
import { useProcessActions, useProcessLaunch } from '../../contexts/process/hooks'
import { InactiveClickGuard } from '../../shell/window/inactive-click-guard'

export function Notepad({ windowId }: ProcessComponentProps): ReactElement {
  const launch = useProcessLaunch(windowId)
  const { title, close } = useProcessActions()
  const { saveTextFile } = useFileSystem()
  const [path, setPath] = useState<string | null>(launch?.path ?? null)
  const [localName, setLocalName] = useState('Untitled')
  const name = path
    ? getName(path)
    : localName
  const [text, setText] = useState('')
  const [dirty, setDirty] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [lastNonce, setLastNonce] = useState(launch?.nonce)
  if (lastNonce !== launch?.nonce && launch?.path) {
    setLastNonce(launch.nonce)
    setPath(launch.path)
  }

  // Load the launched VFS file's text.
  useEffect(() => {
    if (!path)
      return
    let active = true
    getFile(path)
      .then(file => file?.text() ?? '')
      .then((content) => {
        if (!active)
          return
        setText(content)
        setDirty(false)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [path])

  useEffect(() => {
    title(windowId, `${name} - Notepad`)
  }, [name, title, windowId])

  const newDocument = (): void => {
    setPath(null)
    setLocalName('Untitled')
    setText('')
    setDirty(false)
  }

  const openLocal = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file)
      return
    setPath(null)
    setLocalName(file.name)
    setDirty(false)
    void file.text().then(setText)
  }

  const save = (): void => {
    if (!path)
      return
    void saveTextFile(path, text).then(() => setDirty(false))
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-(--surface)">
      <input ref={fileInputRef} type="file" accept="text/*,.txt,.md,.log,.ini,.json,.csv,.xml,.bat,.cfg" className="hidden" aria-label="Open text file" onChange={openLocal} />

      <InactiveClickGuard windowId={windowId}>
        <WindowMenuBar>
          <WindowMenuBarMenu value="file">
            <WindowMenuBarTrigger>
              <span className="underline">F</span>
              ile
            </WindowMenuBarTrigger>
            <WindowMenuBarContent>
              <MenuItem reserveIconSpace onClick={newDocument}>New</MenuItem>
              <MenuItem reserveIconSpace onClick={() => fileInputRef.current?.click()}>Open…</MenuItem>
              <MenuItem reserveIconSpace disabled={!path || !dirty} onClick={save}>Save</MenuItem>
              <MenuSeparator />
              <MenuItem reserveIconSpace onClick={() => close(windowId)}>Close</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
        </WindowMenuBar>
      </InactiveClickGuard>

      <div className="min-h-0 flex-1 p-0.5">
        <TextBox
          multiline
          id="notepad-textarea"
          aria-label="Notepad text area"
          placeholder="Type here..."
          className="size-full"
          value={text}
          onValueChange={(value) => {
            setText(value)
            setDirty(true)
          }}
        />
      </div>
    </div>
  )
}
