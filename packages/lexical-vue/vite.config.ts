import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'

const pkgName = pkg.name
const external = ['vue', 'lexical', '@lexical/text']

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: pkgName,
      fileName: format => `${pkgName}.${format}.js`,
    },
    rollupOptions: {
      external,
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
    emptyOutDir: false,
  },
})
