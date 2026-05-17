import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { TaskbarQuickLaunch } from '../src'

const iconSrc = 'data:image/gif;base64,R0lGODlhEAAQAPAAAP///wAAACH5BAAAAAAALAAAAAAQABAAAAIhjI+py+0Po5y02ouz3rz7D4biSJbmiaaqKq6H2mJLAQA7'

const icons = [
  { src: `${iconSrc}#docs`, alt: 'Docs', title: 'Docs' },
  { src: `${iconSrc}#paint`, alt: 'Paint', title: 'Paint' },
  { src: `${iconSrc}#media`, alt: 'Media', title: 'Media' },
]

function queryIcon(container: HTMLElement, alt: string): HTMLImageElement | null {
  return container.querySelector(`img[alt="${alt}"]`)
}

describe('taskbar quick launch', () => {
  it('shows the default visible icon count', async () => {
    const screen = await render(<TaskbarQuickLaunch icons={icons} />)

    expect(queryIcon(screen.container, 'Docs')).not.toBeNull()
    expect(queryIcon(screen.container, 'Paint')).not.toBeNull()
    expect(queryIcon(screen.container, 'Media')).toBeNull()
  })

  it('reflects controlled visibleCount', async () => {
    const screen = await render(<TaskbarQuickLaunch icons={icons} visibleCount={1} />)

    expect(queryIcon(screen.container, 'Docs')).not.toBeNull()
    expect(queryIcon(screen.container, 'Paint')).toBeNull()
    expect(queryIcon(screen.container, 'Media')).toBeNull()
  })

  it('expands hidden icons in uncontrolled mode', async () => {
    const handleVisibleCountChange = vi.fn()
    const screen = await render(
      <TaskbarQuickLaunch icons={icons} onVisibleCountChange={handleVisibleCountChange} />,
    )

    await screen.getByRole('button', { name: 'Show all Quick Launch icons' }).click()

    expect(queryIcon(screen.container, 'Media')).not.toBeNull()
    expect(handleVisibleCountChange).toHaveBeenCalledWith(3)
  })

  it('requests visible count changes without mutating controlled output', async () => {
    const handleVisibleCountChange = vi.fn()
    const screen = await render(
      <TaskbarQuickLaunch icons={icons} visibleCount={1} onVisibleCountChange={handleVisibleCountChange} />,
    )

    await screen.getByRole('button', { name: 'Show all Quick Launch icons' }).click()

    expect(handleVisibleCountChange).toHaveBeenCalledWith(3)
    expect(queryIcon(screen.container, 'Paint')).toBeNull()
  })
})
