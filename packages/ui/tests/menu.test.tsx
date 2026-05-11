import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { Menu, MenuItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger } from '../src'

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
})
