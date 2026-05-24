import type { ReactElement, ReactNode } from 'react'
import {
  WindowButtons,
  WindowCloseButton,
  WindowContent,
  WindowFrame,
  WindowOverlay,
  WindowProvider,
  WindowTitle,
  WindowTitleBar,
} from '@murasaki/react98'

export interface DialogWindowProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * A modal dialog window rendered on top of its parent window.
 * Use this as a shell for any in-window dialog (About, Settings, Confirm, etc.)
 * and provide the dialog-specific content as children.
 */
export function DialogWindow({
  title,
  onClose,
  children,
}: DialogWindowProps): ReactElement {
  return (
    <WindowOverlay positioning="absolute" className="z-50 flex items-center justify-center">
      <WindowProvider positioning="absolute">
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
