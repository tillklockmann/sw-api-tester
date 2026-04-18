import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { configStoragePlugin } from './src/vite-plugin-config-storage'

export default defineConfig({
  plugins: [vue(), tailwindcss(), configStoragePlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  json: {
    stringify: true,
  },
  test: {
    globals: true,
  },
})
