import { Suspense } from 'react'
import { processDirectory, useProcesses } from '../contexts/process'

export function WindowRenderer(): React.ReactElement {
  const { processes } = useProcesses()

  return (
    <>
      {Object.keys(processes).map((pid) => {
        const proc = processes[pid]
        const entry = processDirectory[proc.appId]
        if (!entry)
          return null
        const { Component } = entry
        return (
          <Suspense key={pid}>
            <Component windowId={pid} />
          </Suspense>
        )
      })}
    </>
  )
}
