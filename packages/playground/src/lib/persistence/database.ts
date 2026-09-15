import { PLAYGROUND_INDEXED_DB } from './schema'

/**
 * Single source of truth for opening the shared playground IndexedDB.
 *
 * Every feature (desktop media files, wallpaper images, the virtual file
 * system) lives in ONE database at ONE version. Because an `onupgradeneeded`
 * only fires for the connection that performs the version bump, the schema for
 * all* stores must be applied there — otherwise a store whose module happened
 * not to open first would never be created. This module owns that schema so the
 * individual feature stores don't diverge.
 */

const { name: DATABASE_NAME, version: DATABASE_VERSION, stores } = PLAYGROUND_INDEXED_DB

/** Create/upgrade every object store with its correct key path and indexes. */
function applySchema(database: IDBDatabase): void {
  // Blob-record stores keyed by a generated `id`.
  for (const storeName of [stores.desktopMediaFiles, stores.wallpaperImages]) {
    if (!database.objectStoreNames.contains(storeName)) {
      database.createObjectStore(storeName, { keyPath: 'id' })
    }
  }

  // File-system nodes are keyed by their canonical path and queried by parent.
  if (!database.objectStoreNames.contains(stores.fileSystemNodes)) {
    const nodeStore = database.createObjectStore(stores.fileSystemNodes, { keyPath: 'path' })
    nodeStore.createIndex('parentPath', 'parentPath', { unique: false })
  }

  // File-system blobs are keyed by the owning node's path.
  if (!database.objectStoreNames.contains(stores.fileSystemBlobs)) {
    database.createObjectStore(stores.fileSystemBlobs, { keyPath: 'path' })
  }
}

export function openPlaygroundDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      applySchema(request.result)
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open playground database'))
  })
}
