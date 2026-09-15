/** Canonical path helpers for the virtual file system. */

/** The single namespace root every path descends from. */
export const ROOT_PATH = 'Desktop'

/** Join a parent path and a child name into a canonical node path. */
export function joinPath(parentPath: string, name: string): string {
  return parentPath ? `${parentPath}/${name}` : name
}

/** The parent path of a node path (`''` for the root). */
export function getParentPath(path: string): string {
  const index = path.lastIndexOf('/')
  return index === -1 ? '' : path.slice(0, index)
}

/** The leaf name of a node path. */
export function getName(path: string): string {
  const index = path.lastIndexOf('/')
  return index === -1 ? path : path.slice(index + 1)
}

/** Split a path into its ordered name segments. */
export function toSegments(path: string): string[] {
  return path.length === 0 ? [] : path.split('/')
}

/** Join ordered name segments back into a path. */
export function fromSegments(segments: readonly string[]): string {
  return segments.join('/')
}

/** True when `maybeAncestor` is the path of an ancestor-or-self of `path`. */
export function isAncestorOrSelf(maybeAncestor: string, path: string): boolean {
  return path === maybeAncestor || path.startsWith(`${maybeAncestor}/`)
}
