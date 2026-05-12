import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { Tooltip } from '../src'

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
