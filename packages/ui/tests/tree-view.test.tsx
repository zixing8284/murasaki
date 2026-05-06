import { describe, expect, it } from 'vitest'
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

    expect(getDisclosure(alpha).textContent).toBe('-')
    expect(getDisclosure(bravo).textContent).toBe('+')

    bravo.focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(getDisclosure(bravo).textContent).toBe('-')
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
})
