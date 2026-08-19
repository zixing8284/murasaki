import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { useDraggable } from '../src'

function DraggableHarness({
  onDragChange,
}: {
  onDragChange?: (dragging: boolean) => void
}): React.ReactElement {
  const [dragRef, setDragRefState] = useState<HTMLDivElement | null>(null)
  const {
    dragging,
    resetPosition,
    setDragRef,
    setTargetRef,
  } = useDraggable<HTMLDivElement, HTMLDivElement>({
    draggable: true,
    onDragChange,
  })

  return (
    <div>
      <div
        ref={setTargetRef}
        data-testid="target"
        style={{
          left: '20px',
          position: 'absolute',
          top: '20px',
          width: '100px',
          height: '60px',
        }}
      >
        Target
      </div>
      <div
        ref={(el) => {
          setDragRef(el)
          setDragRefState(el)
        }}
        data-testid="handle"
      >
        <button type="button" data-testid="inner-button">
          Inner
        </button>
      </div>
      <span data-testid="dragging">{String(dragging)}</span>
      <button type="button" data-testid="reset" onClick={resetPosition}>
        Reset
      </button>
      <span data-testid="handle-ready">{String(Boolean(dragRef))}</span>
    </div>
  )
}

describe('use-draggable', () => {
  it('starts drag only after threshold and calls onDragChange on start/end', async () => {
    const handleDragChange = vi.fn()
    const screen = await render(<DraggableHarness onDragChange={handleDragChange} />)

    const handle = screen.getByTestId('handle').element()
    const target = screen.getByTestId('target').element() as HTMLDivElement

    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 40, clientY: 40 }))
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 42, clientY: 42 }))

    await expect.element(screen.getByTestId('dragging')).toHaveTextContent('false')
    expect(handleDragChange).not.toHaveBeenCalled()

    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 55, clientY: 55 }))

    await expect.element(screen.getByTestId('dragging')).toHaveTextContent('true')
    expect(target.style.transform).toContain('translate(')
    expect(handleDragChange).toHaveBeenCalledWith(true)

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    await expect.element(screen.getByTestId('dragging')).toHaveTextContent('false')
    expect(handleDragChange).toHaveBeenCalledWith(false)
  })

  it('ignores interactive mousedown targets inside handle', async () => {
    const handleDragChange = vi.fn()
    const screen = await render(<DraggableHarness onDragChange={handleDragChange} />)

    const button = screen.getByTestId('inner-button').element()
    const target = screen.getByTestId('target').element() as HTMLDivElement

    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 40, clientY: 40 }))
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 60, clientY: 60 }))
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    await expect.element(screen.getByTestId('dragging')).toHaveTextContent('false')
    expect(target.style.transform).toBe('')
    expect(handleDragChange).not.toHaveBeenCalled()
  })

  it('resets transform when resetPosition is called', async () => {
    const screen = await render(<DraggableHarness />)

    const handle = screen.getByTestId('handle').element()
    const target = screen.getByTestId('target').element() as HTMLDivElement

    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 40, clientY: 40 }))
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 60, clientY: 60 }))
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    expect(target.style.transform).toContain('translate(')

    await screen.getByTestId('reset').click()

    expect(target.style.transform).toBe('')
  })
})
