import type { ReactElement } from 'react'
import type { ProcessComponentProps } from '../../../contexts/process/types'
import {
  Button,
  WindowStatusBar,
  WindowStatusBarField,
} from '@murasaki-io/react98'
import { useEffect, useRef, useState } from 'react'
import { getFile, getName } from '../../../contexts/file-system'
import { useProcessActions, useProcessLaunch } from '../../../contexts/process/hooks'
import { InactiveClickGuard } from '../../../shell/window/inactive-click-guard'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export function PdfViewer({ windowId }: ProcessComponentProps): ReactElement {
  const launch = useProcessLaunch(windowId)
  const { title } = useProcessActions()
  const [currentPath, setCurrentPath] = useState<string | null>(launch?.path ?? null)
  const [localFileName, setLocalFileName] = useState<string | null>(null)
  const [resolvedPath, setResolvedPath] = useState<string | null>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const displayName = currentPath
    ? getName(currentPath)
    : (localFileName ?? 'PDF Viewer')
  const effectiveLoadState: LoadState = currentPath != null && resolvedPath !== currentPath
    ? 'loading'
    : loadState
  const effectiveSrc = resolvedPath === currentPath
    ? src
    : null

  const [lastNonce, setLastNonce] = useState(launch?.nonce)
  if (lastNonce !== launch?.nonce && launch?.path) {
    setLastNonce(launch.nonce)
    setCurrentPath(launch.path)
  }

  useEffect(() => {
    title(windowId, displayName === 'PDF Viewer'
      ? 'PDF Viewer'
      : `${displayName} - PDF Viewer`)
  }, [displayName, title, windowId])

  // Resolve the launched VFS file to an object URL for the native PDF plugin.
  useEffect(() => {
    if (!currentPath)
      return
    let active = true
    let objectUrl: string | null = null
    getFile(currentPath)
      .then((file) => {
        if (!active)
          return
        if (!file) {
          setLoadState('error')
          setResolvedPath(currentPath)
          return
        }
        objectUrl = URL.createObjectURL(file)
        setSrc(objectUrl)
        setLoadState('ready')
        setResolvedPath(currentPath)
      })
      .catch(() => {
        if (active) {
          setLoadState('error')
          setResolvedPath(currentPath)
        }
      })
    return () => {
      active = false
      if (objectUrl)
        URL.revokeObjectURL(objectUrl)
    }
  }, [currentPath])

  const handleOpenLocal = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file)
      return
    setSrc((previous) => {
      if (previous?.startsWith('blob:'))
        URL.revokeObjectURL(previous)
      return URL.createObjectURL(file)
    })
    setCurrentPath(null)
    setResolvedPath(null)
    setLocalFileName(file.name)
    setLoadState('ready')
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-(--surface) text-(--window-text)">
      <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" aria-label="Open PDF" onChange={handleOpenLocal} />

      <InactiveClickGuard windowId={windowId}>
        <div className="flex items-center gap-0.5 border-b border-(--button-shadow) bg-(--button-face) px-1 py-0.5">
          <Button flat className="px-2" onClick={() => fileInputRef.current?.click()}>Open…</Button>
        </div>
      </InactiveClickGuard>

      <div className="m-0.5 min-h-0 flex-1 bg-(--window) shadow-(--shadow-border-field)">
        {effectiveLoadState === 'ready' && effectiveSrc
          ? (
              <object data={effectiveSrc} type="application/pdf" className="size-full" aria-label={displayName}>
                <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                  <p>This document can't be displayed inline.</p>
                  <a href={effectiveSrc} download={displayName} className="underline">
                    Download
                    {displayName}
                  </a>
                </div>
              </object>
            )
          : (
              <div className="flex h-full items-center justify-center text-(--gray-text)">
                {effectiveLoadState === 'loading'
                  ? 'Opening document…'
                  : effectiveLoadState === 'error'
                    ? 'This document could not be opened.'
                    : 'No document loaded'}
              </div>
            )}
      </div>

      <WindowStatusBar>
        <WindowStatusBarField grow>{displayName}</WindowStatusBarField>
      </WindowStatusBar>
    </div>
  )
}
