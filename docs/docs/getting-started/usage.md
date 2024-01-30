# Usage

Install `lexical` and `lexical-vue`:

```bash
npm install lexical lexical-vue
```

Below is an example of a basic plain text editor using `lexical` and `lexical-vue`.

```vue
<script setup lang="ts">
import { $getRoot, $getSelection } from 'lexical'
import { LexicalComposer, LexicalContentEditable, LexicalHistoryPlugin, LexicalPlainTextPlugin } from 'lexical-vue'

const config = {
  namespace: 'MyEditor',
  theme: {
    // Theme styling goes here
  },
  onError(error) {
    // Catch any errors that occur during Lexical updates and log them
    // or throw them as needed. If you don't throw them, Lexical will
    // try to recover gracefully without losing user data.
    console.error(error)
  },
}
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
    <LexicalHistoryPlugin />
  </LexicalComposer>
</template>
```

Now that we have a simple editor, the next thing we might want to do is access the content of the editor to, for instance, save it in a database. We can do this via an [update listener](https://lexical.dev/docs/concepts/listeners#registerupdatelistener), which will execute every time the editor state changes and provide us with the latest state. We typically use the plugin system to set up listeners like this, since it provides us easy access to the LexicalEditor instance via [Provide/Inject](https://vuejs.org/guide/components/provide-inject). So, let's write our own plugin that notifies us when the editor updates.

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from 'lexical-vue'

const emit = defineEmits(['change'])
const editor = useLexicalComposer()

onMounted(() => {
  const unregister = editor.registerUpdateListener(({ editorState }) => {
    emit('change', editorState)
  })

  onUnmounted(() => {
    unregister()
  })
})
</script>

<template />
```

Now, we can implement this in our editor and save the EditorState in a Vue ref:

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { LexicalComposer, LexicalContentEditable, LexicalHistoryPlugin, LexicalPlainTextPlugin } from 'lexical-vue'
import OnChangePlugin from './OnChangePlugin.vue'

const editorState = ref()
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
    <LexicalHistoryPlugin />
    <OnChangePlugin @change="editorState = $event" />
  </LexicalComposer>
</template>
```

Ok, so now we're saving the EditorState object in a Vue ref, but we can't save a JavaScript object to our database - so how do we persist the state so we can load it later? We need to serialize it to a storage format. For this purpose (among others) Lexical provides several serialization APIs that convert EditorState to a string that can be sent over the network and saved to a database. Building on our previous example, we can do that this way:

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { LexicalComposer, LexicalContentEditable, LexicalHistoryPlugin, LexicalPlainTextPlugin } from 'lexical-vue'
import OnChangePlugin from './OnChangePlugin.vue'

const editorState = ref()

function onChange(editorState) {
  // Call toJSON on the EditorState object, which produces a serialization safe string
  editorState.value = editorState.toJSON()

  // However, we still have a JavaScript object, so we need to convert it to an actual string with JSON.stringify
  editorState.value = JSON.stringify(editorStateJSON)
}
</script>

<template>
  <LexicalComposer :initial-config="config">
    <!-- ... -->
    <OnChangePlugin @change="onChange" />
  </LexicalComposer>
</template>
```

From there, it's straightforward to wire up a submit button or some other UI trigger that will take the state from the Vue ref and send it to a server for storage in a database.

One important thing to note: Lexical is generally meant to be uncontrolled, so avoid trying to pass the EditorState back into Editor.setEditorState or something along those lines.
