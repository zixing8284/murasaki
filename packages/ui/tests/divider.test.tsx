import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { Divider } from '../src'

describe('divider', () => {
  it('renders horizontal orientation by default', async () => {
    const screen = await render(<Divider data-testid="divider" />)
    const divider = screen.getByTestId('divider').element()

    expect(divider.className).toContain('w-full')

    const borders = divider.querySelectorAll('div')
    expect(borders).toHaveLength(2)
    expect((borders[0] as HTMLElement).className).toContain('border-b')
    expect((borders[1] as HTMLElement).className).toContain('border-b')
  })

  it('renders vertical orientation', async () => {
    const screen = await render(<Divider data-testid="divider" orientation="vertical" />)
    const divider = screen.getByTestId('divider').element()

    expect(divider.className).toContain('h-full')
    expect(divider.className).toContain('flex')

    const borders = divider.querySelectorAll('div')
    expect(borders).toHaveLength(2)
    expect((borders[0] as HTMLElement).className).toContain('border-r')
    expect((borders[1] as HTMLElement).className).toContain('border-r')
  })

  it('forwards custom className and native attributes', async () => {
    const screen = await render(
      <Divider data-testid="divider" className="my-divider" aria-hidden="true" />,
    )
    const divider = screen.getByTestId('divider')

    expect(divider.element().className).toContain('my-divider')
    await expect.element(divider).toHaveAttribute('aria-hidden', 'true')
  })
})
