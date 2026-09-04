import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {
    singleQuote: true,
    semi: false,
  },
  lint: {
    plugins: ['oxc', 'typescript', 'unicorn', 'import', 'promise', 'vue'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'no-unused-vars': [
        'error',
        { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true, varsIgnorePattern: '^_' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'import/no-duplicates': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'typescript/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
      ],
    },
  },
  staged: {
    '*': 'vp check --fix',
  },
  run: {
    cache: true,
    tasks: {
      ready: {
        // The apps import lexical-vue through its exports map, so type-aware
        // lint reads the package's built declarations. Check before build and
        // every one of those imports is unresolvable.
        dependsOn: ['lexical-vue#build'],
        command: ['vp check', 'vp run -r test', 'vp run -r build'],
      },
      release: {
        command: 'changeset publish',
        dependsOn: ['lexical-vue#build'],
        // Publishing to npm must never be replayed from cache.
        cache: false,
      },
    },
  },
})
