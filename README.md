# Lexical Vue

An extensible Vue 3 web text-editor based on [Lexical](https://github.com/facebook/lexical).

For documentation and more information about Lexical, be sure to visit the [Lexical website](https://lexical.dev/).

Here are some examples of what you can do with Lexical:

- [Lexical Vue Playground](https://lexical-vue-playground.vercel.app)
- [Rich Text Example](https://stackblitz.com/edit/vitejs-vite-qqdqcl)
- [Plain Text Example](https://stackblitz.com/edit/vitejs-vite-jxwkxo)

## Getting started with Vue

> Requires Vue >= 3.2.0.

Install `lexical` and `lexical-vue`:

```bash
npm install lexical lexical-vue # or pnpm or yarn
```

Below is an example of a basic plain text editor using `lexical` and `lexical-vue`.

```vue
<script setup lang="ts">
import { $getRoot, $getSelection } from 'lexical'

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
}

function onError(error) {
  throw error
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
    <LexicalOnChangePlugin @change="onChange" />
    <LexicalHistoryPlugin />
    <LexicalAutoFocusPlugin />
  </LexicalComposer>
</template>
```

For a more complex example, check the [rich text editor playground](https://github.com/wobsoriano/lexical-vue/tree/master/playground).

### Creating custom Lexical nodes with Vue

- [Creating custom decorator nodes](https://lexical-vue.vercel.app/docs/plugins/custom.html)

## Contributing

1. Create a new branch
   - `git checkout -b my-new-branch`
2. Commit your changes
   - `git commit -a -m 'Description of the changes'`
     - There are many ways of doing this and this is just a suggestion
3. Push your branch to GitHub
   - `git push origin my-new-branch`
4. Go to the repository page in GitHub and click on "Compare & pull request"
   - The [GitHub CLI](https://cli.github.com/manual/gh_pr_create) allows you to skip the web interface for this step (and much more)

## Documentation

https://lexical-vue.vercel.app

## Credits

- [Lexical](https://github.com/facebook/lexical)
- [Vite](https://vitejs.dev/)
- [Vercel](https://vercel.com/)

## License

MIT
