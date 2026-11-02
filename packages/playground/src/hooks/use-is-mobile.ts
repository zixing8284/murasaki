import { useSyncExternalStore } from 'react'

const MOBILE_WIDTH_BREAKPOINT = 768

function getIsMobileSnapshot(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const pointerCoarse = window.matchMedia?.('(pointer: coarse)').matches === true
  return pointerCoarse || window.innerWidth <= MOBILE_WIDTH_BREAKPOINT
}

function subscribeIsMobile(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const media = window.matchMedia?.('(pointer: coarse)')
  window.addEventListener('resize', onStoreChange)

  if (media?.addEventListener) {
    media.addEventListener('change', onStoreChange)
    return () => {
      window.removeEventListener('resize', onStoreChange)
      media.removeEventListener('change', onStoreChange)
    }
  }

  media?.addListener?.(onStoreChange)
  return () => {
    window.removeEventListener('resize', onStoreChange)
    media?.removeListener?.(onStoreChange)
  }
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeIsMobile, getIsMobileSnapshot, () => false)
}
