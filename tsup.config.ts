import { defineConfig } from 'tsup'
import vuePlugin from 'unplugin-vue/esbuild'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  splitting: false,
  sourcemap: true,
  globalName: 'LexicalVue',
  clean: true,
  external: [/@lexical/],
  dts: false,
  esbuildPlugins: [
    vuePlugin({
      isProduction: true,
    }),
  ],
})
