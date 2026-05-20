import type { Dispatch, SetStateAction } from 'react'
import type { ProcessContextActions, Processes } from './types'
import directory from './directory'

// ---------------------------------------------------------------------------
// Consolidated state — avoids separate refs / cross-atom reads
// ---------------------------------------------------------------------------

export interface ProcessState {
  processes: Processes
  foregroundId: string | null
  stackOrder: string[]
  container: HTMLElement | null
}

export const INITIAL_PROCESS_STATE: ProcessState = {
  processes: {},
  foregroundId: null,
  stackOrder: [],
  container: null,
}

type SetState = Dispatch<SetStateAction<ProcessState>>

let pidCounter = 0
function generatePid(appId: string): string {
  return `${appId}__${pidCounter++}`
}

/**
 * Pick the top-most non-minimized PID from the stack.
 * Returns null if none qualifies.
 */
function pickNextForeground(
  stack: string[],
  processes: Processes,
  excludeId?: string,
): string | null {
  for (let i = stack.length - 1; i >= 0; i--) {
    const pid = stack[i]
    if (pid === excludeId)
      continue
    if (processes[pid] && !processes[pid].minimized)
      return pid
  }
  return null
}

/**
 * Factory that creates all process lifecycle actions.
 *
 * Inspired by daedalOS `contexts/process/functions.ts`.
 * Uses a single consolidated setState dispatcher so every action can
 * atomically read + write the full state (no refs needed).
 */
