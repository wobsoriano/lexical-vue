import { defineConfig } from 'vite-plus'
import { VineVitePlugin } from 'vue-vine/vite'

export default defineConfig({
  pack: {
    entry: ['src/**/*.ts'],
    unbundle: true,
    platform: 'browser',
    // Declarations come from `vue-vine-tsc`, which resolves the `vine` macro types.
    dts: false,
    plugins: [VineVitePlugin()],
  },
})
