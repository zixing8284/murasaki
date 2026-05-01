import type { NextConfig } from 'next'
import nextra from 'nextra'

const withNextra = nextra({})

const nextConfig: NextConfig = {
  basePath: '/programs/docs',
  output: 'export',
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.tsx',
    },
  },
}

export default withNextra(nextConfig)
