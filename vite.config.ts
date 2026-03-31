import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Add this

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),// Add this
  ],
  css: {
    lightningcss: undefined as any
  },
  preview: {
    allowedHosts: [
      'enchanting-presence-production-c5e5.up.railway.app'
    ]
  }
})
