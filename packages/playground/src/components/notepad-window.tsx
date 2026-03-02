import type { ProcessComponentProps } from '../contexts/process'
import { WindowApp } from './window-app'

export function NotepadWindow({ windowId }: ProcessComponentProps): React.ReactElement | null {
  return (
    <WindowApp windowId={windowId} className="w-[400px] h-[300px] top-[15%] left-[20%]">
      <textarea
        className="w-full h-full resize-none border-none outline-none bg-white p-1 font-mono text-xs"
        placeholder="Type here..."
      />
    </WindowApp>
  )
}
