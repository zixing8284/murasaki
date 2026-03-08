import type { Dispatch, SetStateAction } from 'react'
import type { ProcessContextActions, Processes } from './types'
import directory, { DEFAULT_ICON } from './directory'

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

  const icon: ProcessContextActions['icon'] = (id, newIcon) => {
    setState((prev) => {
      if (!prev.processes[id])
        return prev
      return {
        ...prev,
        processes: { ...prev.processes, [id]: { ...prev.processes[id], icon: newIcon } },
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

      // Create new process
      const process: Processes[string] = {
        appId,
        title: overrides?.title ?? entry.defaultTitle,
        icon: overrides?.icon ?? entry.defaultIcon ?? DEFAULT_ICON,
        minimized: false,
        maximized: false,
        componentWindow: null,
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

  return {
    open,
    close,
    activate,
    minimize,
    toggleMaximize,
    restore,
    deactivateAll,
    handleTaskbarClick,
    setContainer,
    linkElement,
    title,
    icon,
  }
}
