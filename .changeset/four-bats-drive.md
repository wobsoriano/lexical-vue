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

```vue
<script setup lang="ts">
import { LexicalComposer } from 'lexical-vue/LexicalComposer'
import { ContentEditable } from 'lexical-vue/LexicalContentEditable'
import { HistoryPlugin } from 'lexical-vue/LexicalHistoryPlugin'
import { PlainTextPlugin } from 'lexical-vue/LexicalPlainTextPlugin'

const config = {
  namespace: 'MyEditor',
  theme: {
    // Theme styling goes here
  },
}
</script>

<template>
  <LexicalComposer :initial-config="config">
    <PlainTextPlugin>
      <template #contentEditable>
        <ContentEditable>
          <template #placeholder>
            <div>Enter some text...</div>
          </template>
        </ContentEditable>
      </template>
    </PlainTextPlugin>
    <HistoryPlugin />
  </LexicalComposer>
</template>
```
