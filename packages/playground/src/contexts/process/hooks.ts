import type {
  Process,
  ProcessContextActions,
  ProcessContextState,
  ProcessContextValue,
} from './types'
import { use } from 'react'
import { ProcessActionsContext, ProcessStateContext } from './context'

function useProcessState(): ProcessContextState {
  const ctx = use(ProcessStateContext)
  if (!ctx) {
    throw new Error('useProcesses / useProcess must be used within a <ProcessProvider>')
  }
  return ctx
}

/**
 * Access the full process context — state + actions.
 * Equivalent to daedalOS's `useProcesses()`.
 *
 * Prefer `useProcessActions()` when you only invoke actions: it skips
 * subscribing to the reactive state context and avoids re-renders on
 * unrelated process changes.
 */
export function useProcesses(): ProcessContextValue {
  const state = useProcessState()
  const actions = useProcessActions()
  return { ...state, ...actions }
}

/**
 * Get a single process's state plus derived active/zIndex info.
 */
export function useProcess(id: string): {
  process: Process
  isActive: boolean
  zIndex: number
} | null {
  const { processes, foregroundId, stackOrder } = useProcessState()
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
 * Get just the action functions — never re-renders on state changes because
 * the actions context value is stable for the provider's lifetime.
 */
export function useProcessActions(): ProcessContextActions {
  const ctx = use(ProcessActionsContext)
  if (!ctx) {
    throw new Error('useProcessActions must be used within a <ProcessProvider>')
  }
  return ctx
}

/**
 * Get a flat list of running processes (with PID attached).
 */
export function useProcessList(): (Process & { id: string })[] {
  const { processes } = useProcessState()
  return Object.entries(processes)
    .filter(([, proc]) => !proc.ephemeral)
    .map(([id, proc]) => ({ ...proc, id }))
}
