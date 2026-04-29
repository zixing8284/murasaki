/// <reference types="vitest/config" />
import { cp } from 'node:fs/promises'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

function copyThemeAssetsPlugin() {
  const sourceDir = resolve(__dirname, 'src')
  const distDir = resolve(__dirname, 'dist')
  return {
    name: 'murasaki-copy-theme-assets',
    apply: 'build' as const,
    async closeBundle(): Promise<void> {
      await Promise.all([
        cp(resolve(sourceDir, 'theme.css'), resolve(distDir, 'theme.css')),
        cp(resolve(sourceDir, 'assets'), resolve(distDir, 'assets'), { recursive: true }),
      ])
    },
  }
}

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
    copyThemeAssetsPlugin(),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        styles: resolve(__dirname, 'src/styles.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        banner: chunk => (chunk.name === 'index' ? `'use client';` : ''),
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
    setupFiles: ['tests/setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
  },
})
