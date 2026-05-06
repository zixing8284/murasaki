import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
  useContextMenu,
} from '../src'

function AutoOpenMenu({ testId, x }: { testId: string, x: number }): React.ReactElement {
  const { openAt } = useContextMenu()

  React.useEffect(() => {
    openAt(x, 10)
  }, [openAt, x])

  return (
    <ContextMenuContent data-testid={testId}>
      <Menu>
        <MenuItem>{testId}</MenuItem>
      </Menu>
    </ContextMenuContent>
  )
}

function renderBasic(onOpen = vi.fn()): ReturnType<typeof render> {
  return render(
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <button type="button">target</button>
        </ContextMenuTrigger>
        <ContextMenuContent data-testid="menu-content">
          <Menu>
            <MenuItem onClick={onOpen}>Open</MenuItem>
            <MenuItem disabled>Delete</MenuItem>
          </Menu>
        </ContextMenuContent>
      </ContextMenu>
      <button type="button">outside</button>
    </div>,
  )
}

describe('context-menu', () => {
  it('does not render content before opening', async () => {
    await renderBasic()
    expect(document.querySelector('[data-testid="menu-content"]')).toBeNull()
  })

  it('opens on right-click at pointer coordinates', async () => {
    const screen = await renderBasic()
    const target = screen.getByRole('button', { name: 'target' }).element()
    target.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 120,
      clientY: 80,
    }))

    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()
    const content = screen.getByTestId('menu-content').element() as HTMLElement
    expect(content.style.left).toBe('120px')
    expect(content.style.top).toBe('80px')
  })

  it('does not open when disabled', async () => {
    const screen = await render(
      <ContextMenu>
        <ContextMenuTrigger disabled>
          <button type="button">target</button>
        </ContextMenuTrigger>
        <ContextMenuContent data-testid="menu-content">
          <Menu>
            <MenuItem>Open</MenuItem>
          </Menu>
        </ContextMenuContent>
      </ContextMenu>,
    )

    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )

    expect(document.querySelector('[data-testid="menu-content"]')).toBeNull()
  })

  it('lets child contextmenu handlers prevent opening', async () => {
    const onContextMenu = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
    })
    const screen = await render(
      <ContextMenu>
        <ContextMenuTrigger>
          <button type="button" onContextMenu={onContextMenu}>target</button>
        </ContextMenuTrigger>
        <ContextMenuContent data-testid="menu-content">
          <Menu>
            <MenuItem>Open</MenuItem>
          </Menu>
        </ContextMenuContent>
      </ContextMenu>,
    )

    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )

    expect(onContextMenu).toHaveBeenCalledOnce()
    expect(document.querySelector('[data-testid="menu-content"]')).toBeNull()
  })

  it('only opens from the first child element when onlyDirectTarget is set', async () => {
    const screen = await render(
      <ContextMenu>
        <ContextMenuTrigger onlyDirectTarget>
          <div data-testid="blank-area">
            <span>nested item</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent data-testid="menu-content">
          <Menu>
            <MenuItem>Open</MenuItem>
          </Menu>
        </ContextMenuContent>
      </ContextMenu>,
    )

    screen.getByText('nested item').element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )
    expect(document.querySelector('[data-testid="menu-content"]')).toBeNull()

    screen.getByTestId('blank-area').element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20 }),
    )

    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()
  })

  it('moves focus to the first enabled menuitem when opened', async () => {
    const screen = await renderBasic()
    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )

    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()
    await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Open')
  })

  it('closes on Escape', async () => {
    const screen = await renderBasic()
    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )
    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.querySelector('[data-testid="menu-content"]')).toBeNull()
  })

  it('closes on outside pointerdown', async () => {
    const screen = await renderBasic()
    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )
    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
    await expect.poll(() => document.querySelector('[data-testid="menu-content"]')).toBeNull()
  })

  it('dismisses only the top-most open layer on Escape', async () => {
    const screen = await render(
      <div>
        <ContextMenu>
          <AutoOpenMenu testId="first-menu" x={10} />
        </ContextMenu>
        <ContextMenu>
          <AutoOpenMenu testId="second-menu" x={80} />
        </ContextMenu>
      </div>,
    )

    await expect.element(screen.getByTestId('first-menu')).toBeInTheDocument()
    await expect.element(screen.getByTestId('second-menu')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    await expect.element(screen.getByTestId('first-menu')).toBeInTheDocument()
    await expect.poll(() => document.querySelector('[data-testid="second-menu"]')).toBeNull()
  })

  it('dismisses only the top-most open layer on outside pointerdown', async () => {
    const screen = await render(
      <div>
        <ContextMenu>
          <AutoOpenMenu testId="first-menu" x={10} />
        </ContextMenu>
        <ContextMenu>
          <AutoOpenMenu testId="second-menu" x={80} />
        </ContextMenu>
      </div>,
    )

    await expect.element(screen.getByTestId('first-menu')).toBeInTheDocument()
    await expect.element(screen.getByTestId('second-menu')).toBeInTheDocument()

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))

    await expect.element(screen.getByTestId('first-menu')).toBeInTheDocument()
    await expect.poll(() => document.querySelector('[data-testid="second-menu"]')).toBeNull()
  })

  it('fires item onClick and closes on click of enabled item', async () => {
    const onOpen = vi.fn()
    const screen = await renderBasic(onOpen)
    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )
    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()

    await screen.getByRole('menuitem', { name: 'Open' }).click()
    expect(onOpen).toHaveBeenCalledOnce()
    await expect.poll(() => document.querySelector('[data-testid="menu-content"]')).toBeNull()
  })

  it('fires item onClick and closes on keyboard activation', async () => {
    const onOpen = vi.fn()
    const screen = await renderBasic(onOpen)
    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )
    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()
    await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Open')

    await userEvent.keyboard('{Enter}')

    expect(onOpen).toHaveBeenCalledOnce()
    await expect.poll(() => document.querySelector('[data-testid="menu-content"]')).toBeNull()
  })

  it('restores focus to the previously focused element when closed', async () => {
    const screen = await renderBasic()
    const target = screen.getByRole('button', { name: 'target' }).element() as HTMLElement
    target.focus()
    target.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )
    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => document.activeElement).toBe(target)
  })

  it('clamps content to viewport when opening near bottom-right edge', async () => {
    const screen = await renderBasic()
    const vw = window.innerWidth
    const vh = window.innerHeight
    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: vw - 2,
        clientY: vh - 2,
      }),
    )

    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()
    const content = screen.getByTestId('menu-content').element() as HTMLElement
    const rect = content.getBoundingClientRect()
    expect(rect.right).toBeLessThanOrEqual(vw + 0.5)
    expect(rect.bottom).toBeLessThanOrEqual(vh + 0.5)
  })
})
