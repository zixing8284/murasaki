import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { Button } from '../src'

describe('button', () => {
  // === Rendering ===

  it('renders a <button> element', async () => {
    const screen = await render(<Button>Click me</Button>)
    const btn = screen.getByRole('button')
    await expect.element(btn).toBeInTheDocument()
  })

  it('renders children content', async () => {
    const screen = await render(<Button>Save</Button>)
    await expect.element(screen.getByText('Save')).toBeInTheDocument()
  })

  it('forwards custom className', async () => {
    const screen = await render(<Button className="my-custom">OK</Button>)
    const btn = screen.getByRole('button')
    await expect.element(btn).toHaveAttribute('class')
    // The custom class should be included in the merged result
    const classes = btn.element().className
    expect(classes).toContain('my-custom')
  })

  it('forwards native HTML attributes (e.g. type, aria-label)', async () => {
    const screen = await render(
      <Button type="submit" aria-label="Submit form">Go</Button>,
    )
    const btn = screen.getByRole('button')
    await expect.element(btn).toHaveAttribute('type', 'submit')
    await expect.element(btn).toHaveAttribute('aria-label', 'Submit form')
  })

  // === Interaction ===

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    const screen = await render(<Button onClick={handleClick}>Click</Button>)
    await screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledOnce()
  })

  // === Disabled state ===

  it('renders with disabled attribute', async () => {
    const screen = await render(<Button disabled>Disabled</Button>)
    const btn = screen.getByRole('button')
    await expect.element(btn).toBeDisabled()
  })

  it('does not fire onClick when disabled', async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <Button disabled onClick={handleClick}>Disabled</Button>,
    )
    // Playwright won't click disabled elements by default (correct browser behavior).
    // Use fireEvent to bypass and verify the handler is never called.
    const btn = screen.getByRole('button').element() as HTMLButtonElement
    btn.click()
    expect(handleClick).not.toHaveBeenCalled()
  })

  // === Variants ===

  it('applies active variant classes when active={true}', async () => {
    const screen = await render(<Button active>Active</Button>)
    const btn = screen.getByRole('button')
    // The active variant adds shadow-sunken class
    const classes = btn.element().className
    expect(classes).toContain('shadow-sunken')
  })

  it('does not apply active classes by default', async () => {
    const screen = await render(<Button>Normal</Button>)
    const btn = screen.getByRole('button')
    // Default button should have shadow-raised (the base raised look)
    const classes = btn.element().className
    expect(classes).toContain('shadow-raised')
  })
})
