import { useEffect, useState } from 'react'

function formatTime(): string {
  return new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export function SystemClock(): React.ReactElement {
  const [time, setTime] = useState(formatTime)

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  return <span className="mx-1 antialiased">{time}</span>
}
