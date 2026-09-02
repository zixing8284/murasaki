import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../src'

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

const scrollOptions = Array.from({ length: 12 }, (_, index) => ({
  value: `item-${index + 1}`,
  label: `Item ${index + 1}`,
}))

interface HelperProps {
  root?: Partial<React.ComponentProps<typeof Select>>
  trigger?: Partial<React.ComponentProps<typeof SelectTrigger>>
  content?: Partial<React.ComponentProps<typeof SelectContent>>
  placeholder?: React.ReactNode
  options?: { value: string, label: string }[]
}

function renderSelect({
  root,
  trigger,
  content,
  placeholder = 'Select…',
  options = fruitOptions,
}: HelperProps = {}) {
  return render(
    <Select name="fruit" {...root}>
      <SelectTrigger {...trigger}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent {...content}>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>,
  )
}

describe('select', () => {
  // === Rendering ===

  it('renders a combobox trigger button', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toBeInTheDocument()
  })

  it('shows the placeholder when nothing is selected', async () => {
    const screen = await renderSelect({ placeholder: 'Pick one' })
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toHaveTextContent('Pick one')
  })

  it('displays defaultValue option label initially', async () => {
    const screen = await renderSelect({ root: { defaultValue: 'banana' } })
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toHaveTextContent('Banana')
  })

  it('renders aria-expanded="false" when closed', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  // === Open / Close ===

  it('opens the listbox on trigger click (aria-expanded="true")', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await trigger.click()

    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect.element(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('renders all options in the listbox when open', async () => {
    const screen = await renderSelect()
    await screen.getByRole('combobox').click()

    const options = document.querySelectorAll('[role="option"]')
    expect(options).toHaveLength(3)
  })

  it('keeps the custom scrollbar inside the select menu layer', async () => {
    const screen = await renderSelect({
      options: scrollOptions,
      content: { maxHeight: 64 },
      trigger: { className: 'w-40' },
    })
    await screen.getByRole('combobox').click()

    const listbox = screen.getByRole('listbox').element() as HTMLUListElement
    const menuLayer = listbox.parentElement as HTMLDivElement

    await vi.waitFor(() => {
      const vBar = document.querySelector('[data-murasaki-vbar]') as HTMLElement | null
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

  it('closes the listbox when an option is clicked', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await trigger.click()

    await screen.getByRole('option', { name: 'Banana' }).click()

    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect.element(trigger).toHaveTextContent('Banana')
  })

  // === Selection ===

  it('updates display when an option is selected (uncontrolled)', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await trigger.click()
    await screen.getByRole('option', { name: 'Cherry' }).click()
    await expect.element(trigger).toHaveTextContent('Cherry')
  })

  it('updates the hidden input value on selection', async () => {
    const screen = await renderSelect()
    await screen.getByRole('combobox').click()
    await screen.getByRole('option', { name: 'Banana' }).click()

    const hiddenInput = screen.container.querySelector(
      'input[type="hidden"][name="fruit"]',
    ) as HTMLInputElement
    expect(hiddenInput.value).toBe('banana')
  })

  it('omits the hidden input when name is not provided', async () => {
    const screen = await renderSelect({ root: { name: undefined } })
    expect(screen.container.querySelector('input[type="hidden"]')).toBeNull()
  })

  // === Controlled mode ===

  it('reflects controlled value', async () => {
    const screen = await renderSelect({ root: { value: 'cherry', onValueChange: () => {} } })
    const trigger = screen.getByRole('combobox')
    await expect.element(trigger).toHaveTextContent('Cherry')
  })

  it('calls onValueChange when an option is selected', async () => {
    const handleChange = vi.fn()
    const screen = await renderSelect({ root: { value: 'apple', onValueChange: handleChange } })
    await screen.getByRole('combobox').click()
    await screen.getByRole('option', { name: 'Cherry' }).click()

    expect(handleChange).toHaveBeenCalledWith('cherry')
  })

  // === Disabled ===

  it('does not open when disabled', async () => {
    const screen = await renderSelect({ root: { disabled: true } })
    const trigger = screen.getByRole('combobox')
    // Native click — Playwright refuses to click disabled buttons.
    ;(trigger.element() as HTMLElement).click()
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.querySelector('[role="listbox"]')).toBeNull()
  })

  it('does not select a disabled item', async () => {
    const screen = await render(
      <Select name="fruit" defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana" disabled>Banana</SelectItem>
        </SelectContent>
      </Select>,
    )
    const trigger = screen.getByRole('combobox')
    await trigger.click()
    const banana = screen.getByRole('option', { name: 'Banana' })
    await expect.element(banana).toHaveAttribute('aria-disabled', 'true')
    ;(banana.element() as HTMLElement).click()
    await expect.element(trigger).toHaveTextContent('Apple')
  })

  // === Keyboard navigation ===

  it('opens the listbox on Enter key', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await trigger.element().focus()
    await userEvent.keyboard('{Enter}')

    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens the listbox on ArrowDown key', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await trigger.element().focus()
    await userEvent.keyboard('{ArrowDown}')

    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes the listbox on Escape key', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await trigger.click()
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')

    await userEvent.keyboard('{Escape}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('selects an option with Enter after navigating with ArrowDown', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await trigger.element().focus()
    await userEvent.keyboard('{Enter}')

    await vi.waitFor(() => {
      const focused = document.querySelector('[role="option"]:focus') as HTMLElement
      expect(focused?.textContent).toBe('Apple')
    })

    await userEvent.keyboard('{ArrowDown}')
    await vi.waitFor(() => {
      const focused = document.querySelector('[role="option"]:focus') as HTMLElement
      expect(focused?.textContent).toBe('Banana')
    })

    await userEvent.keyboard('{Enter}')
    await vi.waitFor(() => {
      expect(trigger.element().getAttribute('aria-expanded')).toBe('false')
    })
    await expect.element(trigger).toHaveTextContent('Banana')
  })

  it('moves focus to first and last options with Home and End', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await trigger.element().focus()
    await userEvent.keyboard('{Enter}')

    await vi.waitFor(() => {
      const focused = document.querySelector('[role="option"]:focus') as HTMLElement
      expect(focused?.textContent).toBe('Apple')
    })

    await userEvent.keyboard('{End}')
    await vi.waitFor(() => {
      const focused = document.querySelector('[role="option"]:focus') as HTMLElement
      expect(focused?.textContent).toBe('Cherry')
    })

    await userEvent.keyboard('{Home}')
    await vi.waitFor(() => {
      const focused = document.querySelector('[role="option"]:focus') as HTMLElement
      expect(focused?.textContent).toBe('Apple')
    })
  })

  it('moves focus with typeahead and selects the matched option', async () => {
    const screen = await renderSelect()
    const trigger = screen.getByRole('combobox')
    await trigger.element().focus()
    await userEvent.keyboard('{Enter}')

    await userEvent.keyboard('c')
    await vi.waitFor(() => {
      const focused = document.querySelector('[role="option"]:focus') as HTMLElement
      expect(focused?.textContent).toBe('Cherry')
    })

    await userEvent.keyboard('{Enter}')
    await vi.waitFor(() => {
      expect(trigger.element().getAttribute('aria-expanded')).toBe('false')
    })
    await expect.element(trigger).toHaveTextContent('Cherry')
  })

  // === Callbacks ===

  it('calls onOpenChange when opening and closing', async () => {
    const onOpenChange = vi.fn()
    const screen = await renderSelect({ root: { onOpenChange } })
    const trigger = screen.getByRole('combobox')

    await trigger.click()
    expect(onOpenChange).toHaveBeenCalledWith(true)

    await screen.getByRole('option', { name: 'Banana' }).click()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  // === Groups ===

  it('associates a group with its label', async () => {
    const screen = await render(
      <Select name="animal" defaultValue="cat">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Pets</SelectLabel>
            <SelectItem value="cat">Cat</SelectItem>
            <SelectItem value="dog">Dog</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Wild</SelectLabel>
            <SelectItem value="lion">Lion</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    )
    await screen.getByRole('combobox').click()

    const groups = document.querySelectorAll('[role="group"]')
    expect(groups).toHaveLength(2)
    const firstGroup = groups[0] as HTMLElement
    const labelId = firstGroup.getAttribute('aria-labelledby')
    expect(labelId).toBeTruthy()
    expect(document.getElementById(labelId!)?.textContent).toBe('Pets')
    expect(document.querySelector('[role="separator"]')).not.toBeNull()
  })

  // === Label association ===

  it('associates an external label with the trigger via htmlFor', async () => {
    const screen = await render(
      <>
        <label htmlFor="fruit-trigger">Pick fruit</label>
        <Select name="fruit">
          <SelectTrigger id="fruit-trigger">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>
      </>,
    )
    await expect.element(screen.getByText('Pick fruit')).toBeInTheDocument()
    const label = screen.container.querySelector('label')
    const trigger = screen.getByRole('combobox')
    expect(label!.htmlFor).toBe(trigger.element().id)
  })
})
