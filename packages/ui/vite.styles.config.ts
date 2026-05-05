import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  plugins: [tailwindcss()],
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
