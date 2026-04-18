import type { ReactNode } from 'react'
import type { DesktopFileLaunchRequest } from './context'
import type { DesktopMediaFileEntry } from './storage'
import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { DesktopFilesContext } from './context'
import {
  getDesktopMediaFile,
  isSupportedDesktopMediaFile,
  listDesktopMediaFiles,
  requestPersistentStorage,
  saveDesktopMediaFile,
} from './storage'

export function DesktopFilesProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [items, setItems] = useState<DesktopMediaFileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [launchRequest, setLaunchRequest] = useState<DesktopFileLaunchRequest | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        await requestPersistentStorage()
        const nextItems = await listDesktopMediaFiles()
        if (!active) {
          return
        }

        setLoading(false)
        startTransition(() => {
          setItems(nextItems)
        })
      }
      catch {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const importFiles = useCallback(async (incomingFiles: Iterable<File>) => {
    const allFiles = Array.from(incomingFiles)
    if (allFiles.length === 0) {
      return []
    }

    const acceptedFiles: File[] = []
    const rejectedFiles: File[] = []

    for (const file of allFiles) {
      if (isSupportedDesktopMediaFile(file)) {
        acceptedFiles.push(file)
      }
      else {
        rejectedFiles.push(file)
      }
    }

    if (acceptedFiles.length === 0) {
      const rejectedNames = rejectedFiles.map(file => file.name).join(', ')
      throw new Error(`No supported files were provided. Rejected ${rejectedFiles.length} file(s): ${rejectedNames}.`)
    }

    if (rejectedFiles.length > 0) {
      const rejectedNames = rejectedFiles.map(file => file.name).join(', ')
      console.warn(`Imported ${acceptedFiles.length} supported file(s) and rejected ${rejectedFiles.length} unsupported file(s): ${rejectedNames}.`)
    }

    await requestPersistentStorage()

    const createdItems = await Promise.all(acceptedFiles.map(saveDesktopMediaFile))

    startTransition(() => {
      setItems(prev => [...prev, ...createdItems])
    })

    return createdItems
  }, [])

  const getFile = useCallback((id: string) => getDesktopMediaFile(id), [])

  const requestOpenInMediaPlayer = useCallback((fileId: string) => {
    setLaunchRequest(prev => ({
      nonce: (prev?.nonce ?? 0) + 1,
      fileId,
    }))
  }, [])

  const clearLaunchRequest = useCallback(() => {
    setLaunchRequest(null)
  }, [])

  const value = useMemo(() => ({
    items,
    loading,
    importFiles,
    getFile,
    requestOpenInMediaPlayer,
    launchRequest,
    clearLaunchRequest,
  }), [items, loading, importFiles, getFile, requestOpenInMediaPlayer, launchRequest, clearLaunchRequest])

  return (
    <DesktopFilesContext value={value}>
      {children}
    </DesktopFilesContext>
  )
}
