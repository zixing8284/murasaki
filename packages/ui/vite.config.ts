/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rolldownOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react/compiler-runtime'],
      output: {
        banner: chunk => (chunk.name === 'index' ? `'use client';` : ''),
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
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
