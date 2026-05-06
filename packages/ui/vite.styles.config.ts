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
    cssCodeSplit: true,
    assetsInlineLimit: 100 * 1024,
    lib: {
      entry: {
        globals: resolve(__dirname, 'src/theme.css'),
      },
      formats: ['es'],
    },
  },
})
