'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@murasaki/react98'

const processes = [
  { name: 'Explorer', memory: '14,280 K', status: 'Running' },
  { name: 'Winamp', memory: '8,512 K', status: 'Idle' },
  { name: 'Docs', memory: '21,024 K', status: 'Running' },
]

export function TableBasicDemo(): React.ReactElement {
  return (
    <Table containerClassName="w-80 max-h-40 overflow-auto">
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Memory</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {processes.map((process, index) => (
          <TableRow key={process.name} selected={index === 1}>
            <TableCell>{process.name}</TableCell>
            <TableCell>{process.memory}</TableCell>
            <TableCell>{process.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
