import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  LayerProvider,
  Menu,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  Tooltip,
} from '../src'

function getLayerRoot(): HTMLElement {
  const layerRoot = document.querySelector<HTMLElement>('[data-react98-layer-root]')
  if (!layerRoot)
    throw new Error('Expected react98 layer root')
  return layerRoot
}

async function waitForLayerRoot(): Promise<HTMLElement> {
  await vi.waitFor(() => {
    expect(document.querySelector('[data-react98-layer-root]')).not.toBeNull()
  })
  return getLayerRoot()
}

function SubmenuFixture({ scoped }: { scoped: boolean }): React.ReactElement {
  const menu = (
    <Menu>
      <MenuSub>
        <MenuSubTrigger>Programs</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>Notepad</MenuItem>
        </MenuSubContent>
      </MenuSub>
    </Menu>
  )

  if (!scoped)
    return menu

  return (
    <div style={{ position: 'relative' }}>
      <LayerProvider>{menu}</LayerProvider>
    </div>
  )
}

async function openSubmenu(scoped: boolean): Promise<{ submenu: HTMLElement, screen: Awaited<ReturnType<typeof render>> }> {
  const screen = await render(<SubmenuFixture scoped={scoped} />)
  if (scoped)
    await waitForLayerRoot()

  const trigger = screen.getByRole('menuitem', { name: /Programs/ }).element() as HTMLElement
  trigger.focus()
  await userEvent.keyboard('{ArrowRight}')

  const notepad = screen.getByRole('menuitem', { name: 'Notepad' }).element() as HTMLElement
  await expect.element(screen.getByRole('menuitem', { name: 'Notepad' })).toBeInTheDocument()
  const submenu = notepad.closest('menu') as HTMLElement | null
  if (!submenu)
    throw new Error('Expected submenu menu element')
  return { submenu, screen }
}

function ContextMenuFixture(): React.ReactElement {
  return (
    <LayerProvider>
      <ContextMenu>
        <ContextMenuTrigger>
          <button type="button">target</button>
        </ContextMenuTrigger>
        <ContextMenuContent data-testid="context-menu-content">
          <Menu>
            <MenuItem>Open</MenuItem>
          </Menu>
        </ContextMenuContent>
      </ContextMenu>
    </LayerProvider>
  )
}

function TooltipFixture(): React.ReactElement {
  return (
    <LayerProvider>
      <Tooltip text="Save file" delay={0}>
        <button type="button">Save</button>
      </Tooltip>
    </LayerProvider>
  )
}

describe('layer-provider', () => {
  it('renders a local isolated layer root', async () => {
    await render(
      <div style={{ position: 'relative' }}>
        <LayerProvider>
          <button type="button">inside</button>
        </LayerProvider>
      </div>,
    )

    const layerRoot = await waitForLayerRoot()
    const style = getComputedStyle(layerRoot)
    expect(style.position).toBe('absolute')
    expect(style.inset).toBe('0px')
    expect(style.isolation).toBe('isolate')
    expect(style.pointerEvents).toBe('none')
  })

  it('falls back to document.body when no provider is present', async () => {
    const { submenu } = await openSubmenu(false)

    expect(submenu.parentElement).toBe(document.body)
    expect(submenu.style.zIndex).toBe('var(--react98-layer-popup-z-index)')
    expect(submenu.style.zIndex).not.toBe('9999')
  })

  it('portals submenu content into the scoped layer root', async () => {
    const { submenu } = await openSubmenu(true)
    const layerRoot = getLayerRoot()

    expect(submenu.parentElement).toBe(layerRoot)
    expect(getComputedStyle(submenu).zIndex).toBe('10')
    expect(getComputedStyle(submenu).pointerEvents).toBe('auto')
  })

  it('portals context menu content into the scoped layer root', async () => {
    const screen = await render(<ContextMenuFixture />)
    const layerRoot = await waitForLayerRoot()
    screen.getByRole('button', { name: 'target' }).element().dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 24, clientY: 32 }),
    )

    await expect.element(screen.getByTestId('context-menu-content')).toBeInTheDocument()
    const content = screen.getByTestId('context-menu-content').element() as HTMLElement
    expect(content.parentElement).toBe(layerRoot)
    expect(getComputedStyle(content).zIndex).toBe('10')
    expect(getComputedStyle(content).pointerEvents).toBe('auto')
  })

  it('portals tooltip content into the scoped layer root', async () => {
    const screen = await render(<TooltipFixture />)
    const layerRoot = await waitForLayerRoot()

    await screen.getByRole('button', { name: 'Save' }).hover()

    await expect.element(screen.getByRole('tooltip')).toBeInTheDocument()
    const tooltip = screen.getByRole('tooltip').element() as HTMLElement
    expect(tooltip.parentElement).toBe(layerRoot)
    expect(getComputedStyle(tooltip).zIndex).toBe('20')
    expect(getComputedStyle(tooltip).pointerEvents).toBe('none')
  })
})
