import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'

import {
  MenuItem,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarItem,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
  WindowProvider,
} from '../src'

function TestWindowMenuBar({ onValueChange }: { onValueChange?: (value: string | null) => void }): React.ReactElement {
  return (
    <WindowMenuBar onValueChange={onValueChange}>
      <WindowMenuBarMenu value="file">
        <WindowMenuBarTrigger>File</WindowMenuBarTrigger>
        <WindowMenuBarContent>
          <MenuItem>New</MenuItem>
          <MenuItem>Open</MenuItem>
        </WindowMenuBarContent>
      </WindowMenuBarMenu>
      <WindowMenuBarMenu value="edit">
        <WindowMenuBarTrigger>Edit</WindowMenuBarTrigger>
        <WindowMenuBarContent>
          <MenuItem>Cut</MenuItem>
          <MenuItem>Copy</MenuItem>
        </WindowMenuBarContent>
      </WindowMenuBarMenu>
    </WindowMenuBar>
  )
}

describe('window menu bar', () => {
  it('renders a menubar with menu items', async () => {
    const screen = await render(
      <WindowProvider>
        <WindowMenuBar>
          <WindowMenuBarItem>File</WindowMenuBarItem>
          <WindowMenuBarItem>Edit</WindowMenuBarItem>
        </WindowMenuBar>
      </WindowProvider>,
    )

    await expect.element(screen.getByRole('menubar')).toBeInTheDocument()
    await expect.element(screen.getByRole('menuitem', { name: 'File' })).toBeInTheDocument()
    await expect.element(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
  })

  it('fires menu item clicks regardless of window active state', async () => {
    const onClick = vi.fn()

    const screen = await render(
      <WindowProvider active={false}>
        <WindowMenuBar>
          <WindowMenuBarItem onClick={onClick}>File</WindowMenuBarItem>
        </WindowMenuBar>
      </WindowProvider>,
    )

    await screen.getByRole('menuitem', { name: 'File' }).click()

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('toggles an open top-level menu closed when its trigger is clicked again', async () => {
    const onValueChange = vi.fn()
    const screen = await render(<TestWindowMenuBar onValueChange={onValueChange} />)
    const file = screen.getByRole('menuitem', { name: 'File' })

    await file.click()

    await expect.element(screen.getByRole('menuitem', { name: 'New' })).toBeInTheDocument()
    await expect.element(file).toHaveAttribute('aria-expanded', 'true')

    await file.click()

    await expect.element(screen.getByRole('menuitem', { name: 'New' })).not.toBeInTheDocument()
    await expect.element(file).toHaveAttribute('aria-expanded', 'false')
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it('switches open top-level menus on pointer hover', async () => {
    const screen = await render(<TestWindowMenuBar />)
    const file = screen.getByRole('menuitem', { name: 'File' })
    const edit = screen.getByRole('menuitem', { name: 'Edit' })

    await file.click()
    await expect.element(screen.getByRole('menuitem', { name: 'New' })).toBeInTheDocument()

    await userEvent.hover(edit.element())

    await expect.element(screen.getByRole('menuitem', { name: 'Cut' })).toBeInTheDocument()
    await expect.element(screen.getByRole('menuitem', { name: 'New' })).not.toBeInTheDocument()
    await expect.element(file).toHaveAttribute('aria-expanded', 'false')
    await expect.element(edit).toHaveAttribute('aria-expanded', 'true')
  })
})
