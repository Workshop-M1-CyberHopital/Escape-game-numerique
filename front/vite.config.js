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
  // Un build de production appelle l'API sur la même origine (/api, voir config/environment.js) :
  // `vite preview` la redirige vers le backend local, comme nginx dans le conteneur.
  preview: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
})
