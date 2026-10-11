import type { ReactNode } from 'react'
import { ScrollArea, TabPanel } from '@murasaki-io/react98'

interface ScrollableTabPanelProps {
  value: string
  /** Extra classes for the padded body (e.g. the `gap-*` between rows). */
  className?: string
  children: ReactNode
}

/**
 * A Display Properties tab page whose body scrolls with the library's themed
 * Win98 scrollbar when it exceeds the (work-area-capped) dialog height, so the
 * tab strip and the dialog command bar stay fixed. See ADR 0014.
 */
export function ScrollableTabPanel({ value, className, children }: ScrollableTabPanelProps): React.ReactElement {
  return (
    <TabPanel value={value} className="flex min-h-0 flex-col p-0">
      <ScrollArea className="min-h-0 flex-1">
        <div className={`flex flex-col p-3${className ? ` ${className}` : ''}`}>
          {children}
        </div>
      </ScrollArea>
    </TabPanel>
  )
}
