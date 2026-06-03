import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-markdown', 'react-map-gl/mapbox', 'mapbox-gl']
  }
  ,
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
      '/gifs': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
