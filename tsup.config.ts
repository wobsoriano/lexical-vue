import { defineConfig } from 'tsup'
import vuePlugin from 'unplugin-vue/esbuild'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [/@lexical/, 'yjs'],
  dts: false,
  esbuildPlugins: [
    vuePlugin({
      isProduction: true,
    }),
  ],
})
