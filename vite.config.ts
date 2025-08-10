import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: true,
    },
  },
  // Environment variables are handled automatically by Vite for VITE_ prefixed variables
  // No additional configuration needed for the API endpoints
})
