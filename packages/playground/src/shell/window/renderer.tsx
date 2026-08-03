import type { ComponentType } from 'react'
import type { AppId } from '../../contexts/process/directory'
import type { ProcessComponentProps, ProcessDirectoryEntry } from '../../contexts/process/types'
import { Fragment, Suspense } from 'react'
import appDirectory from '../../contexts/process/directory'
import { useProcesses } from '../../contexts/process/hooks'
import { useSystemBusy } from '../../contexts/system-cursor'
import { Ie2Chrome } from './ie2-chrome'
import { IframeWindow } from './iframe-window'
import { RndWindow } from './rnd-window'

/**
 * Loading placeholder rendered inside the window frame while a lazy component
 * chunk is still resolving. The window frame (title bar, borders) is already
 * visible — only the content area shows this placeholder, matching the
 * behavior of iframe-based windows which also display the frame immediately
 * with a "Loading…" indicator while the embedded content loads.
 */
function WindowLoadingPlaceholder(): React.ReactElement {
  useSystemBusy(true, 'working')
  return (
    <div className="size-full min-h-40 flex items-center justify-center">
      <span className="text-xs text-(--gray-text)">Loading…</span>
    </div>
  )
}

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

  // The RndWindow frame is always rendered immediately. The component content
  // is wrapped in its own Suspense boundary so that the frame stays visible
  // while the lazy chunk resolves — only the content area shows a loading
  // placeholder, consistent with how iframe windows behave.
  return (
    <RndWindow
      windowId={windowId}
      className={windowConfig?.className}
      contentClassName={windowConfig?.contentClassName}
      disableMaximize={windowConfig?.disableMaximize}
      disableMinimize={windowConfig?.disableMinimize}
      disableResize={windowConfig?.disableResize}
    >
      <Suspense fallback={<WindowLoadingPlaceholder />}>
        {Component
          ? <Component windowId={windowId} />
          : <WindowLoadingPlaceholder />}
      </Suspense>
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
        // Key by stable PID so each window keeps its own fiber, DOM node and
        // imperative drag transform. Without a key React reconciles by list
        // index, so closing a window reuses a sibling's fiber and the surviving
        // window loses its dragged position.
        return (
          <Fragment key={pid}>
            {renderProcessWindow(pid, entry, Component)}
          </Fragment>
        )
      })}
    </>
  )
}
