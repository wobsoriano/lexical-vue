import { defineConfig } from '@rslib/core'
import { pluginVueVine } from 'vue-vine/rsbuild'

export default defineConfig({
  lib: [
    {
      bundle: false,
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginVueVine()],
})
