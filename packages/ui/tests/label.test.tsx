import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { Label } from '../src'

describe('label', () => {
  it('renders a native label element with content', async () => {
    const screen = await render(<Label htmlFor="field">Name</Label>)
    const label = screen.getByText('Name').element()

    expect(label.tagName).toBe('LABEL')
    await expect.element(screen.getByText('Name')).toHaveAttribute('for', 'field')
  })

  it('applies the disabled visual state', async () => {
    const screen = await render(<Label disabled data-testid="label">Name</Label>)
    const label = screen.getByTestId('label').element()

    expect(label.className).toContain('text-(--gray-text)')
    await expect.element(screen.getByTestId('label')).toHaveAttribute('data-disabled', 'true')
  })

  it('forwards custom className and native attributes', async () => {
    const screen = await render(
      <Label data-testid="label" className="my-label" title="hint">Name</Label>,
    )
    const label = screen.getByTestId('label')

    expect(label.element().className).toContain('my-label')
    await expect.element(label).toHaveAttribute('title', 'hint')
  })
})
