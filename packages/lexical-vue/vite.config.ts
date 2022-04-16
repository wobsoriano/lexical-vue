import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'

const pkgName = pkg.name
const lexicalPlugins = [
  'clipboard',
  'list',
  'table',
  'yjs',
  'hashtag',
  'selection',
  'code',
  'link',
  'overflow',
  'markdown',
  'text',
  'utils',
  'dragon',
  'plain-text',
  'history',
  'rich-text',
]

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: pkgName,
      formats: ['es', 'cjs'],
      fileName: format => `${pkgName}.${format}.js`,
    },
    rollupOptions: {
      external: [
        'vue',
        'lexical',
        ...lexicalPlugins.map(plugin => `@lexical/${plugin}`),
      ],
    },
    emptyOutDir: false,
  },
})
