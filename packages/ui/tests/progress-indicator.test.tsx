import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { ProgressIndicator } from '../src'

describe('progress-indicator', () => {
  it('renders progressbar semantics', async () => {
    const screen = await render(<ProgressIndicator value={42} />)
    const progress = screen.getByRole('progressbar')

    await expect.element(progress).toHaveAttribute('aria-valuemin', '0')
    await expect.element(progress).toHaveAttribute('aria-valuemax', '100')
    await expect.element(progress).toHaveAttribute('aria-valuenow', '42')
  })

  it('clamps values above 100 down to 100', async () => {
    const screen = await render(<ProgressIndicator value={120} />)
    await expect.element(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('clamps values below 0 up to 0', async () => {
    const screen = await render(<ProgressIndicator value={-10} />)
    await expect.element(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('shows rounded percentage text in default variant', async () => {
    const screen = await render(<ProgressIndicator value={42.6} />)
    expect(screen.container.textContent).toContain('43%')
  })

  it('hides percentage text when hideValue is true', async () => {
    const screen = await render(<ProgressIndicator value={42} hideValue />)
    expect(screen.container.textContent).not.toContain('%')
  })

  it('renders tile variant marker', async () => {
    const screen = await render(<ProgressIndicator value={50} variant="tile" />)
    await expect.element(screen.getByRole('progressbar')).toHaveAttribute('data-variant', 'tile')
    expect(screen.container.textContent).not.toContain('%')
  })
})
