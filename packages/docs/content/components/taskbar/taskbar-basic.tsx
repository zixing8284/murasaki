'use client'

import { Button, Taskbar, TaskbarDivider, TaskbarNotificationArea, TaskbarQuickLaunch, TaskbarSystemClock } from '@murasaki/react98'

const iconSrc = 'data:image/gif;base64,R0lGODlhEAAQAPAAAP///wAAACH5BAAAAAAALAAAAAAQABAAAAIhjI+py+0Po5y02ouz3rz7D4biSJbmiaaqKq6H2mJLAQA7'

export function TaskbarBasicDemo(): React.ReactElement {
  return (
    <Taskbar className="w-[360px]">
      <Button className="h-6 px-2 font-bold">Start</Button>
      <TaskbarDivider />
      <TaskbarQuickLaunch
        icons={[
          { src: iconSrc, alt: 'Docs', title: 'Docs' },
          { src: iconSrc, alt: 'Paint', title: 'Paint' },
          { src: iconSrc, alt: 'Media', title: 'Media' },
        ]}
      />
      <div className="min-w-0 flex-1" />
      <TaskbarNotificationArea>
        <TaskbarSystemClock />
      </TaskbarNotificationArea>
    </Taskbar>
  )
}
