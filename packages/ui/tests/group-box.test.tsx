import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { GroupBox } from '../src'

describe('group-box', () => {
  it('renders children inside fieldset', async () => {
    const screen = await render(
      <GroupBox>
        <p>Content</p>
      </GroupBox>,
    )

    const fieldset = screen.container.querySelector('fieldset')
    expect(fieldset).not.toBeNull()
    await expect.element(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders legend when label is provided', async () => {
    const screen = await render(<GroupBox label="Preferences" />)
    await expect.element(screen.getByText('Preferences')).toBeInTheDocument()

    const legend = screen.container.querySelector('legend')
    expect(legend).not.toBeNull()
  })

  it('does not render legend when label is omitted', async () => {
    const screen = await render(<GroupBox />)
    const legend = screen.container.querySelector('legend')
    expect(legend).toBeNull()
  })

  it('forwards className and native attributes', async () => {
    const screen = await render(
      <GroupBox data-testid="group-box" className="my-group" aria-label="group" />,
    )
    const group = screen.getByTestId('group-box')

    expect(group.element().className).toContain('my-group')
    await expect.element(group).toHaveAttribute('aria-label', 'group')
  })
})
