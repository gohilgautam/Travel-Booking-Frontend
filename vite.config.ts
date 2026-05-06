import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-libs': ['antd', '@ant-design/icons', 'lucide-react', 'framer-motion'],
          'three-js': ['three', '@react-three/fiber', '@react-three/drei'],
          'data-viz': ['recharts'],
        },
      },
    },
  },
})
