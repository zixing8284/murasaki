import type { CreateFileOptions, VfsNode } from './types'
import { createContext } from 'react'

export interface FileSystemContextValue {
  /** True until the starter tree has been seeded. */
  loading: boolean
  /** Bumped on every mutation so views can re-fetch. */
  revision: number
  createFolder: (parentPath: string, desiredName?: string) => Promise<VfsNode>
  createFile: (parentPath: string, options: CreateFileOptions) => Promise<VfsNode>
  importFiles: (
    parentPath: string,
    files: File[],
    onProgress?: (completed: number, total: number) => void,
  ) => Promise<VfsNode[]>
  remove: (path: string) => Promise<void>
  recycle: (path: string) => Promise<VfsNode | undefined>
  restore: (path: string) => Promise<VfsNode | undefined>
  emptyRecycleBin: () => Promise<void>
  rename: (path: string, newName: string) => Promise<VfsNode | undefined>
  saveTextFile: (path: string, text: string) => Promise<VfsNode | undefined>
}

export const FileSystemContext = createContext<FileSystemContextValue | null>(null)
