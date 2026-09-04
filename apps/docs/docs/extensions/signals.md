# Reading extension state

Extensions expose their state as [signals](https://lexical.dev/docs/extensions/signals). A signal is a small reactive value that any framework can subscribe to, which is how one extension serves Vue, React and Svelte at once.

lexical-vue mirrors a signal into a Vue ref, so you read extension state the same way you read anything else.

## useExtensionSignalValue

The shortest path. Give it an extension and the name of a signal in its output, and get a ref back.

```vue
<script setup lang="ts">
import { useExtensionSignalValue } from 'lexical-vue/useExtensionSignalValue'
import { WordCountExtension } from './WordCountExtension'

const count = useExtensionSignalValue(WordCountExtension, 'count')
</script>

<template>
  <div>{{ count }} words</div>
</template>
```

The ref updates whenever the signal does, and the subscription is released when the component unmounts.

## useExtensionDependency

Some extensions expose their output as a single signal rather than a named collection. `EditorStateExtension` is one, and its whole output is a signal carrying the current `EditorState`.

```vue
<script setup lang="ts">
import { EditorStateExtension } from '@lexical/extension'
import { useExtensionDependency } from 'lexical-vue/useExtensionDependency'
import { useSignalValue } from 'lexical-vue/useExtensionSignalValue'

const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output)
</script>
```

`useExtensionDependency` resolves an extension against the current editor and gives you both its `config` and its `output`. It throws when the extension is not part of the editor, which catches a missing dependency at the point of use.

## useSignalValue

The primitive underneath both. It takes any signal and returns a readonly ref.

```ts
import { useSignalValue } from 'lexical-vue/useExtensionSignalValue'

const value = useSignalValue(someSignal)
```

The ref is shallow, so the value inside it is the value the signal holds and not a reactive proxy of it. That matters for identity comparisons:

```ts
editorState.value === editor.getEditorState() // true
```

::: warning
`useSignalValue` binds its subscription to the current Vue effect scope. Call it during `setup` or inside an `effectScope`, otherwise nothing will release the subscription.
:::
