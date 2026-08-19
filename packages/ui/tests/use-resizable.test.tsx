import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { useResizable } from '../src'

function ResizableHarness({
  onResizeChange,
}: {
  onResizeChange?: (resizing: boolean) => void
}): React.ReactElement {
  const [handleRef, setHandleRefState] = useState<HTMLDivElement | null>(null)
  const {
    resetSize,
    resizing,
    setResizeRef,
    setTargetRef,
  } = useResizable<HTMLDivElement, HTMLDivElement>({
    minWidth: 120,
    minHeight: 80,
    onResizeChange,
    resizable: true,
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
          width: '200px',
          height: '120px',
        }}
      >
        Target
      </div>
      <div
        ref={(el) => {
          setResizeRef(el)
          setHandleRefState(el)
        }}
        data-testid="handle"
      />
      <span data-testid="resizing">{String(resizing)}</span>
      <button type="button" data-testid="reset" onClick={resetSize}>
        Reset
      </button>
      <span data-testid="handle-ready">{String(Boolean(handleRef))}</span>
    </div>
  )
}

describe('use-resizable', () => {
  it('starts resize only after threshold and calls onResizeChange on start/end', async () => {
    const handleResizeChange = vi.fn()
    const screen = await render(<ResizableHarness onResizeChange={handleResizeChange} />)

    const handle = screen.getByTestId('handle').element()
    const target = screen.getByTestId('target').element() as HTMLDivElement

    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }))
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 102, clientY: 102 }))

    await expect.element(screen.getByTestId('resizing')).toHaveTextContent('false')
    expect(handleResizeChange).not.toHaveBeenCalled()

    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 140, clientY: 130 }))

    await expect.element(screen.getByTestId('resizing')).toHaveTextContent('true')
    expect(target.style.width).not.toBe('')
    expect(target.style.height).not.toBe('')
    expect(handleResizeChange).toHaveBeenCalledWith(true)

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    await expect.element(screen.getByTestId('resizing')).toHaveTextContent('false')
    expect(handleResizeChange).toHaveBeenCalledWith(false)
  })

  it('respects minimum constraints while resizing', async () => {
    const screen = await render(<ResizableHarness />)

    const handle = screen.getByTestId('handle').element()
    const target = screen.getByTestId('target').element() as HTMLDivElement

    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 180, clientY: 180 }))
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: -100, clientY: -100 }))
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    expect(Number.parseFloat(target.style.width)).toBeGreaterThanOrEqual(120)
    expect(Number.parseFloat(target.style.height)).toBeGreaterThanOrEqual(80)
  })

  it('resets size when resetSize is called', async () => {
    const screen = await render(<ResizableHarness />)

    const handle = screen.getByTestId('handle').element()
    const target = screen.getByTestId('target').element() as HTMLDivElement

    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }))
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 140, clientY: 130 }))
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    expect(target.style.width).not.toBe('')
    expect(target.style.height).not.toBe('')

    await screen.getByTestId('reset').click()

    expect(target.style.width).toBe('')
    expect(target.style.height).toBe('')
  })
})
