import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // vite preview bloquea los hosts que no estén acá; sin esto Railway responde 403
  preview: {
    allowedHosts: ['frontend-production-76a1.up.railway.app'],
  },
})
