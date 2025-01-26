# lexical-vue

## Unreleased

### Major Changes

- 4b6577b: Add type `InitialConfigType` as the type for the `initialConfig`
props of the `LexicalComposer`. The `InitialConfigType` follows the type
created for the [`lexical-react`](https://github.com/facebook/lexical/blob/0d1bb6670f71a70b2ad18243fee7ff4a0309a20f/packages/lexical-react/src/LexicalComposer.tsx#L41C13-L41C30). **Breaking change**: the `initialConfig` parameter is
required to have `namespace` and `onError` properties.

## 0.9.0

### Minor Changes

- 99fa41d: Bump lexical/\* to v0.16.1
