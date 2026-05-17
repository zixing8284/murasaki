import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { themeIds, themeLabels, ThemeProvider, useTheme } from '../src'

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
  return <button onClick={() => setTheme('rainy-day')}>Switch</button>
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

  it('exports all built-in theme IDs', () => {
    expect(themeIds).toEqual([
      'windows-95',
      'windows-98',
      'windows-standard',
      'rainy-day',
      'rose',
      'slate',
      'spruce',
      'desert',
      'brick',
      'eggplant',
      'lilac',
      'maple',
      'marine',
      'plum',
      'pumpkin',
      'red-white-and-blue',
      'storm',
      'teal',
      'wheat',
    ])
  })

  it('exports built-in theme labels', () => {
    expect(themeLabels).toEqual({
      'windows-95': 'Windows 95',
      'windows-98': 'Windows 98',
      'windows-standard': 'Windows Standard',
      'rainy-day': 'Rainy Day',
      'rose': 'Rose',
      'slate': 'Slate',
      'spruce': 'Spruce',
      'desert': 'Desert',
      'brick': 'Brick',
      'eggplant': 'Eggplant',
      'lilac': 'Lilac',
      'maple': 'Maple',
      'marine': 'Marine',
      'plum': 'Plum',
      'pumpkin': 'Pumpkin',
      'red-white-and-blue': 'Red, White, and Blue',
      'storm': 'Storm',
      'teal': 'Teal',
      'wheat': 'Wheat',
    })
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
      <ThemeProvider defaultTheme="rainy-day">
        <div>content</div>
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('rainy-day')
  })

  it('lets non-default theme variables override the document default', async () => {
    await render(
      <ThemeProvider defaultTheme="marine">
        <div>content</div>
      </ThemeProvider>,
    )

    expect(document.documentElement.getAttribute('data-theme')).toBe('marine')
    expect(getComputedStyle(document.documentElement).getPropertyValue('--button-face').trim()).toBe('#88c0b8')
  })

  it('applies windows-95 theme to documentElement', async () => {
    await render(
      <ThemeProvider defaultTheme="windows-95">
        <div>content</div>
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('windows-95')
  })

  it('applies windows-standard theme to documentElement', async () => {
    await render(
      <ThemeProvider defaultTheme="windows-standard">
        <div>content</div>
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('windows-standard')
  })

  it('applies rainy-day theme to documentElement', async () => {
    await render(
      <ThemeProvider defaultTheme="rainy-day">
        <div>content</div>
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('rainy-day')
  })

  // === useTheme hook ===

  it('provides theme context via useTheme', async () => {
    const screen = await render(
      <ThemeProvider defaultTheme="rainy-day">
        <ThemeIdConsumer />
      </ThemeProvider>,
    )
    const el = screen.getByTestId('theme')
    await expect.element(el).toHaveTextContent('rainy-day')
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
      <ThemeProvider defaultTheme="rainy-day" attributeTarget={target}>
        <div>content</div>
      </ThemeProvider>,
    )

    expect(target.getAttribute('data-theme')).toBe('rainy-day')
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
