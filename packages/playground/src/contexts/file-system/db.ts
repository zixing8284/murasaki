import type { CreateFileOptions, VfsNode } from './types'
import { assetPath } from '../../lib/asset-path'
import { openPlaygroundDatabase } from '../../lib/persistence/database'
import { PLAYGROUND_INDEXED_DB } from '../../lib/persistence/schema'
import { buildSeedNodes, DEFAULT_PATH, RECYCLE_BIN_PATH } from './seed'
import { getName, getParentPath, isAncestorOrSelf, joinPath } from './vfs-path'

const NODES = PLAYGROUND_INDEXED_DB.stores.fileSystemNodes
const BLOBS = PLAYGROUND_INDEXED_DB.stores.fileSystemBlobs

interface BlobRecord {
  path: string
  blob: Blob
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('VFS request failed'))
  })
}

/**
 * Run `executor` inside one transaction and resolve with its return value once
 * the transaction commits. Requests issued by `executor` keep the transaction
 * alive between awaited steps (the standard promise-wrapped IndexedDB pattern).
 */
async function runTransaction<T>(
  storeNames: string | string[],
  mode: IDBTransactionMode,
  executor: (tx: IDBTransaction) => Promise<T> | T,
): Promise<T> {
  const database = await openPlaygroundDatabase()
  return new Promise<T>((resolve, reject) => {
    const tx = database.transaction(storeNames, mode)
    let result: T
    let settled = false

    Promise.resolve(executor(tx)).then((value) => {
      result = value
    }).catch((error) => {
      settled = true
      try {
        tx.abort()
      }
      catch {
        // Transaction may already be finishing.
      }
      database.close()
      reject(error)
    })

    tx.oncomplete = () => {
      database.close()
      if (!settled)
        resolve(result)
    }
    tx.onerror = () => {
      database.close()
      if (!settled) {
        settled = true
        reject(tx.error ?? new Error('VFS transaction failed'))
      }
    }
    tx.onabort = () => {
      database.close()
      if (!settled) {
        settled = true
        reject(tx.error ?? new Error('VFS transaction aborted'))
      }
    }
  })
}

/** Seed the starter tree the first time the store is empty. */
export async function seedIfEmpty(): Promise<void> {
  const count = await runTransaction(NODES, 'readonly', tx =>
    requestToPromise(tx.objectStore(NODES).count()))
  if (count > 0)
    return

  const nodes = buildSeedNodes()
  await runTransaction(NODES, 'readwrite', (tx) => {
    const store = tx.objectStore(NODES)
    for (const node of nodes)
      store.put(node)
  })
}

/** Every node in the store (used to build the folder tree). */
export function getAllNodes(): Promise<VfsNode[]> {
  return runTransaction(NODES, 'readonly', tx =>
    requestToPromise(tx.objectStore(NODES).getAll() as IDBRequest<VfsNode[]>))
}

/** Immediate children of a folder, unsorted. */
export function listChildren(parentPath: string): Promise<VfsNode[]> {
  return runTransaction(NODES, 'readonly', tx =>
    requestToPromise(tx.objectStore(NODES).index('parentPath').getAll(parentPath) as IDBRequest<VfsNode[]>))
}

/** A single node, or `undefined` when it does not exist. */
export function getNode(path: string): Promise<VfsNode | undefined> {
  return runTransaction(NODES, 'readonly', tx =>
    requestToPromise(tx.objectStore(NODES).get(path) as IDBRequest<VfsNode | undefined>))
}

/** Pick a child name that does not collide with an existing sibling. */
async function uniqueChildName(parentPath: string, desiredName: string): Promise<string> {
  const siblings = await listChildren(parentPath)
  const taken = new Set(siblings.map(child => child.name.toLowerCase()))
  if (!taken.has(desiredName.toLowerCase()))
    return desiredName

  const dot = desiredName.lastIndexOf('.')
  const base = dot > 0 ? desiredName.slice(0, dot) : desiredName
  const ext = dot > 0 ? desiredName.slice(dot) : ''
  for (let index = 2; ; index++) {
    const candidate = `${base} (${index})${ext}`
    if (!taken.has(candidate.toLowerCase()))
      return candidate
  }
}

