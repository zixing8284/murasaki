import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { Tooltip } from '../src'

function installAnimationFrameController(): {
  count: () => number
  flushPending: () => void
  restore: () => void
} {
  const originalRequestAnimationFrame = window.requestAnimationFrame
  const originalCancelAnimationFrame = window.cancelAnimationFrame
  const callbacks = new Map<number, FrameRequestCallback>()
  let nextId = 1

  window.requestAnimationFrame = ((callback: FrameRequestCallback): number => {
    const id = nextId++
    callbacks.set(id, callback)
    return id
  }) as typeof window.requestAnimationFrame

  window.cancelAnimationFrame = ((id: number): void => {
    callbacks.delete(id)
  }) as typeof window.cancelAnimationFrame

  return {
    count: () => callbacks.size,
    flushPending: () => {
      const pendingIds = Array.from(callbacks.keys())
      for (const id of pendingIds) {
        const callback = callbacks.get(id)
        if (!callback)
          continue
        callbacks.delete(id)
        callback(performance.now())
      }
    },
    restore: () => {
      callbacks.clear()
      window.requestAnimationFrame = originalRequestAnimationFrame
      window.cancelAnimationFrame = originalCancelAnimationFrame
    },
  }
}

describe('tooltip', () => {
  // === Rendering ===

  it('renders the trigger element', async () => {
    const screen = await render(
      <Tooltip text="Save file">
        <button>Save</button>
      </Tooltip>,
    )
    await expect.element(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does not show tooltip by default', async () => {
    await render(
      <Tooltip text="Save file">
        <button>Save</button>
      </Tooltip>,
    )
    expect(document.querySelector('[role="tooltip"]')).toBeNull()
  })

  // === Accessibility ===

  it('does not override aria-label on the trigger', async () => {
    const screen = await render(
      <Tooltip text="Save file">
        <button>Save</button>
      </Tooltip>,
    )
    const btn = screen.getByRole('button')
    expect(btn.element().hasAttribute('aria-label')).toBe(false)
  })

  it('preserves consumer-set aria-label on the trigger', async () => {
    const screen = await render(
      <Tooltip text="Save file">
        <button aria-label="Save document">Save</button>
      </Tooltip>,
    )
    const btn = screen.getByRole('button')
    await expect.element(btn).toHaveAttribute('aria-label', 'Save document')
  })

  it('tooltip popup has role="tooltip"', async () => {
    const screen = await render(
      <Tooltip text="Save file" delay={0}>
        <button>Save</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button').element())
    // Wait for tooltip to appear
    await expect.element(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('sets aria-describedby on wrapper when tooltip is visible', async () => {
    const screen = await render(
      <Tooltip text="Save file" delay={0}>
        <button>Save</button>
      </Tooltip>,
    )
    const btn = screen.getByRole('button')
    const wrapper = btn.element().parentElement!
    // Before hover — no aria-describedby
    expect(wrapper.getAttribute('aria-describedby')).toBeNull()

    await userEvent.hover(btn.element())
    await expect.element(screen.getByRole('tooltip')).toBeInTheDocument()

    // After hover — aria-describedby on wrapper references the tooltip
    const tooltipEl = screen.getByRole('tooltip').element()
    expect(wrapper.getAttribute('aria-describedby')).toBe(tooltipEl.id)
  })

  // === Show / Hide ===

  it('shows tooltip on pointer enter after delay', async () => {
    const screen = await render(
      <Tooltip text="Help text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button').element())
    await expect.element(screen.getByRole('tooltip')).toBeInTheDocument()
    await expect.element(screen.getByText('Help text')).toBeVisible()
  })

  it('hides tooltip on pointer leave', async () => {
    const screen = await render(
      <Tooltip text="Help text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button').element())
    await expect.element(screen.getByRole('tooltip')).toBeInTheDocument()

    await userEvent.unhover(screen.getByRole('button').element())
    expect(document.querySelector('[role="tooltip"]')).toBeNull()
  })

  it('shows tooltip on focus', async () => {
    const screen = await render(
      <Tooltip text="Focused help" delay={0}>
        <button>Focus me</button>
      </Tooltip>,
    )
    screen.getByRole('button').element().focus()
    await expect.element(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('hides tooltip on blur', async () => {
    const screen = await render(
      <Tooltip text="Focused help" delay={0}>
        <button>Focus me</button>
      </Tooltip>,
    )
    screen.getByRole('button').element().focus()
    await expect.element(screen.getByRole('tooltip')).toBeInTheDocument()

    screen.getByRole('button').element().blur()
    await expect.poll(() => document.querySelector('[role="tooltip"]')).toBeNull()
  })

  it('hides tooltip on Escape key', async () => {
    const screen = await render(
      <Tooltip text="Escape me" delay={0}>
        <button>Press Escape</button>
      </Tooltip>,
    )
    // Focus the button so keyboard events are dispatched on it
    screen.getByRole('button').element().focus()
    await expect.element(screen.getByRole('tooltip')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.querySelector('[role="tooltip"]')).toBeNull()
  })

  // === Tooltip content ===

  it('displays the text prop as tooltip content', async () => {
    const screen = await render(
      <Tooltip text="Detailed description" delay={0}>
        <button>Info</button>
      </Tooltip>,
    )
    await userEvent.hover(screen.getByRole('button').element())
    await expect.element(screen.getByText('Detailed description')).toBeInTheDocument()
  })

  it('supports left and right preferred sides', async () => {
    const leftScreen = await render(
      <Tooltip text="Left side" side="left" delay={0}>
        <button>Left trigger</button>
      </Tooltip>,
    )

    await userEvent.hover(leftScreen.getByRole('button', { name: 'Left trigger' }).element())
    await expect.element(leftScreen.getByText('Left side')).toBeInTheDocument()

    await userEvent.unhover(leftScreen.getByRole('button', { name: 'Left trigger' }).element())
    await expect.poll(() => document.querySelector('[role="tooltip"]')).toBeNull()

    const rightScreen = await render(
      <Tooltip text="Right side" side="right" delay={0}>
        <button>Right trigger</button>
      </Tooltip>,
    )

    await userEvent.hover(rightScreen.getByRole('button', { name: 'Right trigger' }).element())
    await expect.element(rightScreen.getByText('Right side')).toBeInTheDocument()
  })

  it('uses the measured tooltip width for the first visible position', async () => {
    const screen = await render(
      <div style={{ paddingLeft: 220, paddingTop: 120 }}>
        <Tooltip text="Short" side="bottom" delay={0}>
          <button>Measured trigger</button>
        </Tooltip>
      </div>,
    )
    const trigger = screen.getByRole('button', { name: 'Measured trigger' }).element()
    const frames = installAnimationFrameController()

    try {
      await userEvent.hover(trigger)
      await vi.waitFor(() => {
        const measuringTooltip = Array.from(document.body.querySelectorAll<HTMLElement>('span'))
          .find(element => element.textContent === 'Short' && element.getAttribute('aria-hidden') === 'true')
        expect(measuringTooltip).not.toBeNull()
      })
      await vi.waitFor(() => expect(frames.count()).toBeGreaterThan(0))
      frames.flushPending()
      await vi.waitFor(() => expect(document.querySelector('[role="tooltip"]')).not.toBeNull())

      const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]')
      expect(tooltip).not.toBeNull()

      const wrapperRect = trigger.parentElement!.getBoundingClientRect()
      const tooltipWidth = tooltip!.clientWidth
      const expectedLeft = wrapperRect.left + wrapperRect.width / 2 - tooltipWidth / 2

      expect(Number.parseFloat(tooltip!.style.left)).toBeCloseTo(expectedLeft, 0)
    }
    finally {
      frames.restore()
    }
  })

  // === Event forwarding ===

  it('forwards existing event handlers on the trigger', async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <Tooltip text="Click me tooltip" delay={0}>
        <button onClick={handleClick}>Click</button>
      </Tooltip>,
    )
    await screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
