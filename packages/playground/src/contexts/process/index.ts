export { DEFAULT_ICON, default as processDirectory } from './directory'
export type { AppId } from './directory'
export { default as ephemeralDirectory } from './ephemeral-directory'
export type { EphemeralAppId } from './ephemeral-directory'
export { useProcess, useProcessActions, useProcesses, useProcessList } from './hooks'
// Barrel re-exports for the process context module
export { ProcessProvider } from './provider'
export type { AppIcon, Process, ProcessComponentProps, ProcessContextActions, Processes } from './types'
