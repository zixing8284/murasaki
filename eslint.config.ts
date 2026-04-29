import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  react: true,
  ignores: [
    'node_modules/',
    '**/node_modules/',
    '**/dist/',
    '**/.next/',
    '**/next-env.d.ts',
    '**/public/',
    '*.css',
    '.github/',
    '**/*.md',
  ],
}, {
  // Next.js App Router files legitimately co-export `metadata`, `viewport`, etc.
  files: ['packages/next-fixture/app/**/*.{ts,tsx}'],
  rules: {
    'react-refresh/only-export-components': 'off',
  },
})
