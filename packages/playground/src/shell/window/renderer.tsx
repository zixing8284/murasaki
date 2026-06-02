import type { ComponentType } from 'react'
import type { AppId } from '../../contexts/process/directory'
import type { ProcessComponentProps, ProcessDirectoryEntry } from '../../contexts/process/types'
import { Suspense } from 'react'
import appDirectory from '../../contexts/process/directory'
import { useProcesses } from '../../contexts/process/hooks'
import { Ie2Chrome } from './ie2-chrome'
import { IframeWindow } from './iframe-window'
import { RndWindow } from './rnd-window'

function renderProcessWindow(
  windowId: string,
  entry: ProcessDirectoryEntry | undefined,
  Component: ComponentType<ProcessComponentProps> | undefined,
): React.ReactElement | null {
  const windowConfig = entry?.window

  if (windowConfig?.type === 'iframe') {
    if (windowConfig.chrome === 'ie2') {
      return (
        <Ie2Chrome
          windowId={windowId}
          src={windowConfig.src}
          className={windowConfig.className}
          contentClassName={windowConfig.contentClassName}
          disableMaximize={windowConfig.disableMaximize}
          disableMinimize={windowConfig.disableMinimize}
          disableResize={windowConfig.disableResize}
        />
      )
    }

    return (
      <IframeWindow
        windowId={windowId}
        src={windowConfig.src}
        className={windowConfig.className}
        contentClassName={windowConfig.contentClassName}
        disableMaximize={windowConfig.disableMaximize}
        disableMinimize={windowConfig.disableMinimize}
        disableResize={windowConfig.disableResize}
      />
    )
  }

  if (windowConfig?.type === 'none') {
    return Component ? <Component windowId={windowId} /> : null
  }

  if (!Component) {
    return null
  }

  return (
    <RndWindow
      windowId={windowId}
      className={windowConfig?.className}
      contentClassName={windowConfig?.contentClassName}
      disableMaximize={windowConfig?.disableMaximize}
      disableMinimize={windowConfig?.disableMinimize}
      disableResize={windowConfig?.disableResize}
    >
      <Component windowId={windowId} />
    </RndWindow>
  )
}

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
        const entry = appDirectory[proc.appId as AppId]
        // Ephemeral processes carry their own Component; regular ones use the directory
        const Component = proc.Component
          ?? entry?.Component
        const window = renderProcessWindow(pid, entry, Component)
        if (!window)
          return null
        return (
          <Suspense key={pid}>
            {window}
          </Suspense>
        )
      })}
    </>
  )
}
