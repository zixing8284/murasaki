import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import {
  Taskbar,
  TaskbarDivider,
  TaskbarNotificationArea,
  TaskbarSystemClock,
} from '../src'

describe('taskbar', () => {
  it('renders taskbar container with data-area', async () => {
    const screen = await render(
      <Taskbar data-testid="taskbar">
        <span>Apps</span>
      </Taskbar>,
    )

    const taskbar = screen.getByTestId('taskbar')
    await expect.element(taskbar).toHaveAttribute('data-area', 'taskbar')
    await expect.element(screen.getByText('Apps')).toBeInTheDocument()
  })

  it('forwards className on taskbar', async () => {
    const screen = await render(<Taskbar data-testid="taskbar" className="my-taskbar" />)
    expect(screen.getByTestId('taskbar').element().className).toContain('my-taskbar')
  })

  it('renders taskbar divider structure', async () => {
    const screen = await render(<TaskbarDivider data-testid="divider" />)
    const divider = screen.getByTestId('divider').element()
    expect(divider.children.length).toBe(2)
  })

  it('renders notification area children', async () => {
    const screen = await render(
      <TaskbarNotificationArea data-testid="area">
        <span>Net</span>
      </TaskbarNotificationArea>,
    )

    await expect.element(screen.getByText('Net')).toBeInTheDocument()
    expect(screen.getByTestId('area').element().className).toContain('truncate')
  })

  it('renders system clock text', async () => {
    const screen = await render(<TaskbarSystemClock data-testid="clock" />)
    const clock = screen.getByTestId('clock').element()

    expect(clock.textContent?.trim().length ?? 0).toBeGreaterThan(0)
  })
})
