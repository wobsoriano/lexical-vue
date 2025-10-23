# Lexical Vue

An extensible Vue 3 web text-editor based on [Lexical](https://github.com/facebook/lexical).

For documentation and more information about Lexical, be sure to visit the [Lexical website](https://lexical.dev/).

Here are some examples of what you can do with Lexical:

- [Lexical Vue Playground](https://lexical-vue-playground.vercel.app)
- [Rich Text Example](https://stackblitz.com/edit/vitejs-vite-qqdqcl)
- [Plain Text Example](https://stackblitz.com/edit/vitejs-vite-jxwkxo)

## Getting started with Vue

> Requires Vue >= 3.5.0.

Install `lexical-vue`:

```bash
npm install lexical-vue # or pnpm or yarn
```

Below is an example of a basic plain text editor using `lexical` and `lexical-vue`.

```vue
<script setup lang="ts">
import { $getRoot, $getSelection } from 'lexical'

import { LexicalComposer } from 'lexical-vue/LexicalComposer'
import { AutoFocusPlugin } from 'lexical-vue/LexicalAutoFocusPlugin'
import { ContentEditable } from 'lexical-vue/LexicalContentEditable'
import { HistoryPlugin } from 'lexical-vue/LexicalHistoryPlugin'
import { OnChangePlugin } from 'lexical-vue/LexicalOnChangePlugin'
import { PlainTextPlugin } from 'lexical-vue/LexicalPlainTextPlugin'

const config = {
  editable: true,
  theme: {
    // Theme styling goes here
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
</script>

<template>
  <LexicalComposer :initial-config="config">
    <PlainTextPlugin>
      <template #contentEditable>
        <ContentEditable>
          <template #placeholder>
            <div>Enter some text...</div>
          </template>
        </ContentEditable >
      </template>
    </PlainTextPlugin>
    <OnChangePlugin @change="onChange" />
    <HistoryPlugin />
    <AutoFocusPlugin />
  </LexicalComposer>
</template>
```

For a more complex example, check the [rich text editor playground](https://github.com/wobsoriano/lexical-vue/tree/master/playground).

### Creating custom Lexical nodes with Vue

- [Creating custom decorator nodes](https://lexical-vue.vercel.app/docs/plugins/custom.html)

## Documentation

https://lexical-vue.vercel.app

## Credits

- [Lexical](https://github.com/facebook/lexical)
- [Vite](https://vitejs.dev/)
- [Vercel](https://vercel.com/)

## License

MIT
