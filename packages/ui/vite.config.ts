/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '#': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react({
      babel: { plugins: ['babel-plugin-react-compiler'] },
    }),
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Preserve module structure for tree-shaking
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          // Rename CSS output to globals.css for package exports compatibility
          if (assetInfo.names?.some(name => name.endsWith('.css'))) {
            return 'globals.css'
          }
          return '[name][extname]'
        },
      },
    },
    // Inline all assets as base64 (Win98 icons are tiny)
    assetsInlineLimit: 100 * 1024, // 100kb, include our fonts and icons
    cssCodeSplit: false,
  },
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
  },
})
