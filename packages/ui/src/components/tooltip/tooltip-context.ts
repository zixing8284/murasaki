import { createContext, use } from 'react'

/**
 * Shared state exposed by the `Tooltip` root to `TooltipTrigger` and
 * `TooltipContent`.
 *
 * @internal
 */
export interface TooltipContextValue {
  /** Whether the tooltip is currently shown. */
  open: boolean
  /** Schedule the tooltip to open after the configured delay. */
  show: () => void
  /** Hide the tooltip immediately. */
  hide: () => void
  /** The trigger wrapper element used as the positioning anchor. */
  triggerRef: React.RefObject<HTMLSpanElement | null>
  /** The portalled tooltip element. */
  contentRef: React.RefObject<HTMLSpanElement | null>
  /** Stable id linking the trigger's `aria-describedby` to the content. */
  tooltipId: string
}

export const TooltipContext = createContext<TooltipContextValue | null>(null)

/**
 * Access the surrounding {@link TooltipContextValue}.
 *
 * @throws If called outside of a `<Tooltip>` root.
 */
export function useTooltipContext(): TooltipContextValue {
  const context = use(TooltipContext)
  if (!context) {
    throw new Error('Tooltip compound components must be used within <Tooltip>')
  }
  return context
}
