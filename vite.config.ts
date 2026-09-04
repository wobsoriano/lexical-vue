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
      // Raw TypeScript diagnostics are left to `vue-vine-tsc` and `vue-tsc`,
      // which understand `.vine.ts` macros and `.vue` SFCs. Oxlint does not.
      typeCheck: false,
    },
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'import/no-duplicates': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'typescript/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
      ],
    },
    overrides: [
      {
        // Oxlint cannot parse vue-vine's `vine` template macro, so anything
        // referenced only from a component template reads as unused.
        files: ['**/*.vine.ts'],
        rules: {
          'no-unused-vars': 'off',
        },
      },
    ],
  },
  staged: {
    '*': 'vp check --fix',
    // Report only. No enabled rule is auto-fixable, and a hook that rewrites
    // vine templates on commit is a hazard, not a convenience.
    '*.vine.ts': 'eslint',
  },
  run: {
    cache: true,
    tasks: {
      // `vp check` does not cover this. See eslint.config.mjs.
      'lint:vine': 'eslint',
      ready: ['vp check', 'vp run lint:vine', 'vp run -r test', 'vp run -r build'],
      release: {
        command: 'changeset publish',
        dependsOn: ['lexical-vue#build'],
        // Publishing to npm must never be replayed from cache.
        cache: false,
      },
    },
  },
})