/** Create an empty folder and return the created node. */
export async function createFolder(parentPath: string, folderIcon: string, desiredName = 'New Folder'): Promise<VfsNode> {
  const name = await uniqueChildName(parentPath, desiredName)
  const now = Date.now()
  const node: VfsNode = {
    path: joinPath(parentPath, name),
    parentPath,
    name,
    type: 'folder',
    icon: folderIcon,
    kind: 'File Folder',
    size: 0,
    createdAt: now,
    modifiedAt: now,
  }
  await runTransaction(NODES, 'readwrite', tx => requestToPromise(tx.objectStore(NODES).add(node)))
  return node
}

/** Create a file (optionally with a blob) and return the created node. */
export async function createFile(parentPath: string, options: CreateFileOptions): Promise<VfsNode> {
  const name = await uniqueChildName(parentPath, options.name)
  const now = Date.now()
  const node: VfsNode = {
    path: joinPath(parentPath, name),
    parentPath,
    name,
    type: 'file',
    icon: options.icon,
    kind: options.kind,
    size: options.size ?? options.blob?.size ?? options.textContent?.length ?? 0,
    createdAt: now,
    modifiedAt: now,
    mimeType: options.mimeType,
    openApp: options.openApp,
    hasBlob: options.blob != null,
    textContent: options.blob == null ? options.textContent : undefined,
  }
  await runTransaction([NODES, BLOBS], 'readwrite', (tx) => {
    tx.objectStore(NODES).put(node)
    if (options.blob)
      tx.objectStore(BLOBS).put({ path: node.path, blob: options.blob } satisfies BlobRecord)
  })
  return node
}

/** Overwrite a text file's contents (used by Notepad Save). */
export async function saveTextFile(path: string, text: string): Promise<VfsNode | undefined> {
  const node = await getNode(path)
  if (!node || node.type !== 'file')
    return undefined
  const updated: VfsNode = {
    ...node,
    size: text.length,
    modifiedAt: Date.now(),
    textContent: node.hasBlob ? undefined : text,
  }
  await runTransaction([NODES, BLOBS], 'readwrite', (tx) => {
    tx.objectStore(NODES).put(updated)
    if (node.hasBlob)
      tx.objectStore(BLOBS).put({ path, blob: new Blob([text], { type: node.mimeType ?? 'text/plain' }) } satisfies BlobRecord)
  })
  return updated
}

/** Collect a node and all of its descendants (read-only). */
async function collectSubtree(rootPath: string): Promise<VfsNode[]> {
  const all = await getAllNodes()
  return all.filter(node => isAncestorOrSelf(rootPath, node.path))
}

/** Delete a node and its entire subtree (including blobs). */
export async function deleteNode(path: string): Promise<void> {
  // Read the subtree first, then issue only synchronous writes so the
  // readwrite transaction stays active (awaiting mid-transaction lets it
  // auto-commit before the writes run).
  const subtree = await collectSubtree(path)
  await runTransaction([NODES, BLOBS], 'readwrite', (tx) => {
    const nodeStore = tx.objectStore(NODES)
    const blobStore = tx.objectStore(BLOBS)
    for (const node of subtree) {
      nodeStore.delete(node.path)
      blobStore.delete(node.path)
    }
  })
}

/** Rename a node, rewriting the paths of every descendant. */
export async function renameNode(path: string, rawName: string): Promise<VfsNode | undefined> {
  const trimmed = rawName.trim()
  if (!trimmed || trimmed === getName(path))
    return getNode(path)

  const parentPath = getParentPath(path)
  const newName = await uniqueChildName(parentPath, trimmed)
  const newRoot = joinPath(parentPath, newName)

  // Read the subtree (and any blobs) up front so the write transaction below
  // performs only synchronous operations and never goes inactive.
  const subtree = await collectSubtree(path)
  const blobs = new Map<string, Blob>()
  for (const node of subtree) {
    if (node.hasBlob) {
      const blob = await readBlob(node.path)
      if (blob)
        blobs.set(node.path, blob)
    }
  }

  const now = Date.now()
  await runTransaction([NODES, BLOBS], 'readwrite', (tx) => {
    const nodeStore = tx.objectStore(NODES)
    const blobStore = tx.objectStore(BLOBS)
    for (const node of subtree) {
      const isRoot = node.path === path
      const newPath = isRoot ? newRoot : newRoot + node.path.slice(path.length)
      const rewritten: VfsNode = {
        ...node,
        path: newPath,
        parentPath: getParentPath(newPath),
        name: isRoot ? newName : node.name,
        modifiedAt: isRoot ? now : node.modifiedAt,
      }
      nodeStore.delete(node.path)
      nodeStore.put(rewritten)
      const blob = blobs.get(node.path)
      if (blob) {
        blobStore.delete(node.path)
        blobStore.put({ path: newPath, blob } satisfies BlobRecord)
      }
    }
  })

  return getNode(newRoot)
}

