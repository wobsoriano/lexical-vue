# Extensions

An extension is a self-contained piece of editor behaviour that carries its own nodes, its own registration and its own configuration. Lexical ships extensions for rich text, history, lists, links, tables and much else, and they are framework agnostic, so the same `RichTextExtension` works in Vue, React and Svelte.

Extensions are additive. `LexicalComposer` and the plugin components are not going anywhere, and everything you have already built keeps working exactly as it does today.

## Why a separate composer

An extension can only run on an editor that was created through the extension API. `LexicalComposer` calls `createEditor()` directly, so extensions do not work inside it. `LexicalExtensionComposer` builds the editor with `buildEditorFromExtensions()` instead, which is what makes them work.

Both composers provide the editor on the same injection key, so every existing lexical-vue component resolves inside either one.

## What changes for you

Compare a plain text editor built the established way:

```vue
<script setup lang="ts">
import { LexicalComposer } from 'lexical-vue/LexicalComposer'
import { ContentEditable } from 'lexical-vue/LexicalContentEditable'
import { HistoryPlugin } from 'lexical-vue/LexicalHistoryPlugin'
import { RichTextPlugin } from 'lexical-vue/LexicalRichTextPlugin'

const config = {
  namespace: 'MyEditor',
  nodes: [HeadingNode, QuoteNode],
  onError: console.error,
}
</script>

<template>
  <LexicalComposer :initial-config="config">
    <RichTextPlugin>
      <template #contentEditable>
        <ContentEditable />
      </template>
    </RichTextPlugin>
    <HistoryPlugin />
  </LexicalComposer>
</template>
```

against the same editor built from extensions:

```vue
<script setup lang="ts">
import { HistoryExtension } from '@lexical/history'
import { RichTextExtension } from '@lexical/rich-text'
import { defineExtension } from 'lexical'
import { ContentEditable } from 'lexical-vue/LexicalContentEditable'
import { LexicalExtensionComposer } from 'lexical-vue/LexicalExtensionComposer'

const extension = defineExtension({
  name: 'MyEditor',
  namespace: 'MyEditor',
  dependencies: [RichTextExtension, HistoryExtension],
})
</script>

<template>
  <LexicalExtensionComposer :extension="extension">
    <ContentEditable />
  </LexicalExtensionComposer>
</template>
```

There is no `nodes` array and no `RichTextPlugin`. `RichTextExtension` declares `nodes: () => [HeadingNode, QuoteNode]` and runs `registerRichText` itself, so one dependency covers what previously took configuration in one place and registration in another.

## Where to read more

The extension system itself is documented upstream and applies to every framework. Those pages are the reference for the concepts.

- [Extensions introduction](https://lexical.dev/docs/extensions/intro) for the core API and the use case.
- [Defining extensions](https://lexical.dev/docs/extensions/defining-extensions) for writing your own.
- [Included extensions](https://lexical.dev/docs/extensions/included-extensions) for the full list of what ships.
- [Peer dependencies](https://lexical.dev/docs/extensions/peer-dependencies) for optional integration between extensions.

The pages in this section cover only what is specific to Vue.
