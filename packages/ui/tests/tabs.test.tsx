import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { Tab, TabList, TabPanel, Tabs } from '../src'

describe('tabs', () => {
  // Helper: renders a basic 2-tab setup
  function renderTabs(props?: {
    defaultValue?: string
    value?: string
    onValueChange?: (v: string) => void
  }) {
    return render(
      <Tabs {...props}>
        <TabList>
          <Tab value="one">Tab One</Tab>
          <Tab value="two">Tab Two</Tab>
        </TabList>
        <TabPanel value="one">Content One</TabPanel>
        <TabPanel value="two">Content Two</TabPanel>
      </Tabs>,
    )
  }

  // === ARIA roles ===

  it('renders correct ARIA roles (tablist, tab, tabpanel)', async () => {
    const screen = await renderTabs({ defaultValue: 'one' })

    // tablist
    await expect.element(screen.getByRole('tablist')).toBeInTheDocument()

    // tabs
    const tabs = screen.container.querySelectorAll('[role="tab"]')
    expect(tabs).toHaveLength(2)

    // tabpanel — only the selected one is rendered
    await expect.element(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('sets aria-selected on the active tab', async () => {
    const screen = await renderTabs({ defaultValue: 'one' })
    const tabOne = screen.getByRole('tab', { name: 'Tab One' })
    const tabTwo = screen.getByRole('tab', { name: 'Tab Two' })

    await expect.element(tabOne).toHaveAttribute('aria-selected', 'true')
    await expect.element(tabTwo).toHaveAttribute('aria-selected', 'false')
  })

  it('links tab and panel via aria-controls / aria-labelledby', async () => {
    const screen = await renderTabs({ defaultValue: 'one' })
    const tab = screen.getByRole('tab', { name: 'Tab One' })
    const panel = screen.getByRole('tabpanel')

    // tab's aria-controls should match panel's id
    const panelId = panel.element().id
    await expect.element(tab).toHaveAttribute('aria-controls', panelId)

    // panel's aria-labelledby should match tab's id
    const tabId = tab.element().id
    await expect.element(panel).toHaveAttribute('aria-labelledby', tabId)
  })

  // === Uncontrolled mode ===

  it('shows the defaultValue panel initially', async () => {
    const screen = await renderTabs({ defaultValue: 'two' })
    await expect.element(screen.getByText('Content Two')).toBeInTheDocument()
    // Content One should NOT be rendered
    expect(screen.container.textContent).not.toContain('Content One')
  })

  it('switches panels when a tab is clicked (uncontrolled)', async () => {
    const screen = await renderTabs({ defaultValue: 'one' })

    // Initially shows Content One
    await expect.element(screen.getByText('Content One')).toBeInTheDocument()

    // Click Tab Two
    await screen.getByRole('tab', { name: 'Tab Two' }).click()

    // Now Content Two is visible, Content One is gone
    await expect.element(screen.getByText('Content Two')).toBeInTheDocument()
    expect(screen.container.textContent).not.toContain('Content One')
  })

  // === Controlled mode ===

  it('reflects controlled value prop', async () => {
    const screen = await renderTabs({ value: 'two', onValueChange: () => {} })
    await expect.element(screen.getByText('Content Two')).toBeInTheDocument()
    expect(screen.container.textContent).not.toContain('Content One')
  })

  it('calls onValueChange when a tab is clicked (controlled)', async () => {
    const handleChange = vi.fn()
    const screen = await renderTabs({ value: 'one', onValueChange: handleChange })

    await screen.getByRole('tab', { name: 'Tab Two' }).click()
    expect(handleChange).toHaveBeenCalledWith('two')
  })

  // === Keyboard ===

  it('activates a tab on Enter key', async () => {
    const screen = await renderTabs({ defaultValue: 'one' })
    const tabTwo = screen.getByRole('tab', { name: 'Tab Two' })

    // Focus the tab, then press Enter via userEvent (keyboard API)
    await tabTwo.element().focus()
    await userEvent.keyboard('{Enter}')

    // Panel should switch
    await expect.element(screen.getByText('Content Two')).toBeInTheDocument()
  })

  it('activates a tab on Space key', async () => {
    const screen = await renderTabs({ defaultValue: 'one' })
    const tabTwo = screen.getByRole('tab', { name: 'Tab Two' })

    await tabTwo.element().focus()
    await userEvent.keyboard(' ')

    await expect.element(screen.getByText('Content Two')).toBeInTheDocument()
  })

  // === Disabled tab ===

  it('does not select a disabled tab on click', async () => {
    const screen = await render(
      <Tabs defaultValue="one">
        <TabList>
          <Tab value="one">Tab One</Tab>
          <Tab value="two" disabled>Tab Two</Tab>
        </TabList>
        <TabPanel value="one">Content One</TabPanel>
        <TabPanel value="two">Content Two</TabPanel>
      </Tabs>,
    )

    // Click the disabled tab using native DOM click (Playwright refuses to click
    // aria-disabled elements). This verifies the component's own disabled guard.
    ;(screen.getByRole('tab', { name: 'Tab Two' }).element() as HTMLElement).click()

    // Content One should still be shown (tab switch blocked)
    await expect.element(screen.getByText('Content One')).toBeInTheDocument()
    expect(screen.container.textContent).not.toContain('Content Two')
  })

  it('sets aria-disabled on disabled tabs', async () => {
    const screen = await render(
      <Tabs defaultValue="one">
        <TabList>
          <Tab value="one">Tab One</Tab>
          <Tab value="two" disabled>Tab Two</Tab>
        </TabList>
        <TabPanel value="one">Content One</TabPanel>
        <TabPanel value="two">Content Two</TabPanel>
      </Tabs>,
    )

    const disabledTab = screen.getByRole('tab', { name: 'Tab Two' })
    await expect.element(disabledTab).toHaveAttribute('aria-disabled', 'true')
  })

  it('applies disabled label styling using theme tokens', async () => {
    const screen = await render(
      <Tabs defaultValue="one">
        <TabList>
          <Tab value="one">Tab One</Tab>
          <Tab value="two" disabled>Tab Two</Tab>
        </TabList>
        <TabPanel value="one">Content One</TabPanel>
        <TabPanel value="two">Content Two</TabPanel>
      </Tabs>,
    )

    const disabledLabel = screen.getByText('Tab Two')
    await expect.element(disabledLabel).toHaveClass('text-(--gray-text)')
    await expect.element(disabledLabel).toHaveClass('[text-shadow:1px_1px_0_var(--button-hilight)]')
  })

  // === Edge case: no panels rendered when no tab matches ===

  it('renders no panel when no tab matches the value', async () => {
    const screen = await renderTabs({ defaultValue: 'nonexistent' })
    const panels = screen.container.querySelectorAll('[role="tabpanel"]')
    expect(panels).toHaveLength(0)
  })

  // === Roving focus (arrow nav) ===

  it('moves focus to the next tab on ArrowRight', async () => {
    const screen = await renderTabs({ defaultValue: 'one' })
    const tabOne = screen.getByRole('tab', { name: 'Tab One' }).element() as HTMLElement
    const tabTwo = screen.getByRole('tab', { name: 'Tab Two' }).element() as HTMLElement

    tabOne.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(tabTwo)
  })

  it('moves focus to the previous tab on ArrowLeft', async () => {
    const screen = await renderTabs({ defaultValue: 'two' })
    const tabOne = screen.getByRole('tab', { name: 'Tab One' }).element() as HTMLElement
    const tabTwo = screen.getByRole('tab', { name: 'Tab Two' }).element() as HTMLElement

    tabTwo.focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(tabOne)
  })

  it('wraps focus from last to first on ArrowRight', async () => {
    const screen = await renderTabs({ defaultValue: 'one' })
    const tabOne = screen.getByRole('tab', { name: 'Tab One' }).element() as HTMLElement
    const tabTwo = screen.getByRole('tab', { name: 'Tab Two' }).element() as HTMLElement

    tabTwo.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(tabOne)
  })

  it('home and end jump to first / last tab', async () => {
    const screen = await render(
      <Tabs defaultValue="two">
        <TabList>
          <Tab value="one">Tab One</Tab>
          <Tab value="two">Tab Two</Tab>
          <Tab value="three">Tab Three</Tab>
        </TabList>
        <TabPanel value="one">Content One</TabPanel>
        <TabPanel value="two">Content Two</TabPanel>
        <TabPanel value="three">Content Three</TabPanel>
      </Tabs>,
    )
    const tabOne = screen.getByRole('tab', { name: 'Tab One' }).element() as HTMLElement
    const tabTwo = screen.getByRole('tab', { name: 'Tab Two' }).element() as HTMLElement
    const tabThree = screen.getByRole('tab', { name: 'Tab Three' }).element() as HTMLElement

    tabTwo.focus()
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(tabThree)

    await userEvent.keyboard('{Home}')
    expect(document.activeElement).toBe(tabOne)
  })

  it('skips disabled tabs during arrow navigation', async () => {
    const screen = await render(
      <Tabs defaultValue="one">
        <TabList>
          <Tab value="one">Tab One</Tab>
          <Tab value="two" disabled>Tab Two</Tab>
          <Tab value="three">Tab Three</Tab>
        </TabList>
        <TabPanel value="one">Content One</TabPanel>
        <TabPanel value="two">Content Two</TabPanel>
        <TabPanel value="three">Content Three</TabPanel>
      </Tabs>,
    )
    const tabOne = screen.getByRole('tab', { name: 'Tab One' }).element() as HTMLElement
    const tabThree = screen.getByRole('tab', { name: 'Tab Three' }).element() as HTMLElement

    tabOne.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(tabThree)
  })
})
