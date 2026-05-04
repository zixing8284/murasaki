import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { Select } from '../src'

// Reusable options for test cases
const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

const scrollOptions = Array.from({ length: 12 }, (_, index) => ({
  value: `item-${index + 1}`,
  label: `Item ${index + 1}`,
}))

describe('select', () => {
  // === Rendering ===

  it('renders a combobox trigger button', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toBeInTheDocument()
  })

  it('displays the first option by default when no value/defaultValue', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toHaveTextContent('Apple')
  })

  it('displays defaultValue option label initially', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} defaultValue="banana" />,
    )
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toHaveTextContent('Banana')
  })

  it('renders aria-expanded="false" when closed', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  // === Open / Close ===

  it('opens the menu on trigger click (aria-expanded="true")', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    const trigger = screen.getByRole('combobox')
    await trigger.click()

    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
    // Listbox should now be visible
    await expect.element(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('renders all options in the listbox when open', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    await screen.getByRole('combobox').click()

    const options = screen.container.querySelectorAll('[role="option"]')
    expect(options).toHaveLength(3)
  })

  it('keeps custom scrollbar inside the select menu layer', async () => {
    const screen = await render(
      <Select name="items" options={scrollOptions} menuMaxHeight={64} width={160} />,
    )
    await screen.getByRole('combobox').click()

    const listbox = screen.getByRole('listbox').element() as HTMLUListElement
    const menuLayer = listbox.parentElement as HTMLDivElement

    await vi.waitFor(() => {
      const vBar = screen.container.querySelector('[data-murasaki-vbar]') as HTMLElement | null
      expect(vBar).not.toBeNull()
      expect(getComputedStyle(vBar!).display).toBe('block')
      expect(vBar!.parentElement).toBe(menuLayer)
      expect(listbox.hasAttribute('data-murasaki-scrollbar-id')).toBe(true)

      const menuLayerRect = menuLayer.getBoundingClientRect()
      const listboxRect = listbox.getBoundingClientRect()
      const vBarRect = vBar!.getBoundingClientRect()

      expect(menuLayerRect.height).toBeGreaterThan(0)
      expect(listboxRect.height).toBeGreaterThan(0)
      expect(listbox.clientHeight).toBeLessThanOrEqual(64)
      expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight)
      expect(vBarRect.left).toBeGreaterThanOrEqual(menuLayerRect.left)
      expect(vBarRect.right).toBeLessThanOrEqual(menuLayerRect.right + 0.5)
      expect(vBarRect.top).toBeGreaterThanOrEqual(menuLayerRect.top)
      expect(vBarRect.bottom).toBeLessThanOrEqual(menuLayerRect.bottom + 0.5)
    })
  })

  it('closes the menu when an option is clicked', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    const trigger = screen.getByRole('combobox')
    await trigger.click()

    // Click the second option
    await screen.getByRole('option', { name: 'Banana' }).click()

    // Menu should be closed
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    // Trigger should now show the selected option
    await expect.element(trigger).toHaveTextContent('Banana')
  })

  // === Selection ===

  it('updates display when an option is selected (uncontrolled)', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    const trigger = screen.getByRole('combobox')
    await trigger.click()
    await screen.getByRole('option', { name: 'Cherry' }).click()
    await expect.element(trigger).toHaveTextContent('Cherry')
  })

  it('updates the hidden input value on selection', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    await screen.getByRole('combobox').click()
    await screen.getByRole('option', { name: 'Banana' }).click()

    // The hidden input carries the selected value for form submission
    const hiddenInput = screen.container.querySelector(
      'input[type="hidden"][name="fruit"]',
    ) as HTMLInputElement
    expect(hiddenInput.value).toBe('banana')
  })

  // === Controlled mode ===

  it('reflects controlled value', async () => {
    const screen = await render(
      <Select
        name="fruit"
        options={fruitOptions}
        value="cherry"
        onChange={() => {}}
      />,
    )
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toHaveTextContent('Cherry')
  })

  it('calls onChange when an option is selected', async () => {
    const handleChange = vi.fn()
    const screen = await render(
      <Select
        name="fruit"
        options={fruitOptions}
        value="apple"
        onChange={handleChange}
      />,
    )
    await screen.getByRole('combobox').click()
    await screen.getByRole('option', { name: 'Cherry' }).click()

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'cherry', label: 'Cherry' }),
    )
  })

  // === Disabled ===

  it('does not open when disabled', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} disabled />,
    )
    const trigger = screen.getByRole('combobox')
    // Use native click — Playwright refuses to click disabled buttons
    ;(trigger.element() as HTMLElement).click()
    // Menu should NOT appear
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.container.querySelector('[role="listbox"]')).toBeNull()
  })

  // === Keyboard navigation ===

  it('opens menu on Enter key', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    const trigger = screen.getByRole('combobox')
    await trigger.element().focus()
    await userEvent.keyboard('{Enter}')

    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens menu on ArrowDown key', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    const trigger = screen.getByRole('combobox')
    await trigger.element().focus()
    await userEvent.keyboard('{ArrowDown}')

    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes menu on Escape key', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    const trigger = screen.getByRole('combobox')
    await trigger.click()
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')

    // Press Escape — focus may have moved to an option, so press on document
    await userEvent.keyboard('{Escape}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('selects option with Enter key after navigating with ArrowDown', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} />,
    )
    const trigger = screen.getByRole('combobox')
    await trigger.element().focus()

    // Open the menu via keyboard
    await userEvent.keyboard('{Enter}')

    // Wait for menu to appear and first option to be focused
    await vi.waitFor(() => {
      const listbox = screen.container.querySelector('[role="listbox"]')
      expect(listbox).not.toBeNull()
    })

    // ArrowDown moves focus from Apple (index 0) to Banana (index 1)
    await userEvent.keyboard('{ArrowDown}')

    // Wait for Banana to receive focus
    await vi.waitFor(() => {
      const focused = screen.container.querySelector('[role="option"]:focus') as HTMLElement
      expect(focused?.textContent).toBe('Banana')
    })

    // Enter selects the focused option and closes the menu
    await userEvent.keyboard('{Enter}')

    await vi.waitFor(() => {
      expect(trigger.element().getAttribute('aria-expanded')).toBe('false')
    })
    await expect.element(trigger).toHaveTextContent('Banana')
  })

  // === Callbacks ===

  it('calls onOpen / onClose callbacks', async () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()
    const screen = await render(
      <Select
        name="fruit"
        options={fruitOptions}
        onOpen={onOpen}
        onClose={onClose}
      />,
    )
    const trigger = screen.getByRole('combobox')

    // Open
    await trigger.click()
    expect(onOpen).toHaveBeenCalledOnce()

    // Select an option (closes)
    await screen.getByRole('option', { name: 'Banana' }).click()
    expect(onClose).toHaveBeenCalledOnce()
  })

  // === formatDisplay ===

  it('uses formatDisplay for custom trigger text', async () => {
    const screen = await render(
      <Select
        name="fruit"
        options={fruitOptions}
        defaultValue="cherry"
        formatDisplay={opt => `Selected: ${opt.label}`}
      />,
    )
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toHaveTextContent('Selected: Cherry')
  })

  // === Label ===

  it('renders a label element when label prop is provided', async () => {
    const screen = await render(
      <Select name="fruit" options={fruitOptions} label="Pick fruit" />,
    )
    await expect.element(screen.getByText('Pick fruit')).toBeInTheDocument()
    // The label should be associated with the trigger via htmlFor
    const label = screen.container.querySelector('label')
    expect(label).not.toBeNull()
    const trigger = screen.getByRole('combobox')
    expect(label!.htmlFor).toBe(trigger.element().id)
  })
})
