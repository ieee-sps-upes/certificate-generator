import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // During dev, any request starting with /api is forwarded to Flask
      '/api': {
        target: 'https://certificate-generator-k6ab.onrender.com',
        changeOrigin: true,
      }
    }
  }
})

