import { cn } from '#/lib/utils'

import { useEffect, useState } from 'react'

function formatTime(): string {
  return new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export interface TaskbarSystemClockProps extends React.ComponentProps<'span'> {}

export function TaskbarSystemClock({
  className,
  ref,
  ...props
}: TaskbarSystemClockProps): React.ReactElement {
  const [time, setTime] = useState(formatTime)

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span ref={ref} className={cn('mx-1 antialiased', className)} {...props}>
      {time}
    </span>
  )
}
