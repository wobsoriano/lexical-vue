import VueVinePlugin, { vineParser } from '@vue-vine/eslint-plugin'

// Oxlint lints everything else. ESLint runs only on `.vine.ts`, because
// `vineParser` is the only parser that resolves identifiers referenced inside a
// `vine` template. Without it `no-unused-vars` reports every template-only
// binding as dead, which is why that rule is off for these files in Oxlint.
//
// Rules are listed explicitly rather than spread from `@vue-vine/eslint-config`,
// whose `format-*` rules reformat vine templates and fight Oxfmt.
export default [
  { ignores: ['**/dist', '**/node_modules', '**/.vitepress/cache'] },
  {
    files: ['**/*.vine.ts'],
    plugins: { 'vue-vine': VueVinePlugin },
    languageOptions: { parser: vineParser },
    rules: {
      'no-unused-vars': [
        'error',
        {
          args: 'none',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      'vue-vine/essentials-no-child-content': 'error',
      'vue-vine/essentials-no-dupe-attributes': 'error',
      'vue-vine/essentials-no-dupe-else-if': 'error',
      'vue-vine/essentials-no-lifecycle-hook-after-await': 'error',
      'vue-vine/essentials-no-v-for-key-on-child': 'error',
    },
  },
]
