import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { Menu, MenuItem, MenuSeparator } from '../src'

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
