import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    lightningcss: undefined as any
  },
  preview: {
    allowedHosts: [
      'enchanting-presence-production-c5e5.up.railway.app'
    ]
  }
})
