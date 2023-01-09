# Getting started with Vue

> Requires Vue 3.2.0 or higher.

Install `lexical` and `lexical-vue`:

```bash
pnpm add lexical lexical-vue # or npm or yarn
```

Below is an example of a basic plain text editor using `lexical` and `lexical-vue`.

```vue
<script setup lang="ts">
import { $getRoot, $getSelection } from 'lexical'
import { ref } from 'vue'

import {
  LexicalAutoFocusPlugin,
  LexicalComposer,
  LexicalContentEditable,
  LexicalHistoryPlugin,
  LexicalOnChangePlugin,
  LexicalPlainTextPlugin,
} from 'lexical-vue'

const config = {
  editable: true,
  theme: {
    // Theme styling goes here
  },
  onError(error) {
    console.error(error)
  },
}

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(editorState) {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot()
    const selection = $getSelection()

    console.log(root, selection)
  })
}

// Two-way binding
const content = ref('')
</script>

<template>
  <LexicalComposer :initial-config="config">
    <LexicalPlainTextPlugin>
      <template #contentEditable>
        <LexicalContentEditable />
      </template>
      <template #placeholder>
        <div>
          Enter some text...
        </div>
      </template>
    </LexicalPlainTextPlugin>
    <LexicalOnChangePlugin v-model="content" @change="onChange" />
    <LexicalHistoryPlugin />
    <LexicalAutoFocusPlugin />
  </LexicalComposer>
</template>
```
