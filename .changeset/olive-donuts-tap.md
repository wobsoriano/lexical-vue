---
'lexical-vue': minor
---

Add `useSignalValue`, `useExtensionDependency` and `useExtensionSignalValue`, so Vue can read Lexical extension outputs. Extension outputs are preact signals, and lexical-vue had no way to read one reactively, which made every extension output unreachable from Vue.
