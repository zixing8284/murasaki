import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { TextBox } from '../src'

describe('text-box', () => {
  // === Rendering ===

  it('renders an input element', async () => {
    const screen = await render(<TextBox />)
    const input = screen.getByRole('textbox')
    await expect.element(input).toBeInTheDocument()
  })

  it('renders with default type "text"', async () => {
    const screen = await render(<TextBox />)
    const input = screen.getByRole('textbox')
    await expect.element(input).toHaveAttribute('type', 'text')
  })

  it('renders with specified type', async () => {
    const screen = await render(<TextBox type="email" />)
    const input = screen.getByRole('textbox')
    await expect.element(input).toHaveAttribute('type', 'email')
  })

  it('renders children content as label', async () => {
    const screen = await render(<TextBox>Name</TextBox>)
    await expect.element(screen.getByText('Name')).toBeInTheDocument()
  })

  it('renders label prop as label', async () => {
    const screen = await render(<TextBox label="Email" />)
    await expect.element(screen.getByText('Email')).toBeInTheDocument()
  })

  it('links label and input via htmlFor/id', async () => {
    const screen = await render(<TextBox id="my-input">Label</TextBox>)
    const input = screen.getByRole('textbox')
    expect(input.element().id).toBe('my-input')
    const label = screen.container.querySelector('label[for="my-input"]')
    expect(label).not.toBeNull()
  })

  // === Without label ===

  it('renders input only when no label is provided', async () => {
    const screen = await render(<TextBox data-testid="input" />)
    const input = screen.getByTestId('input')
    await expect.element(input).toBeInTheDocument()
    // Should not render a wrapper div
    const labels = screen.container.querySelectorAll('label')
    expect(labels.length).toBe(0)
  })

  // === Multiline ===

  it('renders textarea when multiline is true', async () => {
    const screen = await render(<TextBox multiline />)
    const textarea = screen.getByRole('textbox')
    await expect.element(textarea).toBeInTheDocument()
    expect(textarea.element().tagName.toLowerCase()).toBe('textarea')
  })

  it('applies rows attribute to textarea', async () => {
    const screen = await render(<TextBox multiline rows={5} />)
    const textarea = screen.getByRole('textbox')
    await expect.element(textarea).toHaveAttribute('rows', '5')
  })

  // === Interaction ===

  it('calls onValueChange with the next input value', async () => {
    const handleChange = vi.fn()
    const screen = await render(<TextBox onValueChange={handleChange} />)
    const input = screen.getByRole('textbox')
    await input.fill('hello')
    expect(handleChange).toHaveBeenLastCalledWith('hello')
  })

  it('calls onValueChange with the next textarea value', async () => {
    const handleChange = vi.fn()
    const screen = await render(<TextBox multiline onValueChange={handleChange} />)
    const textarea = screen.getByRole('textbox')
    await textarea.fill('hello')
    expect(handleChange).toHaveBeenLastCalledWith('hello')
  })

  // === Disabled state ===

  it('renders as disabled', async () => {
    const screen = await render(<TextBox disabled />)
    const input = screen.getByRole('textbox')
    await expect.element(input).toBeDisabled()
  })

  // === ReadOnly state ===

  it('renders as read-only', async () => {
    const screen = await render(<TextBox readOnly value="read me" />)
    const input = screen.getByRole('textbox')
    await expect.element(input).toHaveAttribute('readonly')
  })

  // === Label position ===

  it('applies label position classes', async () => {
    const screen = await render(
      <div data-testid="wrapper">
        <TextBox label="Top label" labelPosition="top" />
      </div>,
    )
    const wrapper = screen.getByTestId('wrapper').element()
    expect(wrapper.firstElementChild?.className).toContain('flex-col')
  })

  // === Custom className ===

  it('forwards custom className', async () => {
    const screen = await render(<TextBox className="my-class" />)
    const input = screen.getByRole('textbox')
    const classes = input.element().className
    expect(classes).toContain('my-class')
  })
})
