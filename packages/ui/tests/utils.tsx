/**
 * Shared test utilities for compound components that require context providers.
 *
 * Example:
 *   const screen = await render(
 *     <TabsWrapper defaultValue="a">
 *       <Tabs.List><Tabs.Tab value="a">A</Tabs.Tab></Tabs.List>
 *       <Tabs.Panel value="a">Content A</Tabs.Panel>
 *     </TabsWrapper>
 *   )
 */
import type { ReactElement, ReactNode } from 'react'
import { Tabs } from '../src'

// ---------------------------------------------------------------------------
// Tabs wrapper — wraps children in Tabs root context (alias for Tabs)
// ---------------------------------------------------------------------------

interface TabsWrapperProps {
  children: ReactNode
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
}

export function TabsWrapper({ children, ...props }: TabsWrapperProps): ReactElement {
  return <Tabs defaultValue={props.defaultValue} value={props.value} onChange={props.onChange}>{children}</Tabs>
}
