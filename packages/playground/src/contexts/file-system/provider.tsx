import type { ReactNode } from 'react'
import type { CreateFileOptions, VfsNode } from './types'
import { useEffect, useState } from 'react'
import { ICON } from '../../lib/icons'
import { requestPersistentStorage } from '../desktop-files/storage'
import { associate } from './associations'
import { FileSystemContext } from './context'
import {
  createFile as dbCreateFile,
  createFolder as dbCreateFolder,
  deleteNode as dbDeleteNode,
  emptyRecycleBin as dbEmptyRecycleBin,
  recycleNode as dbRecycleNode,
  renameNode as dbRenameNode,
  restoreNode as dbRestoreNode,
  saveTextFile as dbSaveTextFile,
  seedIfEmpty,
} from './db'

const FOLDER_ICON = ICON.folderClosed.sm

export function FileSystemProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let active = true
    const boot = async (): Promise<void> => {
      try {
        await requestPersistentStorage()
        await seedIfEmpty()
      }
      finally {
        if (active) {
          setLoading(false)
          // Refetch views now that the starter tree is in place.
          setRevision(value => value + 1)
        }
      }
    }
    void boot()
    return () => {
      active = false
    }
  }, [])

  const bump = (): void => setRevision(value => value + 1)

  const createFolder = async (parentPath: string, desiredName?: string): Promise<VfsNode> => {
    const node = await dbCreateFolder(parentPath, FOLDER_ICON, desiredName)
    bump()
    return node
  }

  const createFile = async (parentPath: string, options: CreateFileOptions): Promise<VfsNode> => {
    const node = await dbCreateFile(parentPath, options)
    bump()
    return node
  }

  const importFiles = async (
    parentPath: string,
    files: File[],
    onProgress?: (completed: number, total: number) => void,
  ): Promise<VfsNode[]> => {
    const created: VfsNode[] = []
    onProgress?.(0, files.length)
    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      const association = associate(file.name)
      const node = await dbCreateFile(parentPath, {
        name: file.name,
        kind: association.kind,
        icon: association.icon,
        mimeType: file.type || association.category,
        openApp: association.openApp,
        blob: file,
        size: file.size,
      })
      created.push(node)
      onProgress?.(index + 1, files.length)
    }
    if (created.length > 0)
      bump()
    return created
  }

  const remove = async (path: string): Promise<void> => {
    await dbDeleteNode(path)
    bump()
  }

  const recycle = async (path: string): Promise<VfsNode | undefined> => {
    const node = await dbRecycleNode(path)
    bump()
    return node
  }

  const restore = async (path: string): Promise<VfsNode | undefined> => {
    const node = await dbRestoreNode(path)
    bump()
    return node
  }

  const emptyRecycleBin = async (): Promise<void> => {
    await dbEmptyRecycleBin()
    bump()
  }

  const rename = async (path: string, newName: string): Promise<VfsNode | undefined> => {
    const node = await dbRenameNode(path, newName)
    bump()
    return node
  }

  const saveTextFile = async (path: string, text: string): Promise<VfsNode | undefined> => {
    const node = await dbSaveTextFile(path, text)
    bump()
    return node
  }

  const value = {
    loading,
    revision,
    createFolder,
    createFile,
    importFiles,
    remove,
    recycle,
    restore,
    emptyRecycleBin,
    rename,
    saveTextFile,
  }

  return (
    <FileSystemContext value={value}>
      {children}
    </FileSystemContext>
  )
}
