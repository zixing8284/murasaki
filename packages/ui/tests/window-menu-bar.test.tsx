import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { WindowMenuBar, WindowMenuBarItem, WindowProvider } from '../src'

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

  it('swallows menu item clicks when the window is inactive', async () => {
    const onPointerDown = vi.fn()
    const onClick = vi.fn()

    const screen = await render(
      <div onPointerDown={onPointerDown}>
        <WindowProvider active={false}>
          <WindowMenuBar>
            <WindowMenuBarItem onClick={onClick}>File</WindowMenuBarItem>
          </WindowMenuBar>
        </WindowProvider>
      </div>,
    )

    await screen.getByRole('menuitem', { name: 'File' }).click()

    expect(onPointerDown).toHaveBeenCalledOnce()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('allows menu item clicks when the window is active', async () => {
    const onClick = vi.fn()

    const screen = await render(
      <WindowProvider active>
        <WindowMenuBar>
          <WindowMenuBarItem onClick={onClick}>File</WindowMenuBarItem>
        </WindowMenuBar>
      </WindowProvider>,
    )

    await screen.getByRole('menuitem', { name: 'File' }).click()

    expect(onClick).toHaveBeenCalledOnce()
  })
})
