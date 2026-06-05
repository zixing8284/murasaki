import type { ReactElement, ReactNode } from 'react'
import {
  useWindowContext,
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowOverlay,
  WindowProvider,
  WindowTitle,
  WindowTitleBar,
} from '@murasaki-io/react98'

export interface DialogWindowProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * A modal dialog window rendered on top of its parent window.
 * Use this as a shell for any in-window dialog (About, Settings, Confirm, etc.)
 * and provide the dialog-specific content as children.
 *
 * Inherits the parent window's active state so the dialog deactivates
 * together with its parent when focus moves to another window.
 */
export function DialogWindow({
  title,
  onClose,
  children,
}: DialogWindowProps): ReactElement {
  const { state } = useWindowContext()

  return (
    <WindowOverlay positioning="absolute" className="z-50 flex items-center justify-center">
      <WindowProvider active={state.active} positioning="absolute">
        <WindowFrame className="relative">
          <WindowTitleBar>
            <WindowTitle>{title}</WindowTitle>
            <WindowButtons>
              <WindowCloseButton onClick={onClose} />
            </WindowButtons>
          </WindowTitleBar>
          <WindowContent>
            {children}
          </WindowContent>
        </WindowFrame>
      </WindowProvider>
    </WindowOverlay>
  )
}
