import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    // Electron's unpatched fs (see src/main/lib/gameManager.ts), provided by Electron at runtime
    build: { rollupOptions: { external: ['original-fs'] } }
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
