import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'

import 'nextra-theme-docs/style.css'
import '@murasaki/react98/globals.css'
import './globals.css'

export const metadata: Metadata = {
  title: '@murasaki/react98 Docs',
  description: 'Component documentation and examples for @murasaki/react98.',
}

const navbar = <Navbar logo={<strong>@murasaki/react98</strong>} />
const footer = <Footer>@murasaki/react98 component documentation</Footer>

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<React.ReactElement> {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/zixing8284/murasaki/tree/main/packages/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
