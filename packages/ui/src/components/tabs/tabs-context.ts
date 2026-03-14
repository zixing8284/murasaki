import { createContext, use } from 'react'

export interface TabsContextValue {
  /** The currently selected tab value */
  selectedValue: string
  /** Callback to change the selected tab */
  setSelectedValue: (value: string) => void
  /** Base ID for generating unique IDs for tabs and panels */
  baseId: string
  /** Whether non-selected panels stay mounted in the DOM */
  keepMounted: boolean
}

export const TabsContext = createContext<TabsContextValue | null>(null)

export function useTabsContext(): TabsContextValue {
  const context = use(TabsContext)
  if (!context) {
    throw new Error('Tabs compound components must be used within Tabs')
  }
  return context
}
