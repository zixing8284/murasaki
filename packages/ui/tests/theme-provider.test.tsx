import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { themeIds, ThemeProvider, useTheme } from '../src'

function ThemeIdConsumer(): React.ReactElement {
  const { themeId } = useTheme()
  return <span data-testid="theme">{themeId}</span>
}

function SetThemeConsumer(): React.ReactElement {
  const { themeId, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{themeId}</span>
      <button onClick={() => setTheme('windows-95')}>Switch</button>
    </div>
  )
}

function StorageKeyConsumer(): React.ReactElement {
  const { setTheme } = useTheme()
  return <button onClick={() => setTheme('solarized-dark')}>Switch</button>
}

describe('theme-provider', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  // === Rendering ===

  it('renders children', async () => {
    const screen = await render(
      <ThemeProvider>
        <div>Hello</div>
      </ThemeProvider>,
    )
    await expect.element(screen.getByText('Hello')).toBeInTheDocument()
  })

  // === Theme IDs ===

  it('exports all three theme IDs', () => {
    expect(themeIds).toContain('windows-98')
    expect(themeIds).toContain('windows-95')
    expect(themeIds).toContain('solarized-dark')
    expect(themeIds.length).toBe(3)
  })

  // === Default theme ===

  it('applies default theme (windows-98) to documentElement', async () => {
    await render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    )
    // windows-98 is the default and should not set data-theme
    // (the component removes data-theme for the default theme)
    const theme = document.documentElement.getAttribute('data-theme')
    expect(theme).toBeNull()
  })

  it('applies non-default theme to documentElement', async () => {
    await render(
      <ThemeProvider defaultTheme="solarized-dark">
        <div>content</div>
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('solarized-dark')
  })

  it('applies windows-95 theme to documentElement', async () => {
    await render(
      <ThemeProvider defaultTheme="windows-95">
        <div>content</div>
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('windows-95')
  })

  // === useTheme hook ===

  it('provides theme context via useTheme', async () => {
    const screen = await render(
      <ThemeProvider defaultTheme="solarized-dark">
        <ThemeIdConsumer />
      </ThemeProvider>,
    )
    const el = screen.getByTestId('theme')
    await expect.element(el).toHaveTextContent('solarized-dark')
  })

  it('provides setTheme via useTheme', async () => {
    const screen = await render(
      <ThemeProvider>
        <SetThemeConsumer />
      </ThemeProvider>,
    )

    await expect.element(screen.getByTestId('theme')).toHaveTextContent('windows-98')
    await screen.getByRole('button', { name: 'Switch' }).click()
    await expect.element(screen.getByTestId('theme')).toHaveTextContent('windows-95')
    expect(document.documentElement.getAttribute('data-theme')).toBe('windows-95')
  })

  // === attributeTarget ===

  it('applies theme to custom attributeTarget element', async () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    await render(
      <ThemeProvider defaultTheme="solarized-dark" attributeTarget={target}>
        <div>content</div>
      </ThemeProvider>,
    )

    expect(target.getAttribute('data-theme')).toBe('solarized-dark')
    // documentElement should not be affected
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()

    document.body.removeChild(target)
  })

  // === storageKey ===

  it('disables localStorage when storageKey is null', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    const screen = await render(
      <ThemeProvider storageKey={null}>
        <StorageKeyConsumer />
      </ThemeProvider>,
    )

    await screen.getByRole('button', { name: 'Switch' }).click()
    expect(setItemSpy).not.toHaveBeenCalled()

    setItemSpy.mockRestore()
  })
})
