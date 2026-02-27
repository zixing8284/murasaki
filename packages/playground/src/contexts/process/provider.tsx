import type { ReactNode } from 'react'
import type { ProcessState } from './functions'
import type { ProcessContextValue } from './types'
import { useMemo, useState } from 'react'
import { ProcessContext } from './context'
import { createProcessActions, INITIAL_PROCESS_STATE } from './functions'

/**
 * ProcessProvider — wraps the application tree and provides process
 * lifecycle state + actions via React context.
 *
 * Inspired by daedalOS's ProcessProvider pattern.
 */
export function ProcessProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [state, setState] = useState<ProcessState>(INITIAL_PROCESS_STATE)

  // Actions are stable — they only close over the stable setState dispatcher
  const actions = useMemo(() => createProcessActions(setState), [])

  const value = useMemo<ProcessContextValue>(() => ({
    processes: state.processes,
    foregroundId: state.foregroundId,
    stackOrder: state.stackOrder,
    container: state.container,
    ...actions,
  }), [state, actions])

  return (
    <ProcessContext value={value}>
      {children}
    </ProcessContext>
  )
}
