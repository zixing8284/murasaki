import type { DesktopMediaFileEntry } from './storage'
import { createContext } from 'react'

export interface DesktopFileLaunchRequest {
  nonce: number
  fileId: string
}

export interface DesktopFilesContextValue {
  items: DesktopMediaFileEntry[]
  loading: boolean
  importFiles: (files: Iterable<File>) => Promise<DesktopMediaFileEntry[]>
  getFile: (id: string) => Promise<File | null>
  requestOpenInMediaPlayer: (fileId: string) => void
  launchRequest: DesktopFileLaunchRequest | null
  clearLaunchRequest: () => void
}

export const DesktopFilesContext = createContext<DesktopFilesContextValue | null>(null)
