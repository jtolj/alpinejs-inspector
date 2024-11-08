import { defineConfig } from 'vite'
import { resolve } from 'path'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      },
      input: {
        popup: resolve(__dirname, 'popup/popup.html'),
        devtools: resolve(__dirname, 'devtools/background.html'),
        devtoolsPanel: resolve(__dirname, 'devtools/panel.html'),
        devtoolsConnector: resolve(__dirname, 'src/devtools/devtoolsConnector.ts'),
      },
    },
  },
  plugins: [svelte()],
})
