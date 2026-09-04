import { defineConfig, lazyPlugins } from 'vite-plus'
import { VineVitePlugin } from 'vue-vine/vite'

export default defineConfig({
  plugins: lazyPlugins(() => [VineVitePlugin()]),
  oxc: { exclude: [/\.vine\.ts$/] },
  test: {
    environment: 'happy-dom',
  },
  pack: {
    entry: ['src/**/*.ts'],
    unbundle: true,
    platform: 'browser',
    // Declarations come from `vue-vine-tsc`, which resolves the `vine` macro types.
    dts: false,
    plugins: [VineVitePlugin()],
  },
})