export function createProcessActions(setState: SetState): ProcessContextActions {
  // -- actions (alphabetical, with forward-referenced helpers) ---------------

  const activate: ProcessContextActions['activate'] = (id) => {
    setState((prev) => {
      if (!prev.processes[id])
        return prev
      return {
        ...prev,
        processes: { ...prev.processes, [id]: { ...prev.processes[id], minimized: false } },
        stackOrder: [...prev.stackOrder.filter(pid => pid !== id), id],
        foregroundId: id,
      }
    })
  }

  const close: ProcessContextActions['close'] = (id) => {
    // remove current process from processes and stackOrder, and pick new foreground if needed
    setState((prev) => {
      if (!prev.processes[id])
        return prev
      const { [id]: _, ...rest } = prev.processes
      const newStack = prev.stackOrder.filter(pid => pid !== id)
      let newForeground = prev.foregroundId
      if (prev.foregroundId === id) {
        newForeground = pickNextForeground(newStack, rest)
      }
      return {
        ...prev,
        processes: rest,
        stackOrder: newStack,
        foregroundId: newForeground,
      }
    })
  }

  const minimizeAll: ProcessContextActions['minimizeAll'] = () => {
    setState((prev) => {
      const updated: Processes = {}
      for (const [id, proc] of Object.entries(prev.processes)) {
        updated[id] = proc.minimized ? proc : { ...proc, minimized: true }
      }
      return { ...prev, processes: updated, foregroundId: null }
    })
  }

  const deactivateAll: ProcessContextActions['deactivateAll'] = () => {
    setState(prev => ({ ...prev, foregroundId: null }))
  }

  const handleTaskbarClick: ProcessContextActions['handleTaskbarClick'] = (id) => {
    setState((prev) => {
      const proc = prev.processes[id]
      if (!proc)
        return prev

      if (proc.minimized) {
        // restore
        return {
          ...prev,
          processes: { ...prev.processes, [id]: { ...prev.processes[id], minimized: false } },
          stackOrder: [...prev.stackOrder.filter(pid => pid !== id), id],
          foregroundId: id,
        }
      }
      else if (prev.foregroundId === id) {
        // minimize
        const updated = { ...prev.processes, [id]: { ...prev.processes[id], minimized: true } }
        return {
          ...prev,
          processes: updated,
          foregroundId: pickNextForeground(prev.stackOrder, updated, id),
        }
      }
      else {
        // activate
        return {
          ...prev,
          processes: { ...prev.processes, [id]: { ...prev.processes[id], minimized: false } },
          stackOrder: [...prev.stackOrder.filter(pid => pid !== id), id],
          foregroundId: id,
        }
      }
    })
  }

  const linkElement: ProcessContextActions['linkElement'] = (id, el) => {
    setState((prev) => {
      if (!prev.processes[id])
        return prev
      return {
        ...prev,
        processes: { ...prev.processes, [id]: { ...prev.processes[id], componentWindow: el } },
      }
    })
  }

  const minimize: ProcessContextActions['minimize'] = (id) => {
    setState((prev) => {
      if (!prev.processes[id])
        return prev
      const updated = { ...prev.processes, [id]: { ...prev.processes[id], minimized: true } }
      let newForeground = prev.foregroundId
      if (prev.foregroundId === id) {
        newForeground = pickNextForeground(prev.stackOrder, updated, id)
      }
      return {
        ...prev,
        processes: updated,
        foregroundId: newForeground,
      }
    })
  }

  const open: ProcessContextActions['open'] = (appId, overrides) => {
    const entry = directory[appId]
    if (!entry)
      return

    // Singleton: PID = appId; Non-singleton: generate unique PID
    const pid = entry.singleton !== false ? appId : generatePid(appId)

    setState((prev) => {
      // If singleton and already running, activate it
      if (entry.singleton !== false && prev.processes[pid]) {
        return {
          ...prev,
          processes: { ...prev.processes, [pid]: { ...prev.processes[pid], minimized: false } },
          stackOrder: [...prev.stackOrder.filter(id => id !== pid), pid],
          foregroundId: pid,
        }
      }

      const process: Processes[string] = {
        appId,
        title: overrides?.title ?? entry.defaultTitle,
        minimized: false,
        maximized: false,
        componentWindow: null,
        ephemeral: entry.ephemeral ?? false,
      }
      if (entry.ephemeral && entry.Component) {
        process.Component = entry.Component
      }
      if (entry.ephemeral) {
        process.icon = entry.icon
      }
      return {
        ...prev,
        processes: { ...prev.processes, [pid]: process },
        stackOrder: [...prev.stackOrder.filter(id => id !== pid), pid],
        foregroundId: pid,
      }
    })
  }

  const restore: ProcessContextActions['restore'] = (id) => {
    setState((prev) => {
      if (!prev.processes[id])
        return prev
      return {
        ...prev,
        processes: { ...prev.processes, [id]: { ...prev.processes[id], minimized: false } },
        stackOrder: [...prev.stackOrder.filter(pid => pid !== id), id],
        foregroundId: id,
      }
    })
  }

  const setContainer: ProcessContextActions['setContainer'] = (el) => {
    setState(prev => ({ ...prev, container: el }))
  }

  const title: ProcessContextActions['title'] = (id, newTitle) => {
    setState((prev) => {
      if (!prev.processes[id])
        return prev
      return {
        ...prev,
        processes: { ...prev.processes, [id]: { ...prev.processes[id], title: newTitle } },
      }
    })
  }

  const toggleMaximize: ProcessContextActions['toggleMaximize'] = (id) => {
    setState((prev) => {
      if (!prev.processes[id])
        return prev
      return {
        ...prev,
        processes: {
          ...prev.processes,
          [id]: { ...prev.processes[id], maximized: !prev.processes[id].maximized },
        },
      }
    })
  }

  // Dynamic escape hatch — caller provides Component + options at call site.
  // Use for runtime-determined windows (e.g. plugin system, user-generated dialogs).
  const openEphemeral: ProcessContextActions['openEphemeral'] = (Component, options) => {
    const { id: baseId, title: ephTitle, icon, singleton: isSingleton = true } = options
    const pid = isSingleton ? baseId : generatePid(baseId)

    setState((prev) => {
      // If singleton and already running, activate it
      if (isSingleton && prev.processes[pid]) {
        return {
          ...prev,
          processes: { ...prev.processes, [pid]: { ...prev.processes[pid], minimized: false } },
          stackOrder: [...prev.stackOrder.filter(id => id !== pid), pid],
          foregroundId: pid,
        }
      }

      const process: Processes[string] = {
        appId: baseId,
        title: ephTitle,
        minimized: false,
        maximized: false,
        componentWindow: null,
        ephemeral: true,
        Component,
      }
      if (icon) {
        process.icon = icon
      }
      return {
        ...prev,
        processes: { ...prev.processes, [pid]: process },
        stackOrder: [...prev.stackOrder.filter(id => id !== pid), pid],
        foregroundId: pid,
      }
    })
  }

  return {
    open,
    close,
    activate,
    minimize,
    minimizeAll,
    toggleMaximize,
    restore,
    deactivateAll,
    handleTaskbarClick,
    setContainer,
    linkElement,
    title,
    openEphemeral,
  }
}
