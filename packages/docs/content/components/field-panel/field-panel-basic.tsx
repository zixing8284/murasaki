'use client'

import { FieldPanel } from '@murasaky/react98'

const files = ['AUTOEXEC.BAT', 'COMMAND.COM', 'CONFIG.SYS', 'README.TXT', 'SETUP.EXE', 'WIN.COM']

export function FieldPanelBasicDemo(): React.ReactElement {
  return (
    <FieldPanel className="h-28 w-64">
      <ul className="m-0 list-none p-1.5">
        {files.map(file => (
          <li key={file} className="px-1 py-0.5 hover:bg-(--hilight) hover:text-(--hilight-text)">
            {file}
          </li>
        ))}
      </ul>
    </FieldPanel>
  )
}
