import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  react: true,
  ignores: ['dist/', 'node_modules/', 'playground/public/', '*.css', '.github/'],
})
