import type { ProcessComponentProps } from '../../contexts/process'
import { RndWindow } from '../../shell/window/rnd-window'

export function Notepad({ windowId }: ProcessComponentProps): React.ReactElement | null {
  return (
    <RndWindow windowId={windowId} className="w-[400px] h-[300px] top-[15%] left-[20%]">
      <textarea
        className="w-full h-full resize-none border-none outline-none bg-white p-1 font-mono text-xs"
        placeholder="Type here..."
      />
    </RndWindow>
  )
}
