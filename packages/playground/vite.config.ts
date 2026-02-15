import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  plugins: [
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm] }) },
    react({
      include: /\.(jsx|js|mdx|md|tsx|ts)$/,
      babel: { plugins: ['babel-plugin-react-compiler'] },
    }),
    tailwindcss(),
  ],
  build: {
    assetsInlineLimit: 1024 * 4, // 4kb
  },
})
