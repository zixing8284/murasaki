import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { useDraggable, useResizable } from '../src'

function DragProbe({ scale }: { scale: number }): React.ReactElement {
  const { setTargetRef, setDragRef } = useDraggable<HTMLDivElement, HTMLDivElement>({ draggable: true })
  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: 800, height: 800, position: 'relative' }}>
      <div ref={setTargetRef} data-testid="target" style={{ position: 'absolute', top: 100, left: 100, width: 200, height: 120 }}>
        <div ref={setDragRef} data-testid="handle" style={{ width: 200, height: 24 }}>handle</div>
      </div>
    </div>
  )
}

function ResizeProbe({ scale }: { scale: number }): React.ReactElement {
  const { setTargetRef, setResizeRef } = useResizable<HTMLDivElement, HTMLDivElement>({ resizable: true, minWidth: 50, minHeight: 50 })
  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: 1200, height: 1200, position: 'relative' }}>
      <div ref={setTargetRef} data-testid="target" style={{ position: 'absolute', top: 40, left: 40, width: 200, height: 120, boxSizing: 'border-box' }}>
        <div ref={setResizeRef} data-testid="grip" style={{ position: 'absolute', right: 0, bottom: 0, width: 16, height: 16 }} />
      </div>
    </div>
  )
}

// Mirrors a window: the drag listener sits on the frame, the title bar is the
// coordinate handle region, and a menubar sibling sits directly below it.
function SiblingSnapProbe(): React.ReactElement {
  const { setTargetRef, setDragRef, setHandleRef } = useDraggable<HTMLDivElement, HTMLDivElement>({ draggable: true })
  const setFrame = (el: HTMLDivElement | null): void => {
    setTargetRef(el)
    setDragRef(el)
  }
  return (
    <div style={{ position: 'relative', width: 600, height: 500 }}>
      <div ref={setFrame} data-testid="frame" style={{ position: 'absolute', top: 60, left: 60, width: 300, height: 200 }}>
        <div ref={setHandleRef} data-testid="titlebar" style={{ width: 300, height: 20 }}>title</div>
        <div data-testid="menubar" style={{ width: 300, height: 20 }}>menu</div>
        <div data-testid="content" style={{ width: 300, height: 160 }}>content</div>
      </div>
    </div>
  )
}

function dispatchTouch(el: Element, type: string, x: number, y: number): void {
  const touch = new Touch({
    identifier: 1,
    target: el,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
  })
  const ended = type === 'touchend' || type === 'touchcancel'
  el.dispatchEvent(new TouchEvent(type, {
    changedTouches: [touch],
    touches: ended ? [] : [touch],
    targetTouches: ended ? [] : [touch],
    bubbles: true,
    cancelable: true,
  }))
}

describe('useDraggable / useResizable under a scaled ancestor', () => {
  it('converts drag deltas into local space (translate = screenDelta / scale)', async () => {
    const scale = 0.5
    const screen = await render(<DragProbe scale={scale} />)
    const handle = screen.getByTestId('handle').element()
    const target = screen.getByTestId('target').element() as HTMLElement

    const rect = handle.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2

    dispatchTouch(handle, 'touchstart', startX, startY)
    // Screen delta of (40, 30) at scale 0.5 → local translate of (80, 60).
    dispatchTouch(document.body, 'touchmove', startX + 40, startY + 30)
    dispatchTouch(document.body, 'touchend', startX + 40, startY + 30)

    expect(target.style.transform).toBe('translate(80px, 60px)')
  })

  it('is identity at scale 1 (translate = screenDelta)', async () => {
    const screen = await render(<DragProbe scale={1} />)
    const handle = screen.getByTestId('handle').element()
    const target = screen.getByTestId('target').element() as HTMLElement

    const rect = handle.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2

    dispatchTouch(handle, 'touchstart', startX, startY)
    dispatchTouch(document.body, 'touchmove', startX + 25, startY + 15)
    dispatchTouch(document.body, 'touchend', startX + 25, startY + 15)

    expect(target.style.transform).toBe('translate(25px, 15px)')
  })

  it('converts resize deltas into local size space (size += screenDelta / scale)', async () => {
    const scale = 0.5
    const screen = await render(<ResizeProbe scale={scale} />)
    const grip = screen.getByTestId('grip').element()
    const target = screen.getByTestId('target').element() as HTMLElement

    const rect = grip.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2

    dispatchTouch(grip, 'touchstart', startX, startY)
    // Screen delta of (30, 20) at scale 0.5 → local size delta of (60, 40).
    dispatchTouch(document.body, 'touchmove', startX + 30, startY + 20)
    dispatchTouch(document.body, 'touchend', startX + 30, startY + 20)

    expect(target.style.width).toBe('260px')
    expect(target.style.height).toBe('160px')
  })

  it('starts a drag when touch-adjustment snaps the target to a sibling below the title bar', async () => {
    const screen = await render(<SiblingSnapProbe />)
    const frame = screen.getByTestId('frame').element() as HTMLElement
    const titlebar = screen.getByTestId('titlebar').element()
    const menubar = screen.getByTestId('menubar').element()

    const tb = titlebar.getBoundingClientRect()
    const startX = tb.left + 40
    const startY = tb.bottom - 1 // lower edge of the title bar; touch circle overlaps the menubar

    // Dispatch touchstart on the MENUBAR sibling (as Chrome's touch-adjustment
    // would redirect it), but with coordinates that land on the title bar.
    dispatchTouch(menubar, 'touchstart', startX, startY)
    dispatchTouch(document.body, 'touchmove', startX + 40, startY + 30)
    dispatchTouch(document.body, 'touchend', startX + 40, startY + 30)

    expect(frame.style.transform).toBe('translate(40px, 30px)')
  })
})
