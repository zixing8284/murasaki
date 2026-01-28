import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  react: true,
  ignores: [
    'node_modules/',
    '**/node_modules/',
    '**/dist/',
    '**/public/',
    '*.css',
    '.github/',
  ],
})
