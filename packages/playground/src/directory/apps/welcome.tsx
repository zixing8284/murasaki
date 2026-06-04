import type { ReactElement } from 'react'
import type { ProcessComponentProps } from '../../contexts/process'
import {
  Button,
  Divider,
  MenuItem,
  ScrollArea,
  WindowMenuBar,
  WindowMenuBarContent,
  WindowMenuBarMenu,
  WindowMenuBarTrigger,
  WindowStatusBar,
  WindowStatusBarField,
} from '@murasaky/react98'
import { useState } from 'react'
import { assetPath } from '../../lib/asset-path'
import { InactiveClickGuard } from '../../shell/window/inactive-click-guard'
import { DialogWindow } from '../shared/dialog-window'

function AboutDialog({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <DialogWindow title="About Murasaki" onClose={onClose}>
      <div className="flex flex-col items-center gap-3 p-4 w-72">
        <img
          src={assetPath('/icons/windows98-icons/png/user_computer-0.png')}
          alt="welcome"
          className="size-12 pixelated"
          draggable={false}
        />
        <div className="text-center">
          <p className="font-bold">Murasaki</p>
          <p className="mt-1">Windows 98 style React component library</p>
          <p className="mt-0.5 text-(--gray-text)">@murasaky/react98</p>
        </div>
        <Divider className="w-full" />
        <Button className="px-6" onClick={onClose}>Close</Button>
      </div>
    </DialogWindow>
  )
}

function MenuLabel({ menu }: { menu: string }): ReactElement {
  const [accelerator = '', ...rest] = menu

  return (
    <>
      <span className="underline">{accelerator}</span>
      {rest.join('')}
    </>
  )
}

export function Welcome({ windowId }: ProcessComponentProps): ReactElement {
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="relative flex h-full flex-col">
      <InactiveClickGuard windowId={windowId} className="shrink-0">
        <WindowMenuBar className="h-5">
          <WindowMenuBarMenu value="help">
            <WindowMenuBarTrigger><MenuLabel menu="Help" /></WindowMenuBarTrigger>
            <WindowMenuBarContent className="w-48">
              <MenuItem reserveIconSpace onClick={() => setShowAbout(true)}>About Murasaki</MenuItem>
            </WindowMenuBarContent>
          </WindowMenuBarMenu>
        </WindowMenuBar>
      </InactiveClickGuard>
      <ScrollArea className="flex-1 min-h-0 bg-(--window) p-4 text-(--window-text)">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={assetPath('/icons/windows98-icons/png/user_computer-0.png')}
            alt="welcome"
            className="size-16 pixelated shrink-0"
            draggable={false}
          />
          <div>
            <h1 className="text-base font-bold mb-1">Welcome to Murasaki!</h1>
            <p className="text-(--gray-text)">Windows 98 style React component library</p>
          </div>
        </div>

        <Divider className="mb-3" />

        <section className="mb-4">
          <h2 className="font-bold mb-1">What is this?</h2>
          <p>
            Murasaki is a React component library that faithfully recreates the Windows 98 aesthetic.
            It ships as
            {' '}
            <a
              href="https://www.npmjs.com/package/@murasaky/react98"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--highlight) underline"
            >
              @murasaky/react98
            </a>
            {' '}
            on npm (not yet) and powers this playground &mdash; a fully interactive Windows 98 desktop
            running in your browser.
          </p>
        </section>

        <section className="mb-4">
          <h2 className="font-bold mb-1">Why?</h2>
          <p>
            The millennium era carries the warmth of childhood memories.
            Those chunky pixels, the classic desktop, the familiar chime &mdash;
            bringing them back with React is something that simply makes me happy.
          </p>
          <p className="mt-1 italic text-(--gray-text)">
            life is hard. 做这个项目本身让我很开心。
          </p>
        </section>

        <section className="mb-4">
          <h2 className="font-bold mb-1">Acknowledgments</h2>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>
              <a href="https://jdan.github.io/98.css/" target="_blank" rel="noopener noreferrer" className="text-(--highlight) underline">
                98.css
              </a>
              {' '}
              &mdash; CSS styles
            </li>
            <li>
              <a href="https://github.com/tpenguinltg/winclassic" target="_blank" rel="noopener noreferrer" className="text-(--highlight) underline">
                winclassic
              </a>
              {' '}
              &mdash; theme variable definitions
            </li>
            <li>
              <a href="https://github.com/react95-io/React95" target="_blank" rel="noopener noreferrer" className="text-(--highlight) underline">
                React95
              </a>
              {' '}
              &mdash; component design reference
            </li>
            <li>
              <a href="https://github.com/DustinBrett/daedalOS" target="_blank" rel="noopener noreferrer" className="text-(--highlight) underline">
                daedalOS
              </a>
              {' '}
              &mdash; code organization and design
            </li>
            <li>
              <a href="https://win99.dev/" target="_blank" rel="noopener noreferrer" className="text-(--highlight) underline">
                win99.dev
              </a>
              {' '}
              &mdash; UI style reference
            </li>
            <li>
              <a href="https://github.com/nielssp/classic-stylesheets" target="_blank" rel="noopener noreferrer" className="text-(--highlight) underline">
                classic-stylesheets
              </a>
              {' '}
              &mdash; theme resources
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold mb-1">Code Reference</h2>
          <p>
            Source code is available on
            {' '}
            <a
              href="https://github.com/zixing8284/murasaki"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--highlight) underline"
            >
              GitHub
            </a>
            . The project is a pnpm workspace with four packages: the UI library, this playground,
            a Nextra documentation site, and a Next.js integration fixture.
          </p>
        </section>
      </ScrollArea>

      <WindowStatusBar className="shrink-0 pt-1">
        <WindowStatusBarField className="truncate">
          Welcome to Murasaki
        </WindowStatusBarField>
      </WindowStatusBar>

      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
    </div>
  )
}
