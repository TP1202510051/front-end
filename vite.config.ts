// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig(({ command, mode }) => {
  if (mode === 'e2e' && command === 'build') {
    throw new Error('The deterministic E2E authentication adapter cannot be built for deployment.')
  }

  return {
    define: {
      // durante el build, cada referencia a `global` pasará a `window`
      global: 'window'
    },
    resolve: {
      alias: [
        {
          find: '@/realtime/operation-channel',
          replacement: path.resolve(
            __dirname,
            mode === 'e2e'
              ? './tests/e2e/support/operation-channel.ts'
              : './src/realtime/operation-channel.ts',
          ),
        },
        {
          find: '@/auth/auth-session',
          replacement: path.resolve(
            __dirname,
            mode === 'e2e'
              ? './tests/e2e/support/auth-session.ts'
              : './src/auth/auth-session.ts',
          ),
        },
        { find: '@', replacement: path.resolve(__dirname, './src') },
        // polyfills para que las deps de sockjs/stompjs encuentren process y buffer
        { find: 'process', replacement: 'process/browser' },
        { find: 'buffer', replacement: 'buffer' },
      ],
    },
    optimizeDeps: {
      include: ["process/browser", "buffer"]
    },
    plugins: [
      react(),
      tailwindcss(),
      nodePolyfills()
    ]
  }
})
