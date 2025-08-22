import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Tree-shaking optimization configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor dependencies for better caching
          vue: ['vue'],
          pinia: ['pinia']
        }
      }
    },
    // Enable aggressive tree-shaking
    minify: 'esbuild',
    // Ensure tree-shaking is enabled
    target: 'es2020'
  },
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  }
})
