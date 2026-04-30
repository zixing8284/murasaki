import type { RefObject } from 'react'
import { useCallback, useMemo, useRef } from 'react'

export interface CollectionItem<T = unknown> {
  ref: RefObject<HTMLElement | null>
  data: T
}

export interface UseCollectionResult<T = unknown> {
  /** Stable callback to register an item. Returns the unregister function. */
  register: (ref: RefObject<HTMLElement | null>, data: T) => () => void
  /** Get items in current DOM order. Re-evaluated on each call. */
  getItems: () => CollectionItem<T>[]
  /** Index of an item ref in DOM order, or -1 if not registered. */
  indexOf: (ref: RefObject<HTMLElement | null>) => number
}

/**
 * DOM-order item registry shared by collection-driven components
 * (Tabs, TreeView, Menu, Dropdown listbox).
 *
 * Items register themselves and are returned in document order so consumers
 * can layer roving-tabindex / typeahead / arrow navigation on top.
 *
 * Out of scope: navigation, focus, selection — see future `useRovingFocus`
 * and `useTypeahead`.
 */
export function useCollection<T = unknown>(): UseCollectionResult<T> {
  const itemsRef = useRef<Set<CollectionItem<T>>>(new Set())

  const register = useCallback((ref: RefObject<HTMLElement | null>, data: T) => {
    const item: CollectionItem<T> = { ref, data }
    itemsRef.current.add(item)
    return () => {
      itemsRef.current.delete(item)
    }
  }, [])

  const getItems = useCallback((): CollectionItem<T>[] => {
    const list = Array.from(itemsRef.current)
    list.sort((a, b) => {
      const aNode = a.ref.current
      const bNode = b.ref.current
      if (!aNode || !bNode)
        return 0
      if (aNode === bNode)
        return 0
      const position = aNode.compareDocumentPosition(bNode)
      if (position & Node.DOCUMENT_POSITION_FOLLOWING)
        return -1
      if (position & Node.DOCUMENT_POSITION_PRECEDING)
        return 1
      return 0
    })
    return list
  }, [])

  const indexOf = useCallback((ref: RefObject<HTMLElement | null>): number => {
    const items = getItems()
    return items.findIndex(item => item.ref === ref)
  }, [getItems])

  return useMemo(() => ({ register, getItems, indexOf }), [register, getItems, indexOf])
}
