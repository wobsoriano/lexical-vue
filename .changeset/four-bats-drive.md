---
"lexical-vue": minor
---

# Breaking Changes

- Updated to Lexical 0.37.0
- Plugin names now match React equivalents for consistency:
  - `LexicalRichTextEditor` → `RichTextEditor`
  - Other plugins follow similar naming conventions

# New Features

- Individual plugin imports now available to reduce bundle size:
  - `import { RichTextEditor } from 'lexical-vue/LexicalRichTextEditor'`
  - `import { LexicalComposer } from 'lexical-vue/LexicalComposer'`
