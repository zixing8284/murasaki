import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import {
  useWindowContext,
  Window,
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowMaximizeButton,
  WindowMenuBar,
  WindowMenuBarItem,
  WindowMinimizeButton,
  WindowProvider,
  WindowStatusBar,
  WindowStatusBarField,
  WindowTitle,
  WindowTitleBar,
} from '../src'

// Helper: minimal complete window for integration tests
function SimpleWindow(props: Omit<React.ComponentProps<typeof WindowProvider>, 'children'>): React.ReactElement {
  return (
    <WindowProvider {...props}>
      <WindowFrame data-testid="frame">
        <WindowTitleBar data-testid="titlebar">
          <WindowTitle>Test Window</WindowTitle>
          <WindowButtons>
            <WindowMinimizeButton />
            <WindowMaximizeButton />
            <WindowCloseButton />
          </WindowButtons>
        </WindowTitleBar>
        <WindowContent data-testid="content">
          <p>Window body</p>
        </WindowContent>
      </WindowFrame>
    </WindowProvider>
  )
}

function WindowActiveConsumer(): React.ReactElement {
  const { state } = useWindowContext()
  return <span data-testid="active">{String(state.active)}</span>
}

function WindowStateConsumer(): React.ReactElement {
  const { state } = useWindowContext()
  return (
    <div>
      <span data-testid="active">{String(state.active)}</span>
      <span data-testid="maximized">{String(state.maximized)}</span>
      <span data-testid="minimized">{String(state.minimized)}</span>
    </div>
  )
}

function WindowMaximizedConsumer(): React.ReactElement {
  const { state } = useWindowContext()
  return <span data-testid="maximized">{String(state.maximized)}</span>
}

describe('window-provider', () => {
  it('renders children', async () => {
    const screen = await render(
      <WindowProvider>
        <div>child</div>
      </WindowProvider>,
    )
    await expect.element(screen.getByText('child')).toBeInTheDocument()
  })

  it('provides context to child components', async () => {
    const screen = await render(
      <WindowProvider active>
        <WindowActiveConsumer />
      </WindowProvider>,
    )
    await expect.element(screen.getByTestId('active')).toHaveTextContent('true')
  })

  it('provides default state values', async () => {
    const screen = await render(
      <WindowProvider>
        <WindowStateConsumer />
      </WindowProvider>,
    )
    await expect.element(screen.getByTestId('active')).toHaveTextContent('true')
    await expect.element(screen.getByTestId('maximized')).toHaveTextContent('false')
    await expect.element(screen.getByTestId('minimized')).toHaveTextContent('false')
  })
})

describe('window-frame', () => {
  it('renders with absolute positioning by default', async () => {
    const screen = await render(
      <WindowProvider positioning="absolute">
        <WindowFrame data-testid="frame" />
      </WindowProvider>,
    )
    const classes = screen.getByTestId('frame').element().className
    expect(classes).toContain('absolute')
  })

  it('renders with fixed positioning', async () => {
    const screen = await render(
      <WindowProvider positioning="fixed">
        <WindowFrame data-testid="frame" />
      </WindowProvider>,
    )
    const classes = screen.getByTestId('frame').element().className
    expect(classes).toContain('fixed')
  })

  it('is visually hidden when minimized', async () => {
    const screen = await render(
      <WindowProvider minimized>
        <WindowFrame data-testid="frame" />
      </WindowProvider>,
    )
    const classes = screen.getByTestId('frame').element().className
    expect(classes).toContain('invisible')
  })

  it('applies maximized styles when maximized', async () => {
    const screen = await render(
      <WindowProvider defaultMaximized positioning="absolute">
        <WindowFrame data-testid="frame" />
      </WindowProvider>,
    )
    const classes = screen.getByTestId('frame').element().className
    expect(classes).toContain('inset-0!')
  })

  it('forwards custom className', async () => {
    const screen = await render(
      <WindowProvider>
        <WindowFrame data-testid="frame" className="my-class" />
      </WindowProvider>,
    )
    const classes = screen.getByTestId('frame').element().className
    expect(classes).toContain('my-class')
  })
})

