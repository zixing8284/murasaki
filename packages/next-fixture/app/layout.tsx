import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@murasaki-io/react98/globals.css'
import './page.css'

export const metadata: Metadata = {
  title: '@murasaki-io/react98 Next Fixture',
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): React.ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
