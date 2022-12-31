import { defineBuildConfig } from 'unbuild'
import vue from '@vitejs/plugin-vue'

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

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  externals: [
    'lexical',
    'vue',
    ...lexicalPlugins.map(plugin => `@lexical/${plugin}`),
  ],
  rollup: {
    emitCJS: true,
  },
  hooks: {
    'rollup:options': function (_ctx, options) {
      if (Array.isArray(options.plugins))
        options.plugins.push(vue())
    },
  },
})
