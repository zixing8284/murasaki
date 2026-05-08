import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { NumberBox } from '../src'

describe('number-box', () => {
  // === Rendering ===

  it('renders a number input', async () => {
    const screen = await render(<NumberBox />)
    const input = screen.getByRole('spinbutton')
    await expect.element(input).toBeInTheDocument()
    await expect.element(input).toHaveAttribute('type', 'number')
  })

  it('renders increment and decrement buttons', async () => {
    const screen = await render(<NumberBox />)
    await expect.element(screen.getByRole('button', { name: 'Increment' })).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Decrement' })).toBeInTheDocument()
  })

  it('renders children content as label', async () => {
    const screen = await render(<NumberBox>Quantity</NumberBox>)
    await expect.element(screen.getByText('Quantity')).toBeInTheDocument()
  })

  it('renders label prop as label', async () => {
    const screen = await render(<NumberBox label="Amount" />)
    await expect.element(screen.getByText('Amount')).toBeInTheDocument()
  })

  it('links label and input via htmlFor/id', async () => {
    const screen = await render(<NumberBox id="my-num">Label</NumberBox>)
    const input = screen.getByRole('spinbutton')
    expect(input.element().id).toBe('my-num')
    const label = screen.container.querySelector('label[for="my-num"]')
    expect(label).not.toBeNull()
  })

  // === Without label ===

  it('renders input only when no label is provided', async () => {
    const screen = await render(<NumberBox />)
    const labels = screen.container.querySelectorAll('label')
    expect(labels.length).toBe(0)
  })

  // === Uncontrolled mode ===

  it('starts with defaultValue', async () => {
    const screen = await render(<NumberBox defaultValue={10} />)
    const input = screen.getByRole('spinbutton')
    expect((input.element() as HTMLInputElement).value).toBe('10')
  })

  it('increments value when increment button is clicked', async () => {
    const screen = await render(<NumberBox defaultValue={5} step={1} />)
    await screen.getByRole('button', { name: 'Increment' }).click()
    const input = screen.getByRole('spinbutton')
    expect((input.element() as HTMLInputElement).value).toBe('6')
  })

  it('decrements value when decrement button is clicked', async () => {
    const screen = await render(<NumberBox defaultValue={5} step={1} />)
    await screen.getByRole('button', { name: 'Decrement' }).click()
    const input = screen.getByRole('spinbutton')
    expect((input.element() as HTMLInputElement).value).toBe('4')
  })

  // === Controlled mode ===

  it('reflects controlled value', async () => {
    const screen = await render(<NumberBox value={42} onValueChange={() => {}} />)
    const input = screen.getByRole('spinbutton')
    expect((input.element() as HTMLInputElement).value).toBe('42')
  })

  it('calls onValueChange with numeric value when incremented', async () => {
    const handleChange = vi.fn()
    const screen = await render(<NumberBox value={5} step={1} onValueChange={handleChange} />)
    await screen.getByRole('button', { name: 'Increment' }).click()
    expect(handleChange).toHaveBeenCalledWith(6)
  })

  it('calls onValueChange with numeric value when decremented', async () => {
    const handleChange = vi.fn()
    const screen = await render(<NumberBox value={5} step={1} onValueChange={handleChange} />)
    await screen.getByRole('button', { name: 'Decrement' }).click()
    expect(handleChange).toHaveBeenCalledWith(4)
  })

  // === Min/Max clamping ===

  it('disables increment button at max value', async () => {
    const screen = await render(<NumberBox value={10} max={10} onValueChange={() => {}} />)
    const btn = screen.getByRole('button', { name: 'Increment' })
    await expect.element(btn).toBeDisabled()
  })

  it('disables decrement button at min value', async () => {
    const screen = await render(<NumberBox value={0} min={0} onValueChange={() => {}} />)
    const btn = screen.getByRole('button', { name: 'Decrement' })
    await expect.element(btn).toBeDisabled()
  })

  // === Disabled state ===

  it('renders as disabled', async () => {
    const screen = await render(<NumberBox disabled />)
    const input = screen.getByRole('spinbutton')
    await expect.element(input).toBeDisabled()
  })

  it('disables spinner buttons when disabled', async () => {
    const screen = await render(<NumberBox disabled />)
    await expect.element(screen.getByRole('button', { name: 'Increment' })).toBeDisabled()
    await expect.element(screen.getByRole('button', { name: 'Decrement' })).toBeDisabled()
  })

  // === ReadOnly state ===

  it('renders as read-only', async () => {
    const screen = await render(<NumberBox readOnly value={5} />)
    const input = screen.getByRole('spinbutton')
    await expect.element(input).toHaveAttribute('readonly')
  })

  it('disables spinner buttons when read-only', async () => {
    const screen = await render(<NumberBox readOnly value={5} />)
    await expect.element(screen.getByRole('button', { name: 'Increment' })).toBeDisabled()
    await expect.element(screen.getByRole('button', { name: 'Decrement' })).toBeDisabled()
  })

  // === Custom className ===

  it('forwards custom className', async () => {
    const screen = await render(<NumberBox className="my-class" />)
    const input = screen.getByRole('spinbutton')
    const classes = input.element().className
    expect(classes).toContain('my-class')
  })
})
