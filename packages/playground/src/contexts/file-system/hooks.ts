import type { FileSystemContextValue } from './context'
import type { VfsNode } from './types'
import { use, useEffect, useState } from 'react'
import { assetPath } from '../../lib/asset-path'
import { FileSystemContext } from './context'
import { getAllNodes, getNode, listChildren, readBlob } from './db'

function isRenderableNode(node: VfsNode): boolean {
  if (node.type !== 'file')
    return true
  return !!node.hasBlob || !!node.assetUrl || node.textContent != null
}

export function useFileSystem(): FileSystemContextValue {
  const context = use(FileSystemContext)
  if (!context) {
    throw new Error('useFileSystem must be used within a <FileSystemProvider>')
  }
  return context
}

/** Immediate children of a folder, re-fetched whenever the store mutates. */
export function useFolderChildren(parentPath: string | null): { children: VfsNode[], loading: boolean } {
  const { revision } = useFileSystem()
  const [result, setResult] = useState<{ path: string, revision: number, children: VfsNode[] } | null>(null)

  useEffect(() => {
    if (parentPath == null)
      return
    let active = true
    listChildren(parentPath)
      .then((children) => {
        if (active) {
          setResult({
            path: parentPath,
            revision,
            children: children.filter(isRenderableNode),
          })
        }
      })
      .catch(() => {
        if (active)
          setResult({ path: parentPath, revision, children: [] })
      })
    return () => {
      active = false
    }
  }, [parentPath, revision])

  if (parentPath == null)
    return { children: [], loading: false }
  const upToDate = result?.path === parentPath && result?.revision === revision
  return { children: result?.children ?? [], loading: !upToDate }
}

/** Every node in the store (for the folder tree), re-fetched on mutation. */
export function useAllNodes(): VfsNode[] {
  const { revision } = useFileSystem()
  const [nodes, setNodes] = useState<VfsNode[]>([])

  useEffect(() => {
    let active = true
    getAllNodes()
      .then((next) => {
        if (active)
          setNodes(next)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [revision])

  return nodes
}

/** A single node by path, re-fetched on mutation. */
export function useVfsNode(path: string | null): VfsNode | null {
  const { revision } = useFileSystem()
  const [node, setNode] = useState<VfsNode | null>(null)

  useEffect(() => {
    if (path == null)
      return
    let active = true
    getNode(path)
      .then((next) => {
        if (active)
          setNode(next ?? null)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [path, revision])

  return path == null
    ? null
    : node
}

/**
 * A displayable image `src` for a file node: a bundled asset URL directly, or
 * an object URL read from the stored blob (revoked on cleanup). Non-image or
 * placeholder nodes resolve to `null`.
 */
export function useVfsImageSrc(node: Pick<VfsNode, 'path' | 'type' | 'assetUrl' | 'hasBlob'> | null): string | null {
  const path = node?.path ?? null
  const assetUrl = node?.assetUrl ?? null
  const hasBlob = node?.hasBlob ?? false
  const isFile = node?.type === 'file'
  const [blobResult, setBlobResult] = useState<{ path: string, src: string } | null>(null)

  useEffect(() => {
    if (!isFile || path == null || assetUrl || !hasBlob)
      return
    let active = true
    let objectUrl: string | null = null
    readBlob(path)
      .then((blob) => {
        if (!active || !blob)
          return
        objectUrl = URL.createObjectURL(blob)
        setBlobResult({ path, src: objectUrl })
      })
      .catch(() => {})
    return () => {
      active = false
      if (objectUrl)
        URL.revokeObjectURL(objectUrl)
    }
  }, [path, assetUrl, hasBlob, isFile])

  if (!isFile || path == null)
    return null
  if (assetUrl)
    return assetPath(assetUrl)
  if (!hasBlob)
    return null
  return blobResult?.path === path
    ? blobResult.src
    : null
}
