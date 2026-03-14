import type { AppId } from '../../contexts/process'
import { Suspense } from 'react'
import { appDirectory, useProcesses } from '../../contexts/process'

/**
 * Renders only the currently open (running) processes — not all registered apps.
 * `processes` is the runtime state populated via `actions.open(appId)`.
 * `appDirectory` is the static registry used solely to look up each app's Component.
 */
export function WindowRenderer(): React.ReactElement {
  const { processes } = useProcesses()

  return (
    <>
      {Object.keys(processes).map((pid) => {
        const proc = processes[pid]
        // Ephemeral processes carry their own Component; regular ones use the directory
        const Component = proc.Component
          ?? appDirectory[proc.appId as AppId]?.Component
        if (!Component)
          return null
        return (
          <Suspense key={pid}>
            <Component windowId={pid} />
          </Suspense>
        )
      })}
    </>
  )
}
