import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { Menu, MenuItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger } from '../src'

const MANY_ITEMS = Array.from({ length: 36 }, (_, index) => `Item ${index + 1}`)

function getScrollList(menu: HTMLElement): HTMLElement {
  const list = menu.querySelector<HTMLElement>('[data-menu-scroll-list]')
  if (!list)
    throw new Error('Expected overflow-enabled menu list')
  return list
}

function BoundarySubmenu(): React.ReactElement {
  const boundaryRef = React.useRef<HTMLDivElement>(null)

  return (
    <div
      ref={boundaryRef}
      data-testid="submenu-boundary"
      style={{ position: 'fixed', left: 80, top: 80, width: 180, height: 140 }}
    >
      <Menu style={{ position: 'absolute', right: 4, bottom: 4 }}>
        <MenuSub>
          <MenuSubTrigger>More</MenuSubTrigger>
          <MenuSubContent boundaryRef={boundaryRef} estimatedWidth={180} estimatedHeight={120}>
            <MenuItem>Child</MenuItem>
            <MenuItem>Properties</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </Menu>
    </div>
  )
}

describe('menu', () => {
  async function renderMenu() {
    const onOpen = vi.fn()
    const onSave = vi.fn()
    const screen = await render(
      <Menu>
        <MenuItem onClick={onOpen}>Open</MenuItem>
        <MenuItem disabled>Delete</MenuItem>
        <MenuSeparator />
        <MenuItem onClick={onSave}>Save As</MenuItem>
      </Menu>,
    )

    return { screen, onOpen, onSave }
  }

  it('renders menu roles and disabled menuitem state', async () => {
    const { screen } = await renderMenu()

    await expect.element(screen.getByRole('menu')).toBeInTheDocument()
    await expect.element(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('aria-disabled', 'true')
    await expect.element(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('moves focus with ArrowDown and skips disabled items', async () => {
    const { screen } = await renderMenu()
    const openItem = screen.getByRole('menuitem', { name: 'Open' }).element() as HTMLElement
    const saveItem = screen.getByRole('menuitem', { name: 'Save As' }).element() as HTMLElement

    openItem.focus()
    await userEvent.keyboard('{ArrowDown}')

    expect(document.activeElement).toBe(saveItem)
  })

  it('wraps ArrowUp from the first item to the last enabled item', async () => {
    const { screen } = await renderMenu()
    const openItem = screen.getByRole('menuitem', { name: 'Open' }).element() as HTMLElement
    const saveItem = screen.getByRole('menuitem', { name: 'Save As' }).element() as HTMLElement

    openItem.focus()
    await userEvent.keyboard('{ArrowUp}')

    expect(document.activeElement).toBe(saveItem)
  })

  it('home and end jump to the first and last enabled item', async () => {
    const { screen } = await renderMenu()
    const openItem = screen.getByRole('menuitem', { name: 'Open' }).element() as HTMLElement
    const saveItem = screen.getByRole('menuitem', { name: 'Save As' }).element() as HTMLElement

    openItem.focus()
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(saveItem)

    await userEvent.keyboard('{Home}')
    expect(document.activeElement).toBe(openItem)
  })

  it('moves focus with typeahead', async () => {
    const { screen } = await renderMenu()
    const openItem = screen.getByRole('menuitem', { name: 'Open' }).element() as HTMLElement
    const saveItem = screen.getByRole('menuitem', { name: 'Save As' }).element() as HTMLElement

    openItem.focus()
    await userEvent.keyboard('s')

    expect(document.activeElement).toBe(saveItem)
  })

  it('activates focused menuitem with Enter and Space', async () => {
    const { screen, onOpen, onSave } = await renderMenu()
    const openItem = screen.getByRole('menuitem', { name: 'Open' }).element() as HTMLElement
    const saveItem = screen.getByRole('menuitem', { name: 'Save As' }).element() as HTMLElement

    openItem.focus()
    await userEvent.keyboard('{Enter}')
    expect(onOpen).toHaveBeenCalledOnce()

    saveItem.focus()
    await userEvent.keyboard(' ')
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('does not activate disabled menuitems', async () => {
    const onDelete = vi.fn()
    const screen = await render(
      <Menu>
        <MenuItem disabled onClick={onDelete}>Delete</MenuItem>
      </Menu>,
    )
    const disabledItem = screen.getByRole('menuitem', { name: 'Delete' }).element() as HTMLElement

    disabledItem.click()
    disabledItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))

    expect(onDelete).not.toHaveBeenCalled()
  })

  it('shows scroll arrows for max-height menus and steps by one row', async () => {
    const screen = await render(
      <Menu maxHeight={96}>
        {MANY_ITEMS.map(item => <MenuItem key={item}>{item}</MenuItem>)}
      </Menu>,
    )
    const menu = screen.getByRole('menu').element() as HTMLElement
    const list = getScrollList(menu)

    await vi.waitFor(() => {
      expect(menu.querySelector('[data-menu-scroll="down"]')).not.toBeNull()
    })
    expect(menu.querySelector('[data-menu-scroll="up"]')).toBeNull()
    expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(MANY_ITEMS.length)

    const downArrow = menu.querySelector('[data-menu-scroll="down"]') as HTMLElement
    downArrow.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' }))
    downArrow.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerType: 'mouse' }))

    await vi.waitFor(() => {
      expect(list.scrollTop).toBeGreaterThan(0)
      expect(menu.querySelector('[data-menu-scroll="up"]')).not.toBeNull()
    })
  })

  it('scrolls the focused item into view during keyboard navigation', async () => {
    const screen = await render(
      <Menu maxHeight={96}>
        {MANY_ITEMS.map(item => <MenuItem key={item}>{item}</MenuItem>)}
      </Menu>,
    )
    const menu = screen.getByRole('menu').element() as HTMLElement
    const list = getScrollList(menu)
    const firstItem = screen.getByRole('menuitem', { name: 'Item 1', exact: true }).element() as HTMLElement
    const lastItem = screen.getByRole('menuitem', { name: 'Item 36', exact: true }).element() as HTMLElement

    firstItem.focus()
    await userEvent.keyboard('{End}')

    expect(document.activeElement).toBe(lastItem)
    await vi.waitFor(() => {
      expect(list.scrollTop).toBeGreaterThan(0)
    })
  })
})

describe('menu submenu', () => {
  async function renderSubmenu() {
    const onSubItem = vi.fn()
    const screen = await render(
      <Menu>
        <MenuItem>Open</MenuItem>
        <MenuSub hoverOpenDelay={20} hoverCloseDelay={20}>
          <MenuSubTrigger>Programs</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem onClick={onSubItem}>Notepad</MenuItem>
            <MenuItem>Calculator</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </Menu>,
    )
    return { screen, onSubItem }
  }

  it('renders subtrigger with aria-haspopup and aria-expanded=false', async () => {
    const { screen } = await renderSubmenu()
    const trigger = screen.getByRole('menuitem', { name: /Programs/ }).element() as HTMLElement
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens submenu on ArrowRight and focuses first item', async () => {
    const { screen } = await renderSubmenu()
    const trigger = screen.getByRole('menuitem', { name: /Programs/ }).element() as HTMLElement
    trigger.focus()
    await userEvent.keyboard('{ArrowRight}')

    const notepad = screen.getByRole('menuitem', { name: 'Notepad' })
    await expect.element(notepad).toBeInTheDocument()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(notepad.element())
  })

  it('closes submenu on ArrowLeft and returns focus to trigger', async () => {
    const { screen } = await renderSubmenu()
    const trigger = screen.getByRole('menuitem', { name: /Programs/ }).element() as HTMLElement
    trigger.focus()
    await userEvent.keyboard('{ArrowRight}')
    await userEvent.keyboard('{ArrowLeft}')

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('closes submenu on Escape', async () => {
    const { screen } = await renderSubmenu()
    const trigger = screen.getByRole('menuitem', { name: /Programs/ }).element() as HTMLElement
    trigger.focus()
    await userEvent.keyboard('{ArrowRight}')
    await userEvent.keyboard('{Escape}')

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('renders submenu content in a portal under document.body', async () => {
    const { screen } = await renderSubmenu()
    const trigger = screen.getByRole('menuitem', { name: /Programs/ }).element() as HTMLElement
    trigger.focus()
    await userEvent.keyboard('{ArrowRight}')
    const notepad = screen.getByRole('menuitem', { name: 'Notepad' }).element() as HTMLElement
    const parentMenu = trigger.closest('menu')
    expect(parentMenu?.contains(notepad)).toBe(false)
    expect(document.body.contains(notepad)).toBe(true)
  })

  it('invokes onClick handler for items inside the submenu', async () => {
    const { screen, onSubItem } = await renderSubmenu()
    const trigger = screen.getByRole('menuitem', { name: /Programs/ }).element() as HTMLElement
    trigger.focus()
    await userEvent.keyboard('{ArrowRight}')
    const notepad = screen.getByRole('menuitem', { name: 'Notepad' }).element() as HTMLElement
    notepad.click()
    expect(onSubItem).toHaveBeenCalledOnce()
  })

  it('flips submenu content away from the right viewport edge', async () => {
    const screen = await render(
      <Menu style={{ position: 'fixed', left: window.innerWidth - 72, top: 20 }}>
        <MenuSub>
          <MenuSubTrigger>Programs</MenuSubTrigger>
          <MenuSubContent estimatedWidth={180}>
            <MenuItem>Child</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </Menu>,
    )
    const trigger = screen.getByRole('menuitem', { name: /Programs/ }).element() as HTMLElement

    trigger.focus()
    await userEvent.keyboard('{ArrowRight}')

    const child = screen.getByRole('menuitem', { name: 'Child' }).element() as HTMLElement
    const submenu = child.closest('menu') as HTMLElement
    const triggerRect = trigger.getBoundingClientRect()

    await vi.waitFor(() => {
      const submenuRect = submenu.getBoundingClientRect()
      expect(submenuRect.left).toBeLessThan(triggerRect.left)
      expect(submenuRect.right).toBeLessThanOrEqual(window.innerWidth + 0.5)
    })
  })

  it('clamps submenu content to a provided boundary', async () => {
    const screen = await render(<BoundarySubmenu />)
    const boundary = screen.getByTestId('submenu-boundary').element() as HTMLElement
    const trigger = screen.getByRole('menuitem', { name: /More/ }).element() as HTMLElement

    trigger.focus()
    await userEvent.keyboard('{ArrowRight}')

    const child = screen.getByRole('menuitem', { name: 'Child' }).element() as HTMLElement
    const submenu = child.closest('menu') as HTMLElement
    const boundaryRect = boundary.getBoundingClientRect()

    await vi.waitFor(() => {
      const submenuRect = submenu.getBoundingClientRect()
      expect(submenuRect.right).toBeLessThanOrEqual(boundaryRect.right + 0.5)
      expect(submenuRect.bottom).toBeLessThanOrEqual(boundaryRect.bottom + 0.5)
      expect(submenuRect.left).toBeGreaterThanOrEqual(boundaryRect.left - 0.5)
      expect(submenuRect.top).toBeGreaterThanOrEqual(boundaryRect.top - 0.5)
    })
  })

  it('caps tall submenu content and shows scroll arrows', async () => {
    const screen = await render(
      <Menu style={{ position: 'fixed', left: 12, top: 12 }}>
        <MenuSub>
          <MenuSubTrigger>Accessories</MenuSubTrigger>
          <MenuSubContent estimatedHeight={900}>
            {MANY_ITEMS.map(item => <MenuItem key={item}>{item}</MenuItem>)}
          </MenuSubContent>
        </MenuSub>
      </Menu>,
    )
    const trigger = screen.getByRole('menuitem', { name: /Accessories/ }).element() as HTMLElement

    trigger.focus()
    await userEvent.keyboard('{ArrowRight}')

    const submenuItem = screen.getByRole('menuitem', { name: 'Item 1', exact: true }).element() as HTMLElement
    const submenu = submenuItem.closest('menu') as HTMLElement

    await vi.waitFor(() => {
      expect(submenu.querySelector('[data-menu-scroll="down"]')).not.toBeNull()
    })
    expect(submenu.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight + 0.5)
  })
})
