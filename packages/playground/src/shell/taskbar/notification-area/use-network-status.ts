import { useSyncExternalStore } from 'react'

function subscribeToNetworkStatus(callback: () => void): () => void {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getNetworkSnapshot(): boolean {
  return navigator.onLine
}

function getServerNetworkSnapshot(): boolean {
  return true // Assume online during SSR
}

export function useNetworkStatus(): boolean {
  return useSyncExternalStore(
    subscribeToNetworkStatus,
    getNetworkSnapshot,
    getServerNetworkSnapshot,
  )
}
