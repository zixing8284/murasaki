import type {
  Process,
  ProcessContextActions,
  ProcessContextValue,
} from './types'
import { use, useMemo } from 'react'
import { ProcessContext } from './context'

/**
 * Access the full process context — state + actions.
 * Equivalent to daedalOS's `useProcesses()`.
 */
export function useProcesses(): ProcessContextValue {
  const ctx = use(ProcessContext)
  if (!ctx) {
    throw new Error('useProcesses must be used within a <ProcessProvider>')
  }
  return ctx
}

/**
 * Get a single process's state plus derived active/zIndex info.
 * Replaces the old `useWindow(id)` selector.
 */
export function useProcess(id: string): {
  process: Process
  isActive: boolean
  zIndex: number
} | null {
  const { processes, foregroundId, stackOrder } = useProcesses()
  const process = processes[id]
  if (!process)
    return null
  return {
    process,
    isActive: foregroundId === id,
    zIndex: stackOrder.indexOf(id) + 1,
  }
}

/**
 * Get just the action functions — avoids re-renders when only
 * calling actions without reading state.
 * Replaces the old `useWindowActions()`.
 */
export function useProcessActions(): ProcessContextActions {
  const {
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
  } = useProcesses()

  return useMemo(() => ({
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
  }), [
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
  ])
}

/**
 * Get a flat list of running processes (with PID attached).
 * Replaces the old `useWindowList()`.
 */
export function useProcessList(): (Process & { id: string })[] {
  const { processes } = useProcesses()
  return useMemo(
    () => Object.entries(processes).map(([id, proc]) => ({ ...proc, id })),
    [processes],
  )
}
