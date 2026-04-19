import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuItem,
} from '../src'

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

  it('closes on Escape', async () => {
    const screen = await renderBasic()
    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )
    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.querySelector('[data-testid="menu-content"]')).toBeNull()
  })

  it('closes on outside mousedown', async () => {
    const screen = await renderBasic()
    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    )
    await expect.element(screen.getByTestId('menu-content')).toBeInTheDocument()

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
    await expect.poll(() => document.querySelector('[data-testid="menu-content"]')).toBeNull()
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
