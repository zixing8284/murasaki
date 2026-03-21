import { useEffect, useRef, useState } from 'react'
import { useNetworkStatus } from './use-network-status'

const NETWORK_ONLINE_ICONS = [
  '/img/conn_pcs_on_off.png',
  '/img/conn_pcs_off_on.png',
  '/img/conn_pcs_on_on.png',
]
const NETWORK_OFFLINE_ICON = '/img/conn_pcs_no_network.png'
const ALL_NETWORK_ICONS = [...NETWORK_ONLINE_ICONS, NETWORK_OFFLINE_ICON]

export function NetworkIcon(): React.ReactElement {
  const isOnline = useNetworkStatus()
  const [networkIconIndex, setNetworkIconIndex] = useState(0)
  const networkIconIndexRef = useRef(0)

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
    <>
      {/* Preload all network icons synchronously at render time so the offline icon is always available */}
      {ALL_NETWORK_ICONS.map(src => (
        <img key={src} src={src} alt="" aria-hidden="true" className="absolute pointer-events-none -z-10 opacity-0" />
      ))}
      <img
        className="mx-px"
        src={isOnline ? NETWORK_ONLINE_ICONS[networkIconIndex] : NETWORK_OFFLINE_ICON}
        alt={isOnline ? 'Network connected' : 'Network disconnected'}
        title={isOnline ? 'Connected' : 'Disconnected'}
      />
    </>
  )
}
