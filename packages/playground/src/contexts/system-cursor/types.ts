/** Kinds of transient system-wide cursor states, in ascending priority. */
export type SystemCursorKind = 'working' | 'busy'

export interface SystemCursorActions {
  /**
   * Register an active source of the given cursor kind. Returns an
   * unregister function that must be called when the source is no longer
   * active. The effective body cursor reflects the highest-priority kind
   * with at least one active source (`busy` > `working`).
   */
  register: (kind: SystemCursorKind) => () => void
}
