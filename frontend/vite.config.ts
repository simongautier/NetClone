import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Vite uses the first matching prefix, so the specific routes come first.
    proxy: {
      "/api/downloads": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/api/stream": {
        target: "http://localhost:3002",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
})
