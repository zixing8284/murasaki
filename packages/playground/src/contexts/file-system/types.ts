import type { AppId } from '../process/directory'

/**
 * A node in the persistent virtual file system.
 *
 * Nodes are stored flat in IndexedDB, keyed by their canonical `path`
 * (slash-joined names from the Desktop root, e.g.
 * `Desktop/My Computer/(C:)/My Documents/readme.txt`) and queried by
 * `parentPath`. File contents live in a separate blob store keyed by the same
 * path — seeded demo files instead reference a public `assetUrl` or inline
 * `textContent`, so the starter tree needs no bundled blobs.
 */
export type VfsNodeType = 'folder' | 'file'

export interface VfsNode {
  /** Canonical unique key: slash-joined names from the root. */
  path: string
  /** Parent node's path (`''` for the Desktop root). */
  parentPath: string
  /** Leaf name shown in the UI. */
  name: string
  type: VfsNodeType
  /** 16px icon path (public-root absolute; resolve via `assetPath`). */
  icon: string
  /** Human-readable type label ("File Folder", "Text Document", …). */
  kind: string
  /** Size in bytes (0 for folders / placeholders). */
  size: number
  createdAt: number
  modifiedAt: number
  /** MIME type for files. */
  mimeType?: string
  /** App launched on open (overrides extension-based routing). */
  openApp?: AppId
  /** True when a real blob is stored for this file. */
  hasBlob?: boolean
  /** Seeded demo file backed by a public asset instead of a blob. */
  assetUrl?: string
  /** Seeded media file streamed from a remote URL (not downloaded). */
  streamUrl?: string
  /** Seeded demo text file whose contents are inlined here. */
  textContent?: string
  /** Seeded system chrome (drives, Control Panel …) — protected from edits. */
  system?: boolean
  /** Hide from the Folders tree (still listed in the content pane). */
  hideInTree?: boolean
  /** For recycled nodes: the path this node occupied before deletion. */
  originalPath?: string
  /** For recycled nodes: when it was moved to the Recycle Bin. */
  deletedAt?: number
}

/** Options accepted when creating a file node. */
export interface CreateFileOptions {
  name: string
  kind: string
  icon: string
  mimeType?: string
  openApp?: AppId
  blob?: Blob
  textContent?: string
  size?: number
}
