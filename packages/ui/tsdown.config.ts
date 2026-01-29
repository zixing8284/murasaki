import pluginBabel from '@rollup/plugin-babel'
import { defineConfig } from 'tsdown'
import { svgInlinePlugin } from './src/plugins/svg-inline-plugin'

export default defineConfig({
  platform: 'neutral',
  alias: {
    '#/*': './src/*',
  },
  copy: ['src/assets', 'src/globals.css'],
  entry: ['./src/index.ts'],
  outDir: 'dist',
  plugins: [
    svgInlinePlugin(),
    pluginBabel({
      babelHelpers: 'bundled',
      parserOpts: {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      },
      plugins: ['babel-plugin-react-compiler'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
  ],
})