/**
 * Move a node (and its subtree) under a new parent. Optionally stamps recycle
 * metadata (`recycleFrom`), clears it (`restore`), or restores an original name.
 */
export async function moveNode(path: string, newParentPath: string, options?: {
  desiredName?: string
  recycleFrom?: string
  restore?: boolean
}): Promise<VfsNode | undefined> {
  const node = await getNode(path)
  if (!node)
    return undefined

  const newName = await uniqueChildName(newParentPath, options?.desiredName ?? node.name)
  const newRoot = joinPath(newParentPath, newName)

  const subtree = await collectSubtree(path)
  const blobs = new Map<string, Blob>()
  for (const child of subtree) {
    if (child.hasBlob) {
      const blob = await readBlob(child.path)
      if (blob)
        blobs.set(child.path, blob)
    }
  }

  const now = Date.now()
  await runTransaction([NODES, BLOBS], 'readwrite', (tx) => {
    const nodeStore = tx.objectStore(NODES)
    const blobStore = tx.objectStore(BLOBS)
    for (const child of subtree) {
      const isRoot = child.path === path
      const newPath = isRoot ? newRoot : newRoot + child.path.slice(path.length)
      const rewritten: VfsNode = {
        ...child,
        path: newPath,
        parentPath: getParentPath(newPath),
        name: isRoot ? newName : child.name,
      }
      if (isRoot) {
        rewritten.modifiedAt = now
        if (options?.recycleFrom) {
          rewritten.originalPath = options.recycleFrom
          rewritten.deletedAt = now
        }
        if (options?.restore) {
          delete rewritten.originalPath
          delete rewritten.deletedAt
        }
      }
      nodeStore.delete(child.path)
      nodeStore.put(rewritten)
      const blob = blobs.get(child.path)
      if (blob) {
        blobStore.delete(child.path)
        blobStore.put({ path: newPath, blob } satisfies BlobRecord)
      }
    }
  })

  return getNode(newRoot)
}

/** Soft-delete: move a node into the Recycle Bin, remembering where it was. */
export function recycleNode(path: string): Promise<VfsNode | undefined> {
  return moveNode(path, RECYCLE_BIN_PATH, { recycleFrom: path })
}

/** Restore a recycled node to its original location (or My Documents). */
export async function restoreNode(path: string): Promise<VfsNode | undefined> {
  const node = await getNode(path)
  if (!node)
    return undefined

  const originalPath = node.originalPath
  const targetParent = originalPath ? getParentPath(originalPath) : DEFAULT_PATH
  const parentExists = (await getNode(targetParent)) != null
  return moveNode(path, parentExists ? targetParent : DEFAULT_PATH, {
    desiredName: originalPath ? getName(originalPath) : node.name,
    restore: true,
  })
}

/** Permanently delete every item currently in the Recycle Bin. */
export async function emptyRecycleBin(): Promise<void> {
  const children = await listChildren(RECYCLE_BIN_PATH)
  for (const child of children)
    await deleteNode(child.path)
}
export function readBlob(path: string): Promise<Blob | undefined> {
  return runTransaction(BLOBS, 'readonly', async (tx) => {
    const record = await requestToPromise(tx.objectStore(BLOBS).get(path) as IDBRequest<BlobRecord | undefined>)
    return record?.blob
  })
}

/**
 * Resolve a file node to a `File` object, from (in order) its stored blob, a
 * bundled `assetUrl`, or inline `textContent`. Returns `null` for placeholders.
 */
export async function getFile(path: string): Promise<File | null> {
  const node = await getNode(path)
  if (!node || node.type !== 'file')
    return null

  if (node.hasBlob) {
    const blob = await readBlob(path)
    if (blob)
      return new File([blob], node.name, { type: node.mimeType || blob.type })
  }

  if (node.assetUrl) {
    try {
      const response = await fetch(encodeURI(assetPath(node.assetUrl)))
      if (response.ok) {
        const blob = await response.blob()
        return new File([blob], node.name, { type: node.mimeType || blob.type })
      }
    }
    catch {
      // Fall through to text / null.
    }
  }

  if (node.textContent != null)
    return new File([node.textContent], node.name, { type: node.mimeType || 'text/plain' })

  return null
}
