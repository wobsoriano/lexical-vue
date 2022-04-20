# lexical-vue

> Note: Lexical is currently in early development and APIs and packages are likely to change quite often.

[Lexical](https://github.com/facebook/lexical) components and composables for Vue applications.

For documentation and more information about Lexical, be sure to visit the [Lexical website](https://lexical.dev/).

Demo: https://lexical-vue-playground.vercel.app

## Getting started with Vue

> Requires Vue 3.

Install `lexical` and `lexical-vue`:

```bash
npm install lexical lexical-vue # or pnpm or yarn
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
  theme: {
    // Theme styling goes here
  },
}

const onError = (error) => {
  throw error
},

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
  <LexicalComposer :initial-config="config" @error="onError">
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

For a more complex example, check the [rich text editor playground](https://github.com/wobsoriano/lexical-vue/tree/master/packages/playground).

I'm converting most of [@lexical/react](https://github.com/facebook/lexical/tree/main/packages/lexical-react) plugins into Vue 3 components. Check them all [here](https://github.com/wobsoriano/lexical-vue/tree/master/packages/lexical-vue/src/components).

## Credits

- [Lexical](https://github.com/facebook/lexical)
- [Vite](https://vitejs.dev/)

## License

MIT
