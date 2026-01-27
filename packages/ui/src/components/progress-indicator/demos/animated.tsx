import { Button } from '#/components/button/button'

import { useState } from 'react'

import { ProgressIndicator } from '../progress-indicator'

export function AnimatedDemo(): React.ReactElement {
  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const startProgress = (): void => {
    if (isRunning)
      return
    setIsRunning(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          return 100
        }
        const diff = Math.random() * 10
        return Math.min(prev + diff, 100)
      })
    }, 500)
  }

  const reset = (): void => {
    setProgress(0)
    setIsRunning(false)
  }

  return (
    <div className="flex w-80 flex-col gap-4">
      <p className="text-sm">Default variant:</p>
      <ProgressIndicator value={progress} />

      <p className="text-sm">Tile variant:</p>
      <ProgressIndicator value={progress} variant="tile" />

      <div className="mt-2 flex gap-2">
        <Button onClick={startProgress} disabled={isRunning}>
          Start
        </Button>
        <Button onClick={reset}>Reset</Button>
      </div>
    </div>
  )
}
