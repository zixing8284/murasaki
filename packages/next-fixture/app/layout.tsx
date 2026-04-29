import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import 'murasaki-react98/globals.css'
import './page.css'

export const metadata: Metadata = {
  title: 'Murasaki React98 Next Fixture',
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
