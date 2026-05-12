import type { NextConfig } from 'next'
import process from 'node:process'
import nextra from 'nextra'

const withNextra = nextra({})

// Allow GitHub Pages deployments to nest the docs under a subpath
// (e.g. `/murasaki/programs/docs`). When unset, the docs continue to mount
// at `/programs/docs` so local dev and the embedded iframe keep working.
const deployBasePath = process.env.DEPLOY_BASE_PATH?.replace(/\/+$/, '') ?? ''

const nextConfig: NextConfig = {
  basePath: `${deployBasePath}/programs/docs`,
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
