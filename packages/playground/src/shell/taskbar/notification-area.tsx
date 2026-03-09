import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useProcessActions } from '../../contexts/process'

// Network status store using useSyncExternalStore
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

function useNetworkStatus(): boolean {
  return useSyncExternalStore(
    subscribeToNetworkStatus,
    getNetworkSnapshot,
    getServerNetworkSnapshot,
  )
}

// Network status icons for online state cycling
const NETWORK_ONLINE_ICONS = [
  '/img/conn_pcs_on_off.png',
  '/img/conn_pcs_off_on.png',
  '/img/conn_pcs_on_on.png',
]
const NETWORK_OFFLINE_ICON = '/img/conn_pcs_no_network.png'

interface NotificationAreaProps {
  time: string
}

export function NotificationArea({ time }: NotificationAreaProps): React.ReactElement {
  const isOnline = useNetworkStatus()
  const [networkIconIndex, setNetworkIconIndex] = useState(0)
  const networkIconIndexRef = useRef(0)
  const { openEphemeralApp } = useProcessActions()

  // Reset network icon index when going offline
  useEffect(() => {
    if (!isOnline) {
      networkIconIndexRef.current = 0
    }
  }, [isOnline])

  // Cycle through network icons when online
  useEffect(() => {
    if (!isOnline) {
      return
    }

    const interval = setInterval(() => {
      networkIconIndexRef.current = (networkIconIndexRef.current + 1) % NETWORK_ONLINE_ICONS.length
      setNetworkIconIndex(networkIconIndexRef.current)
    }, 3000)

    return () => clearInterval(interval)
  }, [isOnline])

  return (
    <div className="h-5.5 px-0.5 flex flex-row items-center border-l border-l-[#7b7b7b] border-t border-t-[#7b7b7b] border-r border-r-white border-b border-b-white mt-px truncate">
      <img
        className="mx-px"
        src={isOnline ? NETWORK_ONLINE_ICONS[networkIconIndex] : NETWORK_OFFLINE_ICON}
        alt={isOnline ? 'Network connected' : 'Network disconnected'}
        title={isOnline ? 'Connected' : 'Disconnected'}
      />
      <img
        className="mx-px cursor-pointer"
        src="/img/computer.png"
        alt="Display Properties"
        title="Display Properties"
        onClick={(e) => {
          e.stopPropagation()
          openEphemeralApp('eph:displayproperties')
        }}
      />
      <span className="mx-1 antialiased">{time}</span>
    </div>
  )
}
