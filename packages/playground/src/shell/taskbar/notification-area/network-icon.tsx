import { useEffect, useRef, useState } from 'react'
import { assetPath } from '../../../lib/asset-path'
import { useNetworkStatus } from './use-network-status'

const NETWORK_ONLINE_ICONS = [
  assetPath('/icons/windows98-icons/ico/conn_pcs_on_off.ico'),
  assetPath('/icons/windows98-icons/ico/conn_pcs_off_on.ico'),
  assetPath('/icons/windows98-icons/ico/conn_pcs_on_on.ico'),
]
const NETWORK_OFFLINE_ICON = assetPath('/icons/windows98-icons/ico/conn_pcs_no_network.ico')

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
