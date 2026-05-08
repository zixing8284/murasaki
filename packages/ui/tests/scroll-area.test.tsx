import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { ScrollArea, ScrollAreaLegacy } from '../src'

describe('scroll-area', () => {
  // === Rendering ===

  it('renders children content', async () => {
    const screen = await render(
      <ScrollArea className="h-[100px] w-[200px]">
        <p>Hello world</p>
      </ScrollArea>,
    )
    await expect.element(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders a viewport div with overflow-auto', async () => {
    const screen = await render(
      <ScrollArea data-testid="scroll-area" className="h-[100px] w-[200px]">
        <p>Content</p>
      </ScrollArea>,
    )
    const outer = screen.getByTestId('scroll-area').element()
    // The outer div should be relative
    expect(outer.className).toContain('relative')
    // The first child should be the viewport with overflow-auto
    const viewport = outer.firstElementChild as HTMLElement
    expect(viewport.className).toContain('overflow-auto')
  })

  it('forwards custom className to outer element', async () => {
    const screen = await render(
      <ScrollArea data-testid="scroll-area" className="my-custom h-[100px]">
        <p>Content</p>
      </ScrollArea>,
    )
    const classes = screen.getByTestId('scroll-area').element().className
    expect(classes).toContain('my-custom')
    expect(classes).toContain('relative')
  })

  it('forwards native HTML attributes', async () => {
    const screen = await render(
      <ScrollArea data-testid="scroll-area" aria-label="Scrollable content" className="h-[100px]">
        <p>Content</p>
      </ScrollArea>,
    )
    const el = screen.getByTestId('scroll-area')
    await expect.element(el).toHaveAttribute('aria-label', 'Scrollable content')
  })

  it('forwards ref to the outer div', async () => {
    let ref: HTMLDivElement | null = null
    await render(
      <ScrollArea
        ref={(el) => { ref = el }}
        data-testid="scroll-area"
        className="h-[100px]"
      >
        <p>Content</p>
      </ScrollArea>,
    )
    expect(ref).toBeInstanceOf(HTMLDivElement)
  })

  // === Scrollbar presence ===

  it('renders scrollbar elements', async () => {
    const screen = await render(
      <ScrollArea data-testid="scroll-area" className="h-[100px] w-[200px]">
        <div style={{ height: '500px', width: '500px' }}>Tall content</div>
      </ScrollArea>,
    )
    const outer = screen.getByTestId('scroll-area').element()
    // ScrollArea renders scrollbar React elements as children of the outer div
    // There should be at least 3 children: viewport, vertical scrollbar, horizontal scrollbar, corner
    expect(outer.children.length).toBeGreaterThanOrEqual(3)
  })
})

describe('scroll-area-legacy', () => {
  it('renders children content', async () => {
    const screen = await render(
      <ScrollAreaLegacy className="h-[100px] w-[200px]">
        <p>Legacy content</p>
      </ScrollAreaLegacy>,
    )
    await expect.element(screen.getByText('Legacy content')).toBeInTheDocument()
  })

  it('renders a viewport div with overflow-auto', async () => {
    const screen = await render(
      <ScrollAreaLegacy data-testid="scroll-area-legacy" className="h-[100px] w-[200px]">
        <p>Content</p>
      </ScrollAreaLegacy>,
    )
    const outer = screen.getByTestId('scroll-area-legacy').element()
    expect(outer.className).toContain('relative')
    const viewport = outer.firstElementChild as HTMLElement
    expect(viewport.className).toContain('overflow-auto')
  })

  it('forwards custom className', async () => {
    const screen = await render(
      <ScrollAreaLegacy data-testid="scroll-area-legacy" className="my-class h-[100px]">
        <p>Content</p>
      </ScrollAreaLegacy>,
    )
    const classes = screen.getByTestId('scroll-area-legacy').element().className
    expect(classes).toContain('my-class')
  })
})
