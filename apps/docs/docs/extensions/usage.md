# Using extensions

`LexicalExtensionComposer` takes a single `extension` prop and builds the editor from it.

```vue
<script setup lang="ts">
import { HistoryExtension } from '@lexical/history'
import { ListExtension } from '@lexical/list'
import { RichTextExtension } from '@lexical/rich-text'
import { defineExtension } from 'lexical'
import { ContentEditable } from 'lexical-vue/LexicalContentEditable'
import { LexicalExtensionComposer } from 'lexical-vue/LexicalExtensionComposer'

const extension = defineExtension({
  name: 'MyEditor',
  namespace: 'MyEditor',
  dependencies: [RichTextExtension, HistoryExtension, ListExtension],
  theme: {
    // Theme styling goes here
  },
})
</script>

<template>
  <LexicalExtensionComposer :extension="extension">
    <ContentEditable />
  </LexicalExtensionComposer>
</template>
```

## Existing components still work

Anything that reaches the editor through `useLexicalComposer()` works inside the extension composer with no changes, because both composers provide the editor the same way.

That means you can adopt extensions gradually. Take the behaviour you want from extensions and keep using plugin components for the rest.

```vue
<template>
  <LexicalExtensionComposer :extension="extension">
    <ContentEditable />
    <OnChangePlugin @change="onChange" />
    <MyOwnPlugin />
  </LexicalExtensionComposer>
</template>
```

::: tip
Do not add `RichTextPlugin` when your extension already depends on `RichTextExtension`. The extension performs the same registration, so you would be doing it twice.
:::

## The editor is built once

The editor is built during setup, and a later change to the `extension` prop is ignored. Rebuilding would discard whatever the user has typed, so it is not something to do implicitly.

When you genuinely need a fresh editor, bind a `key` to whatever the extension is derived from:

```vue
<template>
  <LexicalExtensionComposer :key="documentId" :extension="extension">
    <ContentEditable />
  </LexicalExtensionComposer>
</template>
```

## Decorator nodes

Decorator nodes render automatically. The composer hosts them, so images, embeds, equations and any custom `DecoratorNode` appear without you rendering anything extra.

If you nest `RichTextPlugin` or `PlainTextPlugin` inside the composer, they will not render decorators a second time. Exactly one host renders them, whichever arrangement you use.

## Disposal

The composer disposes the editor it built when the component unmounts. You do not need to call `editor.dispose()` yourself.
