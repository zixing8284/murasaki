import type { ReactNode } from 'react'
import type { ProcessState } from './functions'
import type { ProcessContextState } from './types'
import { useState } from 'react'
import { ProcessActionsContext, ProcessStateContext } from './context'
import { createProcessActions, INITIAL_PROCESS_STATE } from './functions'

/**
 * ProcessProvider — wraps the application tree and provides process
 * lifecycle state + actions via two split contexts:
 *
 * - `ProcessStateContext`  → reactive (re-renders on state changes)
 * - `ProcessActionsContext` → stable for the lifetime of the provider
 *
 * Splitting them lets components that only invoke actions (e.g. taskbar
 * icons, keyboard handlers) opt out of state-driven re-renders entirely.
 *
 * Inspired by daedalOS's ProcessProvider pattern.
 */
export function ProcessProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [state, setState] = useState<ProcessState>(INITIAL_PROCESS_STATE)

  // Actions only close over the stable setState dispatcher, so the value
  // identity is fixed for the provider's lifetime.
  const actions = createProcessActions(setState)

  const stateValue: ProcessContextState = {
    processes: state.processes,
    foregroundId: state.foregroundId,
    stackOrder: state.stackOrder,
    container: state.container,
  }

  return (
    <ProcessActionsContext value={actions}>
      <ProcessStateContext value={stateValue}>
        {children}
      </ProcessStateContext>
    </ProcessActionsContext>
  )
}
