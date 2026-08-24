import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { Slider } from '../src'

describe('slider', () => {
  // === Rendering ===

  it('renders a range input', async () => {
    const screen = await render(<Slider />)
    const input = screen.getByRole('slider')
    await expect.element(input).toBeInTheDocument()
  })

  it('applies default min/max/step attributes', async () => {
    const screen = await render(<Slider />)
    const input = screen.getByRole('slider')
    await expect.element(input).toHaveAttribute('min', '0')
    await expect.element(input).toHaveAttribute('max', '100')
    await expect.element(input).toHaveAttribute('step', '1')
  })

  it('forwards custom min, max, and step props', async () => {
    const screen = await render(<Slider min={10} max={50} step={5} />)
    const input = screen.getByRole('slider')
    await expect.element(input).toHaveAttribute('min', '10')
    await expect.element(input).toHaveAttribute('max', '50')
    await expect.element(input).toHaveAttribute('step', '5')
  })

  // === Controlled mode ===

  it('reflects controlled value', async () => {
    const screen = await render(<Slider value={42} onValueChange={() => {}} />)
    const input = screen.getByRole('slider')
    expect(input.element().getAttribute('value')).toBe('42')
  })

  it('calls onValueChange when value changes', async () => {
    const handleChange = vi.fn()
    const screen = await render(
      <Slider value={50} onValueChange={handleChange} />,
    )
    const input = screen.getByRole('slider')

    // Focus the native range input and use keyboard to change value.
    // This triggers React's synthetic onChange correctly.
    await input.element().focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(handleChange).toHaveBeenCalledWith(51)
  })

  // === Uncontrolled mode ===

  it('uses defaultValue for initial value in uncontrolled mode', async () => {
    const screen = await render(<Slider defaultValue={30} />)
    const input = screen.getByRole('slider')
    expect((input.element() as HTMLInputElement).value).toBe('30')
  })

  it('defaults to min value when no defaultValue is given', async () => {
    const screen = await render(<Slider min={10} max={90} />)
    const input = screen.getByRole('slider')
    expect((input.element() as HTMLInputElement).value).toBe('10')
  })

  // === Vertical mode ===

  it('applies vertical layout when vertical={true}', async () => {
    const screen = await render(<Slider vertical />)
    // The container should have vertical-related classes (flex-col)
    const container = screen.container.firstElementChild as HTMLElement
    expect(container.className).toContain('flex-col')
  })

  it('applies writing-mode for vertical native input', async () => {
    const screen = await render(<Slider vertical />)
    const input = screen.getByRole('slider')
    expect(input.element().className).toContain('[writing-mode:vertical-lr]')
  })

  it('sets dir="rtl" on vertical native input', async () => {
    const screen = await render(<Slider vertical />)
    const input = screen.getByRole('slider')
    await expect.element(input).toHaveAttribute('dir', 'rtl')
  })

  it('does not set dir on horizontal native input', async () => {
    const screen = await render(<Slider />)
    const input = screen.getByRole('slider')
    expect(input.element().hasAttribute('dir')).toBe(false)
  })

  it('positions thumb with bottom in vertical mode', async () => {
    const screen = await render(
      <Slider vertical value={50} onValueChange={() => {}} />,
    )
    // The thumb is the pointer-events-none div with inline style
    const trackWrapper = screen.container.querySelector('[class*="h-full w-"]') as HTMLElement
    const thumb = trackWrapper.querySelector('[style*="bottom"]') as HTMLElement
    expect(thumb).not.toBeNull()
    expect(thumb.style.bottom).toContain('50%')
    expect(thumb.style.transform).toContain('rotate(-90deg)')
  })

  it('positions thumb with left in horizontal mode', async () => {
    const screen = await render(
      <Slider value={50} onValueChange={() => {}} />,
    )
    const trackWrapper = screen.container.querySelector('[class*="w-full h-"]') as HTMLElement
    const thumb = trackWrapper.querySelector('[style*="left"]') as HTMLElement
    expect(thumb).not.toBeNull()
    expect(thumb.style.left).toContain('50%')
    expect(thumb.style.transform).toContain('translateY(-50%)')
  })

  it('calls onValueChange on keyboard interaction in vertical mode', async () => {
    const handleChange = vi.fn()
    const screen = await render(
      <Slider vertical value={50} onValueChange={handleChange} />,
    )
    const input = screen.getByRole('slider')

    await input.element().focus()
    await userEvent.keyboard('{ArrowUp}')

    expect(handleChange).toHaveBeenCalled()
  })

  it('reflects controlled value in vertical mode', async () => {
    const screen = await render(
      <Slider vertical value={75} onValueChange={() => {}} />,
    )
    const input = screen.getByRole('slider')
    expect((input.element() as HTMLInputElement).value).toBe('75')
  })

  it('forwards disabled attribute in vertical mode', async () => {
    const screen = await render(<Slider vertical disabled />)
    const input = screen.getByRole('slider')
    await expect.element(input).toBeDisabled()
  })

  // === Fill (filled progress) ===

  it('renders a horizontal fill bar spanning the current value', async () => {
    const screen = await render(
      <Slider fill value={50} onValueChange={() => {}} />,
    )
    const fill = screen.container.querySelector('[data-slider-fill]') as HTMLElement
    expect(fill).not.toBeNull()
    expect(fill.style.width).toBe('50%')
    expect(fill.className).toContain('bg-(--hilight)')
  })

  it('renders a vertical fill bar spanning the current value', async () => {
    const screen = await render(
      <Slider fill vertical value={25} onValueChange={() => {}} />,
    )
    const fill = screen.container.querySelector('[data-slider-fill]') as HTMLElement
    expect(fill).not.toBeNull()
    expect(fill.style.height).toBe('25%')
  })

  it('does not render a fill bar by default', async () => {
    const screen = await render(
      <Slider value={50} onValueChange={() => {}} />,
    )
    expect(screen.container.querySelector('[data-slider-fill]')).toBeNull()
  })

  it('renders vertical ticks with labels', async () => {
    const ticks = [
      { value: 0, label: 'Low' },
      { value: 100, label: 'High' },
    ]
    const screen = await render(<Slider vertical ticks={ticks} />)

    await expect.element(screen.getByText('Low')).toBeInTheDocument()
    await expect.element(screen.getByText('High')).toBeInTheDocument()

    // Tick items should use flex-row layout in vertical mode
    const tickItems = screen.container.querySelectorAll('[class*="flex-row"]')
    expect(tickItems.length).toBeGreaterThanOrEqual(2)
  })

  it('renders vertical ticks positioned with bottom style', async () => {
    const ticks = [{ value: 0 }, { value: 100 }]
    const screen = await render(<Slider vertical ticks={ticks} />)

    // Each tick wrapper should use bottom positioning
    const tickContainer = screen.container.querySelector('[class*="left-full"]') as HTMLElement
    expect(tickContainer).not.toBeNull()
    const tickWrappers = tickContainer.querySelectorAll('[style*="bottom"]')
    expect(tickWrappers).toHaveLength(2)
  })

  it('renders vertical slider with boxIndicator', async () => {
    const screen = await render(<Slider vertical boxIndicator />)
    const trackWrapper = screen.container.querySelector('[class*="h-full w-"]') as HTMLElement
    const thumb = trackWrapper.querySelector('[class*="pointer-events-none"]') as HTMLElement
    expect(thumb).not.toBeNull()
    // Box indicator should NOT have clip-path (triangle only has it)
    expect(thumb.className).not.toContain('clip-path')
  })

  it('forwards className in vertical mode', async () => {
    const screen = await render(<Slider vertical className="my-vertical-slider" />)
    const container = screen.container.firstElementChild as HTMLElement
    expect(container.className).toContain('my-vertical-slider')
    expect(container.className).toContain('flex-col')
  })

  // === Tick marks ===

  it('renders tick marks when ticks prop is provided', async () => {
    const ticks = [
      { value: 0, label: 'Min' },
      { value: 50, label: 'Mid' },
      { value: 100, label: 'Max' },
    ]
    const screen = await render(<Slider ticks={ticks} />)

    // Tick labels should be visible
    await expect.element(screen.getByText('Min')).toBeInTheDocument()
    await expect.element(screen.getByText('Mid')).toBeInTheDocument()
    await expect.element(screen.getByText('Max')).toBeInTheDocument()
  })

  it('renders ticks without labels', async () => {
    const ticks = [{ value: 0 }, { value: 50 }, { value: 100 }]
    const screen = await render(<Slider ticks={ticks} />)

    // A datalist should be present for accessibility
    const datalist = screen.container.querySelector('datalist')
    expect(datalist).not.toBeNull()
    // Should have 3 option elements
    const options = datalist!.querySelectorAll('option')
    expect(options).toHaveLength(3)
  })

  // === Disabled state ===

  it('forwards disabled attribute to the native input', async () => {
    const screen = await render(<Slider disabled />)
    const input = screen.getByRole('slider')
    await expect.element(input).toBeDisabled()
  })

  // === className forwarding ===

  it('forwards className to the container', async () => {
    const screen = await render(<Slider className="my-slider" />)
    const container = screen.container.firstElementChild as HTMLElement
    expect(container.className).toContain('my-slider')
  })

  // === Visual regression (screenshots) ===

  it.skip('matches screenshot for horizontal slider', async () => {
    const screen = await render(
      <Slider value={50} onValueChange={() => {}} />,
    )
    const container = screen.container.firstElementChild as HTMLElement
    await expect.element(container).toMatchScreenshot('slider-horizontal')
  })

  it.skip('matches screenshot for vertical slider', async () => {
    const screen = await render(
      <Slider vertical value={50} onValueChange={() => {}} />,
    )
    const container = screen.container.firstElementChild as HTMLElement
    await expect.element(container).toMatchScreenshot('slider-vertical')
  })

  it.skip('matches screenshot for vertical slider with ticks', async () => {
    const ticks = [
      { value: 0, label: 'Low' },
      { value: 50 },
      { value: 100, label: 'High' },
    ]
    const screen = await render(
      <div style={{ padding: '16px' }}>
        <Slider vertical value={30} onValueChange={() => {}} ticks={ticks} />
      </div>,
    )
    const wrapper = screen.container.firstElementChild!.firstElementChild as HTMLElement
    await expect.element(wrapper).toMatchScreenshot('slider-vertical-ticks')
  })

  it.skip('matches screenshot for vertical slider with boxIndicator', async () => {
    const screen = await render(
      <Slider vertical boxIndicator value={60} onValueChange={() => {}} />,
    )
    const container = screen.container.firstElementChild as HTMLElement
    await expect.element(container).toMatchScreenshot('slider-vertical-box')
  })

  // === Hit area extends beyond track for thumb overhang ===

  it('extends native input hit area beyond track wrapper (horizontal)', async () => {
    const screen = await render(
      <div style={{ padding: '20px' }}>
        <Slider value={0} onValueChange={() => {}} />
      </div>,
    )
    const input = screen.getByRole('slider').element() as HTMLInputElement
    const trackWrapper = input.parentElement as HTMLElement

    const inputRect = input.getBoundingClientRect()
    const trackRect = trackWrapper.getBoundingClientRect()

    // Input should extend 5.5px beyond track on each side (half of 11px thumb width)
    expect(inputRect.left).toBeLessThan(trackRect.left)
    expect(inputRect.right).toBeGreaterThan(trackRect.right)
    expect(inputRect.width).toBeCloseTo(trackRect.width + 11, 0)
  })

  it('extends native input hit area beyond track wrapper (vertical)', async () => {
    const screen = await render(
      <div style={{ padding: '20px' }}>
        <Slider vertical value={0} onValueChange={() => {}} />
      </div>,
    )
    const input = screen.getByRole('slider').element() as HTMLInputElement
    const trackWrapper = input.parentElement as HTMLElement

    const inputRect = input.getBoundingClientRect()
    const trackRect = trackWrapper.getBoundingClientRect()

    // Input should extend 10.5px beyond track on each side (half of 21px thumb height)
    expect(inputRect.top).toBeLessThan(trackRect.top)
    expect(inputRect.bottom).toBeGreaterThan(trackRect.bottom)
    expect(inputRect.height).toBeCloseTo(trackRect.height + 21, 0)
  })
})
