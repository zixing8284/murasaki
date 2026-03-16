import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { FieldPanel } from '../src'

describe('field-panel', () => {
  it('renders a <div> element', async () => {
    const screen = await render(<FieldPanel data-testid="panel" />)
    const el = screen.getByTestId('panel')
    await expect.element(el).toBeInTheDocument()
  })

  it('renders children content', async () => {
    const screen = await render(<FieldPanel>Content</FieldPanel>)
    await expect.element(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies shadow-border-field class by default', async () => {
    const screen = await render(<FieldPanel data-testid="panel" />)
    const el = screen.getByTestId('panel').element()
    expect(el.className).toContain('shadow-border-field')
  })

  it('forwards custom className', async () => {
    const screen = await render(<FieldPanel data-testid="panel" className="p-4 flex" />)
    const el = screen.getByTestId('panel').element()
    expect(el.className).toContain('p-4')
    expect(el.className).toContain('flex')
  })

  it('forwards native HTML attributes', async () => {
    const screen = await render(
      <FieldPanel data-testid="panel" aria-label="Work area" role="region" />,
    )
    const el = screen.getByTestId('panel')
    await expect.element(el).toHaveAttribute('aria-label', 'Work area')
    await expect.element(el).toHaveAttribute('role', 'region')
  })

  it('forwards ref to the underlying div', async () => {
    let ref: HTMLDivElement | null = null
    await render(
      <FieldPanel
        ref={(el) => {
          ref = el
        }}
        data-testid="panel"
      />,
    )
    expect(ref).toBeInstanceOf(HTMLDivElement)
  })

  it('does not apply layout or sizing classes by default', async () => {
    const screen = await render(<FieldPanel data-testid="panel" />)
    const el = screen.getByTestId('panel').element()
    const classes = el.className
    // Should not have flex, grid, overflow, padding, or width/height classes
    expect(classes).not.toContain('flex')
    expect(classes).not.toContain('grid')
    expect(classes).not.toContain('overflow')
    expect(classes).not.toMatch(/\bp-\d/)
    expect(classes).not.toMatch(/\bw-/)
    expect(classes).not.toMatch(/\bh-/)
  })

  it('applies disabled styles when disabled', async () => {
    const screen = await render(<FieldPanel data-testid="panel" disabled />)
    const el = screen.getByTestId('panel')
    await expect.element(el).toHaveAttribute('aria-disabled', 'true')
    const classes = el.element().className
    expect(classes).toContain('bg-(--button-face)')
    expect(classes).toContain('text-(--button-shadow)')
  })

  it('does not set aria-disabled when not disabled', async () => {
    const screen = await render(<FieldPanel data-testid="panel" />)
    const el = screen.getByTestId('panel')
    expect(el.element().hasAttribute('aria-disabled')).toBe(false)
  })
})
