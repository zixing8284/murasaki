import { cp } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

function copyThemeSourceAssetsPlugin() {
  const sourceDir = resolve(__dirname, 'src')
  const distDir = resolve(__dirname, 'dist')

  return {
    name: 'murasaki-copy-theme-source-assets',
    apply: 'build' as const,
    async closeBundle(): Promise<void> {
      await Promise.all([
        cp(resolve(sourceDir, 'theme.css'), resolve(distDir, 'theme.css')),
        cp(resolve(sourceDir, 'assets'), resolve(distDir, 'assets'), {
          filter: source => basename(source) !== '.DS_Store',
          recursive: true,
        }),
      ])
    },
  }
}

export default defineConfig({
  root: '.',
  plugins: [tailwindcss(), copyThemeSourceAssetsPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    copyPublicDir: false,
    assetsInlineLimit: 100 * 1024,
    rollupOptions: {
      input: resolve(__dirname, 'src/theme.css'),
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some(name => name.endsWith('.css'))) {
            return 'globals.css'
          }

          return 'assets/[name][extname]'
        },
      },
    },
  },
})
