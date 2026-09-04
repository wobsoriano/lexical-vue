import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig, lazyPlugins } from 'vite-plus'

export default defineConfig({
  plugins: lazyPlugins(() => [vueJsx()]),
  test: {
    environment: 'happy-dom',
  },
  pack: {
    entry: ['src/**/*.ts', 'src/**/*.tsx'],
    unbundle: true,
    platform: 'browser',
    // Declarations come from `vue-tsc`.
    dts: false,
    plugins: [vueJsx()],
  },
})
