import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Uyarı limitini 500kb'dan 1600kb'a yükseltir
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Büyük kütüphaneleri (Firebase vb.) ayrı parçalara böler
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  }
})
