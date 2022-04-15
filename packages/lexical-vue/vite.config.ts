import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'

const pkgName = pkg.name
const lexicalPlugins = ['text', 'clipboard', 'utils', 'dragon', 'plain-text']

const globals: Record<string, string> = {}

lexicalPlugins.forEach((plugin) => {
  globals[`@lexical/${plugin}`] = `Lexical${plugin.charAt(0).toUpperCase() + plugin.slice(1)}`
})

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: pkgName,
      fileName: format => `${pkgName}.${format}.js`,
    },
    rollupOptions: {
      external: [
        'vue',
        'lexical',
        ...lexicalPlugins.map(plugin => `@lexical/${plugin}`),
      ],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          lexical: 'Lexical',
          ...globals,
        },
      },
    },
    emptyOutDir: false,
  },
})
