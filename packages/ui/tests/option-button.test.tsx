import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { OptionButton, OptionGroup } from '../src'

describe('option-button', () => {
  // === Rendering ===

  it('renders a radio input and a label', async () => {
    const screen = await render(
      <OptionGroup name="test" value="a">
        <OptionButton value="a">Option A</OptionButton>
      </OptionGroup>,
    )
    const radio = screen.getByRole('radio')
    await expect.element(radio).toBeInTheDocument()
    await expect.element(screen.getByText('Option A')).toBeInTheDocument()
  })

  it('links input and label via matching id/htmlFor', async () => {
    const screen = await render(
      <OptionGroup name="test" value="a">
        <OptionButton value="a">Option A</OptionButton>
      </OptionGroup>,
    )
    const radio = screen.getByRole('radio')
    const id = radio.element().id
    expect(id).toBeTruthy()
    const label = screen.container.querySelector(`label[for="${id}"]`)
    expect(label).not.toBeNull()
  })

  it('uses custom id when provided', async () => {
    const screen = await render(
      <OptionGroup name="test" value="a">
        <OptionButton id="my-radio" value="a">Custom</OptionButton>
      </OptionGroup>,
    )
    const radio = screen.getByRole('radio')
    expect(radio.element().id).toBe('my-radio')
  })

  // === Dot visibility (critical CSS + state test) ===

  it('shows dot SVG when radio is checked', async () => {
    const screen = await render(
      <OptionGroup name="test" value="a">
        <OptionButton value="a">Option A</OptionButton>
        <OptionButton value="b">Option B</OptionButton>
      </OptionGroup>,
    )

    // Option A is checked
    const radioA = screen.getByRole('radio', { name: 'Option A' })
    expect((radioA.element() as HTMLInputElement).checked).toBe(true)

    const labelA = screen.container.querySelector(`label[for="${radioA.element().id}"]`)!
    const svgsA = labelA.querySelectorAll('svg')
    expect(svgsA.length).toBe(2)

    // Dot SVG (second) should be visible when checked
    const dotA = svgsA[1]
    expect(window.getComputedStyle(dotA).display).not.toBe('none')

    // Option B is NOT checked — its dot should be hidden
    const radioB = screen.getByRole('radio', { name: 'Option B' })
    expect((radioB.element() as HTMLInputElement).checked).toBe(false)
    const labelB = screen.container.querySelector(`label[for="${radioB.element().id}"]`)!
    const dotB = labelB.querySelectorAll('svg')[1]
    expect(window.getComputedStyle(dotB).display).toBe('none')
  })

  it('shows dot after clicking to select a different option', async () => {
    const onValueChange = vi.fn()
    const screen = await render(
      <OptionGroup name="test" value="a" onValueChange={onValueChange}>
        <OptionButton value="a">Option A</OptionButton>
        <OptionButton value="b">Option B</OptionButton>
      </OptionGroup>,
    )

    // Click Option B label
    await screen.getByText('Option B').click()
    expect(onValueChange).toHaveBeenCalledWith('b')

    // Re-render with updated value
    await screen.rerender(
      <OptionGroup name="test" value="b" onValueChange={onValueChange}>
        <OptionButton value="a">Option A</OptionButton>
        <OptionButton value="b">Option B</OptionButton>
      </OptionGroup>,
    )

    // Now Option B should be checked and its dot visible
    const radioB = screen.getByRole('radio', { name: 'Option B' })
    expect((radioB.element() as HTMLInputElement).checked).toBe(true)
    const labelB = screen.container.querySelector(`label[for="${radioB.element().id}"]`)!
    const dotB = labelB.querySelectorAll('svg')[1]
    expect(window.getComputedStyle(dotB).display).not.toBe('none')

    // Option A should be unchecked and its dot hidden
    const radioA = screen.getByRole('radio', { name: 'Option A' })
    expect((radioA.element() as HTMLInputElement).checked).toBe(false)
    const labelA = screen.container.querySelector(`label[for="${radioA.element().id}"]`)!
    const dotA = labelA.querySelectorAll('svg')[1]
    expect(window.getComputedStyle(dotA).display).toBe('none')
  })

  // === Controlled mode ===

  it('reflects controlled value', async () => {
    const screen = await render(
      <OptionGroup name="test" value="b">
        <OptionButton value="a">A</OptionButton>
        <OptionButton value="b">B</OptionButton>
      </OptionGroup>,
    )
    const radioA = screen.getByRole('radio', { name: 'A' })
    const radioB = screen.getByRole('radio', { name: 'B' })
    await expect.element(radioA).not.toBeChecked()
    await expect.element(radioB).toBeChecked()
  })

  it('calls onValueChange when clicked', async () => {
    const handleChange = vi.fn()
    const screen = await render(
      <OptionGroup name="test" value="a" onValueChange={handleChange}>
        <OptionButton value="a">A</OptionButton>
        <OptionButton value="b">B</OptionButton>
      </OptionGroup>,
    )
    await screen.getByText('B').click()
    expect(handleChange).toHaveBeenCalledWith('b')
  })

  // === Disabled state ===

  it('renders as disabled', async () => {
    const screen = await render(
      <OptionGroup name="test" value="a">
        <OptionButton value="a" disabled>Disabled</OptionButton>
      </OptionGroup>,
    )
    const radio = screen.getByRole('radio')
    await expect.element(radio).toBeDisabled()
  })

  it('does not fire onValueChange when disabled', async () => {
    const handleChange = vi.fn()
    const screen = await render(
      <OptionGroup name="test" value="a" onValueChange={handleChange}>
        <OptionButton value="b" disabled>Disabled</OptionButton>
      </OptionGroup>,
    )
    ;(screen.getByText('Disabled').element() as HTMLElement).click()
    expect(handleChange).not.toHaveBeenCalled()
  })
})