describe('window-title-bar', () => {
  it('renders children', async () => {
    const screen = await render(
      <WindowProvider>
        <WindowTitleBar>
          <span>My Title</span>
        </WindowTitleBar>
      </WindowProvider>,
    )
    await expect.element(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('applies active styles when window is active', async () => {
    const screen = await render(
      <WindowProvider active>
        <WindowTitleBar data-testid="titlebar" />
      </WindowProvider>,
    )
    const classes = screen.getByTestId('titlebar').element().className
    expect(classes).toContain('from-(--active-title)')
  })

  it('applies inactive styles when window is not active', async () => {
    const screen = await render(
      <WindowProvider active={false}>
        <WindowTitleBar data-testid="titlebar" />
      </WindowProvider>,
    )
    const classes = screen.getByTestId('titlebar').element().className
    expect(classes).toContain('from-(--inactive-title)')
  })
})

describe('window-buttons', () => {
  it('renders WindowCloseButton with aria-label', async () => {
    const screen = await render(
      <WindowProvider>
        <WindowCloseButton />
      </WindowProvider>,
    )
    await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('renders WindowMinimizeButton with aria-label', async () => {
    const screen = await render(
      <WindowProvider>
        <WindowMinimizeButton />
      </WindowProvider>,
    )
    await expect.element(screen.getByRole('button', { name: 'Minimize' })).toBeInTheDocument()
  })

  it('renders WindowMaximizeButton with aria-label', async () => {
    const screen = await render(
      <WindowProvider>
        <WindowMaximizeButton />
      </WindowProvider>,
    )
    await expect.element(screen.getByRole('button', { name: 'Maximize' })).toBeInTheDocument()
  })

  it('maximize button toggles maximized state', async () => {
    const screen = await render(
      <WindowProvider>
        <WindowMaximizeButton />
        <WindowMaximizedConsumer />
      </WindowProvider>,
    )

    await expect.element(screen.getByTestId('maximized')).toHaveTextContent('false')
    await screen.getByRole('button', { name: 'Maximize' }).click()
    await expect.element(screen.getByTestId('maximized')).toHaveTextContent('true')
    // After maximize, the button should now say "Restore"
    await expect.element(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument()
  })

  it('maximize button is disabled when maximizable is false', async () => {
    const screen = await render(
      <WindowProvider maximizable={false}>
        <WindowMaximizeButton />
      </WindowProvider>,
    )
    await expect.element(screen.getByRole('button', { name: 'Maximize' })).toBeDisabled()
  })

  it('close button calls onClick', async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <WindowProvider>
        <WindowCloseButton onClick={handleClick} />
      </WindowProvider>,
    )
    await screen.getByRole('button', { name: 'Close' }).click()
    expect(handleClick).toHaveBeenCalledOnce()
  })
})

describe('window-content', () => {
  it('renders children', async () => {
    const screen = await render(
      <WindowContent>
        <p>Body text</p>
      </WindowContent>,
    )
    await expect.element(screen.getByText('Body text')).toBeInTheDocument()
  })

  it('forwards custom className', async () => {
    const screen = await render(
      <WindowContent data-testid="content" className="p-4" />,
    )
    const classes = screen.getByTestId('content').element().className
    expect(classes).toContain('p-4')
    expect(classes).toContain('flex-1')
  })
})

describe('window-status-bar', () => {
  it('renders children', async () => {
    const screen = await render(
      <WindowStatusBar>
        <WindowStatusBarField>Ready</WindowStatusBarField>
      </WindowStatusBar>,
    )
    await expect.element(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('status bar field applies grow variant', async () => {
    const screen = await render(
      <WindowStatusBarField data-testid="field" grow>
        Field
      </WindowStatusBarField>,
    )
    const classes = screen.getByTestId('field').element().className
    expect(classes).toContain('grow')
  })

  it('status bar field applies no-grow variant', async () => {
    const screen = await render(
      <WindowStatusBarField data-testid="field" grow={false}>
        Field
      </WindowStatusBarField>,
    )
    const classes = screen.getByTestId('field').element().className
    expect(classes).toContain('grow-0')
  })
})

describe('window-menu-bar', () => {
  it('renders menu items', async () => {
    const screen = await render(
      <WindowMenuBar>
        <WindowMenuBarItem>File</WindowMenuBarItem>
        <WindowMenuBarItem>Edit</WindowMenuBarItem>
      </WindowMenuBar>,
    )
    await expect.element(screen.getByText('File')).toBeInTheDocument()
    await expect.element(screen.getByText('Edit')).toBeInTheDocument()
  })
})

describe('window integration', () => {
  it('renders a complete window assembly', async () => {
    const screen = await render(<SimpleWindow />)
    await expect.element(screen.getByText('Test Window')).toBeInTheDocument()
    await expect.element(screen.getByText('Window body')).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Minimize' })).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Maximize' })).toBeInTheDocument()
  })

  it('maximize button toggles state in full assembly', async () => {
    const screen = await render(<SimpleWindow />)
    const frame = screen.getByTestId('frame').element()

    // Initially not maximized
    expect(frame.className).not.toContain('inset-0!')

    // Click maximize
    await screen.getByRole('button', { name: 'Maximize' }).click()

    // Should now be maximized
    expect(frame.className).toContain('inset-0!')

    // Button should now say Restore
    await expect.element(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument()
  })
})

describe('window (convenience)', () => {
  it('renders title and content', async () => {
    const screen = await render(
      <Window title="My Document">
        <p>Hello from 1998!</p>
      </Window>,
    )
    await expect.element(screen.getByText('My Document')).toBeInTheDocument()
    await expect.element(screen.getByText('Hello from 1998!')).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Minimize' })).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: 'Maximize' })).toBeInTheDocument()
  })

  it('applies defaultPosition and defaultSize as inline styles', async () => {
    const screen = await render(
      <Window
        data-testid="frame"
        title="Doc"
        defaultPosition={{ x: 80, y: 60 }}
        defaultSize={{ width: 320, height: 240 }}
      >
        body
      </Window>,
    )
    const frame = screen.getByTestId('frame').element() as HTMLElement
    expect(frame.style.left).toBe('80px')
    expect(frame.style.top).toBe('60px')
    expect(frame.style.width).toBe('320px')
    expect(frame.style.height).toBe('240px')
  })

  it('fires onClose and onMinimize', async () => {
    const handleClose = vi.fn()
    const handleMinimize = vi.fn()
    const screen = await render(
      <Window title="Doc" onClose={handleClose} onMinimize={handleMinimize}>
        body
      </Window>,
    )
    await screen.getByRole('button', { name: 'Close' }).click()
    await screen.getByRole('button', { name: 'Minimize' }).click()
    expect(handleClose).toHaveBeenCalledOnce()
    expect(handleMinimize).toHaveBeenCalledOnce()
  })

  it('omits minimize/close buttons when disabled', async () => {
    const screen = await render(
      <Window title="Doc" minimizable={false} closable={false}>
        body
      </Window>,
    )
    expect(screen.container.querySelector('button[aria-label="Minimize"]')).toBeNull()
    expect(screen.container.querySelector('button[aria-label="Close"]')).toBeNull()
    await expect.element(screen.getByRole('button', { name: 'Maximize' })).toBeInTheDocument()
  })

  it('omits the resize grip when resizable is false', async () => {
    const screen = await render(
      <Window title="Doc" resizable={false}>
        body
      </Window>,
    )
    expect(screen.container.querySelector('[data-resize-handle]')).toBeNull()
  })
})
