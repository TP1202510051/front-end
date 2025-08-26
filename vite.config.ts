// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  define: {
    // durante el build, cada referencia a `global` pasará a `window`
    global: 'window'
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // polyfills para que las deps de sockjs/stompjs encuentren process y buffer
      process: "process/browser",
      buffer: "buffer"
    }
  },
  optimizeDeps: {
    include: ["process/browser", "buffer"]
  },
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills()
  ]
})
