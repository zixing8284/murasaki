import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { TreeView, TreeViewItem } from '../src'

describe('treeView', () => {
  function renderTree() {
    return render(
      <TreeView>
        <TreeViewItem label="Alpha" defaultExpanded>
          <TreeViewItem label="Alpha-1" />
          <TreeViewItem label="Alpha-2" defaultExpanded>
            <TreeViewItem label="Alpha-2-a" />
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem label="Bravo">
          <TreeViewItem label="Bravo-1" />
        </TreeViewItem>
        <TreeViewItem label="Charlie" />
      </TreeView>,
    )
  }

  function getItem(text: string): HTMLElement {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[role="treeitem"]'))
    const match = items.find((el) => {
      const clone = el.cloneNode(true) as HTMLElement
      clone.querySelectorAll('[aria-hidden="true"]').forEach(hidden => hidden.remove())
      return clone.textContent?.trim() === text
    })
    if (!match)
      throw new Error(`Tree item not found: ${text}`)
    return match
  }

  function getDisclosure(item: HTMLElement): HTMLElement {
    const marker = item.querySelector<HTMLElement>('[data-tree-view-disclosure]')
    if (!marker)
      throw new Error('Tree disclosure not found')
    return marker
  }

  // === ARIA roles ===

  it('uses role="tree" on the root and role="treeitem" on items', async () => {
    const screen = await renderTree()
    await expect.element(screen.getByRole('tree')).toBeInTheDocument()
    expect(screen.container.querySelectorAll('[role="treeitem"]').length).toBeGreaterThan(0)
  })

  // === Vertical roving ===

  it('moves focus to the next visible item on ArrowDown', async () => {
    await renderTree()
    const alpha = getItem('Alpha')
    alpha.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(getItem('Alpha-1'))
  })

  it('skips items inside collapsed branches', async () => {
    await renderTree()
    // Bravo is collapsed by default — Bravo-1 should be skipped.
    const bravo = getItem('Bravo')
    bravo.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(getItem('Charlie'))
  })

  it('home / End jump to first / last visible item', async () => {
    await renderTree()
    const charlie = getItem('Charlie')
    charlie.focus()
    await userEvent.keyboard('{Home}')
    expect(document.activeElement).toBe(getItem('Alpha'))
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(getItem('Charlie'))
  })

  // === Horizontal expand / collapse ===

  it('arrowRight expands a collapsed branch', async () => {
    await renderTree()
    const bravo = getItem('Bravo')
    bravo.focus()
    expect(bravo.getAttribute('aria-expanded')).toBe('false')
    await userEvent.keyboard('{ArrowRight}')
    expect(bravo.getAttribute('aria-expanded')).toBe('true')
  })

  it('renders plus and minus disclosure markers for branches', async () => {
    await renderTree()
    const alpha = getItem('Alpha')
    const bravo = getItem('Bravo')

    // Expanded branches show the crisp "minus" glyph (a single bar); collapsed
    // branches show the "plus" glyph (a bar plus a vertical stroke).
    expect(getDisclosure(alpha).querySelectorAll('rect')).toHaveLength(1)
    expect(getDisclosure(bravo).querySelectorAll('rect')).toHaveLength(2)

    bravo.focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(getDisclosure(bravo).querySelectorAll('rect')).toHaveLength(1)
  })

  it('arrowRight on an expanded branch focuses the first child', async () => {
    await renderTree()
    const alpha = getItem('Alpha')
    alpha.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(getItem('Alpha-1'))
  })

  it('arrowLeft collapses an expanded branch', async () => {
    await renderTree()
    const alpha = getItem('Alpha')
    alpha.focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(alpha.getAttribute('aria-expanded')).toBe('false')
  })

  it('arrowLeft on a leaf focuses its parent branch', async () => {
    await renderTree()
    const child = getItem('Alpha-1')
    child.focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(getItem('Alpha'))
  })

  // === Pointer interaction (Windows Explorer semantics) ===

  it('toggles a branch when its disclosure box is clicked', async () => {
    await renderTree()
    const bravo = getItem('Bravo')
    expect(bravo.getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(getDisclosure(bravo))
    expect(bravo.getAttribute('aria-expanded')).toBe('true')
    await userEvent.click(getDisclosure(bravo))
    expect(bravo.getAttribute('aria-expanded')).toBe('false')
  })

  it('activates but does not toggle a branch when its row is single-clicked', async () => {
    const onClick = vi.fn()
    await render(
      <TreeView>
        <TreeViewItem label="Root" onClick={onClick}>
          <TreeViewItem label="Child" />
        </TreeViewItem>
      </TreeView>,
    )
    const root = getItem('Root')
    expect(root.getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(root)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(root.getAttribute('aria-expanded')).toBe('false')
  })

  it('does not collapse an expanded branch on a single row click', async () => {
    await renderTree()
    const alpha = getItem('Alpha')
    expect(alpha.getAttribute('aria-expanded')).toBe('true')
    await userEvent.click(alpha)
    expect(alpha.getAttribute('aria-expanded')).toBe('true')
  })

  it('toggles a branch when its row is double-clicked', async () => {
    await renderTree()
    const bravo = getItem('Bravo')
    expect(bravo.getAttribute('aria-expanded')).toBe('false')
    await userEvent.dblClick(bravo)
    expect(bravo.getAttribute('aria-expanded')).toBe('true')
  })
})
