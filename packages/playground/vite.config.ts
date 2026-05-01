import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  plugins: [
    react({
      include: /\.(jsx|js|tsx|ts)$/,
      babel: { plugins: ['babel-plugin-react-compiler'] },
    }),
    tailwindcss(),
  ],
  build: {
    assetsInlineLimit: 1024 * 4, // 4kb
  },
})
