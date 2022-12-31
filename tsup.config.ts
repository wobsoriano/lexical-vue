import { defineConfig } from 'tsup'
import vuePlugin from 'esbuild-plugin-vue'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: false,
  clean: true,
  external: [/@lexical/],
  dts: false,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    }
  },
  esbuildPlugins: [vuePlugin()],
})
