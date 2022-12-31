import { defineBuildConfig } from 'unbuild'

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
    { builder: 'mkdist', input: './src/' },
    { builder: 'mkdist', input: './src/', ext: 'cjs', format: 'cjs' },
  ],
  declaration: true,
  clean: true,
  rollup: {
    cjsBridge: true,
  },
  // Externals property here is unnecessary because of mkdist but just in case...
  externals: [
    'lexical',
    'vue',
    ...lexicalPlugins.map(plugin => `@lexical/${plugin}`),
  ],
})
