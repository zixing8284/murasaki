import { useEffect, useRef, useState } from 'react'
import { useNetworkStatus } from './use-network-status'

const NETWORK_ONLINE_ICONS = [
  '/img/conn_pcs_on_off.png',
  '/img/conn_pcs_off_on.png',
  '/img/conn_pcs_on_on.png',
]
const NETWORK_OFFLINE_ICON = '/img/conn_pcs_no_network.png'

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
      {NETWORK_ONLINE_ICONS.map((src, index) => (
        <img
          key={src}
          className={isOnline && networkIconIndex === index ? 'mx-px' : 'hidden'}
          src={src}
          alt="Network connected"
          title="Connected"
        />
      ))}
      <img
        className={isOnline ? 'hidden' : 'mx-px'}
        src={NETWORK_OFFLINE_ICON}
        alt="Network disconnected"
        title="Disconnected"
      />
    </>
  )
}
