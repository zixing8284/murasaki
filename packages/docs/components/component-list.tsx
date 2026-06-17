import type { ReactElement } from 'react'
import Link from 'next/link'

interface ComponentListEntry {
  label: string
  href: string
}

interface ComponentListProps {
  items: ComponentListEntry[]
}

export function ComponentList({ items }: ComponentListProps): ReactElement {
  return (
    <ul className="[columns:2_220px]">
      {items.map(({ label, href }) => (
        <li key={href}>
          <Link href={href}>{label}</Link>
        </li>
      ))}
    </ul>
  )
}
