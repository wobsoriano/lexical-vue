# Extensions

An extension is a self-contained piece of editor behaviour that carries its own nodes, its own registration and its own configuration. Lexical ships extensions for rich text, history, lists, links and tables, and they are framework agnostic, so the same `RichTextExtension` works in Vue, React and Svelte.

Extensions are additive. `LexicalComposer` and the plugin components are not going anywhere, and everything you have already built keeps working.

## Why a separate composer

An extension can only run on an editor created through the extension API. `LexicalComposer` calls `createEditor()` directly, so extensions do not work inside it. `LexicalExtensionComposer` builds the editor with `buildEditorFromExtensions()` instead, which is what makes them work.

## The same editor, both ways

Built the established way:

```vue
<script setup lang="ts">
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
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

Built from extensions:

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

There is no `nodes` array and no `RichTextPlugin`. `RichTextExtension` declares `nodes: () => [HeadingNode, QuoteNode]` and runs `registerRichText` itself, so one dependency covers what previously took configuration in one place and registration in another.

## Installing the packages you import from

lexical-vue depends on the `@lexical/*` packages, but it does not re-export their extensions. When you import `RichTextExtension` from `@lexical/rich-text`, that import is yours, so add the package to your own `package.json`. Under pnpm it will not resolve otherwise.

```bash
npm install @lexical/rich-text @lexical/history
```

Match the version lexical-vue pins, which is `0.50.0`.

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
Do not add `RichTextPlugin` when your extension already depends on `RichTextExtension`, since the extension performs the same registration. If you do nest one, decorator nodes still render only once.
:::

## The editor is built once

The editor is built during setup, and a later change to the `extension` prop is ignored. Rebuilding would discard whatever the user has typed, so it is not something to do implicitly.

When you need a fresh editor, bind a `key` to whatever the extension is derived from:

```vue
<template>
  <LexicalExtensionComposer :key="documentId" :extension="extension">
    <ContentEditable />
  </LexicalExtensionComposer>
</template>
```

## Decorator nodes and disposal

Decorator nodes render automatically. The composer hosts them, so images, embeds, equations and any custom `DecoratorNode` appear without you rendering anything extra.

The composer also disposes the editor it built when the component unmounts, so you do not need to call `editor.dispose()` yourself.

## Where to read more

The extension system is documented upstream and applies to every framework.

- [Extensions introduction](https://lexical.dev/docs/extensions/intro) for the core API and the use case.
- [Defining extensions](https://lexical.dev/docs/extensions/defining-extensions) for writing your own.
- [Included extensions](https://lexical.dev/docs/extensions/included-extensions) for the full list of what ships.
- [Peer dependencies](https://lexical.dev/docs/extensions/peer-dependencies) for optional integration between extensions.

The other pages in this section cover what is specific to Vue: [contributing UI](./vue-ui) from an extension, and [reading extension state](./signals).
