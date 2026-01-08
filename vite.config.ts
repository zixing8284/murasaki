/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

export default defineConfig({
  root: './playground',
  plugins: [
    react({
      babel: { plugins: ['babel-plugin-react-compiler'] },
    }),
    tailwindcss(),
  ],
  test: {
    root: '.',
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
  },
})
