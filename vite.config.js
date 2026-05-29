import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,   // fail fast instead of silently drifting to a new port
  },
})
