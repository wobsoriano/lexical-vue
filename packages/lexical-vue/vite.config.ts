import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig, lazyPlugins } from 'vite-plus'
import { VineVitePlugin } from 'vue-vine/vite'

export default defineConfig({
  plugins: lazyPlugins(() => [VineVitePlugin(), vueJsx()]),
  oxc: { exclude: [/\.vine\.ts$/] },
  test: {
    environment: 'happy-dom',
  },
  pack: {
    entry: ['src/**/*.ts', 'src/**/*.tsx'],
    unbundle: true,
    platform: 'browser',
    dts: false,
    plugins: [VineVitePlugin(), vueJsx()],
  },
})
