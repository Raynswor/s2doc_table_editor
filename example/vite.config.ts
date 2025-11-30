import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src')
    }
  },
  server: {
    fs: {
      // Allow serving files from the parent directory (for node_modules)
      allow: ['..', '../..']
    }
  }
})
