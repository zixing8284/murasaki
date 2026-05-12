import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { Checkbox } from '../src'

describe('checkbox', () => {
  // === Rendering ===

  it('renders a checkbox input and a label', async () => {
    const screen = await render(<Checkbox>Accept terms</Checkbox>)
    const checkbox = screen.getByRole('checkbox')
    await expect.element(checkbox).toBeInTheDocument()
    // The label text should be visible
    await expect.element(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('links input and label via matching id/htmlFor', async () => {
    const screen = await render(<Checkbox>Option</Checkbox>)
    const checkbox = screen.getByRole('checkbox')
    const id = checkbox.element().id
    // id should be auto-generated and non-empty
    expect(id).toBeTruthy()
    // A label element with matching htmlFor should exist
    const label = screen.container.querySelector(`label[for="${id}"]`)
    expect(label).not.toBeNull()
  })

  it('uses custom id when provided', async () => {
    const screen = await render(<Checkbox id="my-checkbox">Custom</Checkbox>)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox.element().id).toBe('my-checkbox')
    // Label should also point to the custom id
    const label = screen.container.querySelector('label[for="my-checkbox"]')
    expect(label).not.toBeNull()
  })

  // === Uncontrolled mode ===

  it('toggles checked state when clicked (uncontrolled)', async () => {
    const screen = await render(<Checkbox>Toggle me</Checkbox>)
    const checkbox = screen.getByRole('checkbox')

    // Initially unchecked
    await expect.element(checkbox).not.toBeChecked()

    // The checkbox input is visually hidden (opacity-0), so we click the label instead.
    // This matches real user behavior — users click the visible label text.
    await screen.getByText('Toggle me').click()
    await expect.element(checkbox).toBeChecked()

    // Click label again to uncheck
    await screen.getByText('Toggle me').click()
    await expect.element(checkbox).not.toBeChecked()
  })

  // === Controlled mode ===

  it('reflects controlled checked prop', async () => {
    const screen = await render(
      <Checkbox checked onCheckedChange={() => {}}>Controlled</Checkbox>,
    )
    const checkbox = screen.getByRole('checkbox')
    await expect.element(checkbox).toBeChecked()
  })

  it('calls onCheckedChange with the next checked state', async () => {
    const handleChange = vi.fn()
    const screen = await render(
      <Checkbox checked={false} onCheckedChange={handleChange}>Controlled</Checkbox>,
    )
    // Click the label (the input is visually hidden with opacity-0)
    await screen.getByText('Controlled').click()
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  // === Disabled state ===

  it('renders as disabled', async () => {
    const screen = await render(<Checkbox disabled>Disabled</Checkbox>)
    const checkbox = screen.getByRole('checkbox')
    await expect.element(checkbox).toBeDisabled()
  })

  it('does not toggle when disabled', async () => {
    const handleChange = vi.fn()
    const screen = await render(
      <Checkbox disabled onCheckedChange={handleChange}>Disabled</Checkbox>,
    )
    // Native click on label — Playwright refuses to click labels linked to disabled inputs.
    // This verifies that the disabled input ignores the forwarded click.
    ;(screen.getByText('Disabled').element() as HTMLElement).click()
    expect(handleChange).not.toHaveBeenCalled()
  })

  // === Label click ===

  it('toggles checkbox when label text is clicked', async () => {
    const screen = await render(<Checkbox>Click label</Checkbox>)
    const checkbox = screen.getByRole('checkbox')

    await expect.element(checkbox).not.toBeChecked()
    // Click the label text instead of the input
    await screen.getByText('Click label').click()
    await expect.element(checkbox).toBeChecked()
  })
})
