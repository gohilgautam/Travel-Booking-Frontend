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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react';
            }
            if (id.includes('antd') || id.includes('@ant-design/icons') || id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'ui-libs';
            }
            if (id.includes('three') || id.includes('@react-three/fiber') || id.includes('@react-three/drei')) {
              return 'three-js';
            }
            if (id.includes('recharts')) {
              return 'data-viz';
            }
          }
        },
      },
    },
  },
})
