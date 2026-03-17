import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    svgr(),
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/svg': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/svg/, '/api/svg'),
      },
      '/png': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/png/, '/api/png'),
      }
    }
  }
})
