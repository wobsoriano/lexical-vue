# Contributing Vue UI

Most extensions only register behaviour and render nothing. Some need to put something on screen, such as a floating toolbar or a find and replace panel. `VueExtension` is the channel for that.

An extension that contributes UI depends on `VueExtension` with a config override, and the composer renders whatever it contributes.

```ts
import { configExtension, defineExtension } from 'lexical'
import { VueExtension } from 'lexical-vue/VueExtension'
import MentionsPanel from './MentionsPanel.vue'
import { MentionNode } from './MentionNode'

export const MentionsExtension = defineExtension({
  name: '@app/Mentions',
  nodes: [MentionNode],
  dependencies: [configExtension(VueExtension, { decorators: [MentionsPanel] })],
})
```

The app adds the extension and nothing else. It does not need to know the panel exists, or to render it.

```vue
<template>
  <LexicalExtensionComposer :extension="extension">
    <ContentEditable />
  </LexicalExtensionComposer>
</template>
```

Contributed UI renders inside the editor's context, so it reaches the editor with `useLexicalComposer()` exactly like any component you write yourself.

## Decorators concatenate

Every extension in the graph contributes. Configs merge by concatenation rather than replacement, so two extensions that each add a decorator both get rendered and neither overwrites the other.

```ts
const extension = defineExtension({
  name: '@app/Editor',
  dependencies: [RichTextExtension, MentionsExtension, FindReplaceExtension],
})
```

## What a decorator can be

A decorator is either a component or a vnode.

```ts
configExtension(VueExtension, {
  decorators: [MentionsPanel, () => h(Toolbar, { compact: true })],
})
```

Use a component when it takes no props. Use an arrow returning a vnode when you need to pass props, since a Vue functional component is just a function returning a vnode.

::: tip
Props are not passed to a contributed decorator. Reach the editor through `useLexicalComposer()` and read extension state through the [signal composables](./signals).
:::

## Supplying the editable region

An extension can also own the editable region itself, through the `contentEditable` config. This is mainly useful for an extension that ships a complete editor, such as a nested caption editor.

```ts
configExtension(VueExtension, {
  contentEditable: () => h(ContentEditable, { class: 'caption' }),
})
```

It defaults to `null`, which is why the composer renders nothing extra when you put `<ContentEditable />` in the default slot yourself. That default differs from `@lexical/react` deliberately. If both the config value and your own `ContentEditable` rendered, the editor would end up with two root elements competing for the same editor.

To override an extension's `contentEditable`, use the composer's `contentEditable` slot:

```vue
<template>
  <LexicalExtensionComposer :extension="extension">
    <template #contentEditable>
      <ContentEditable class="my-own-editable" />
    </template>
    <MyToolbar />
  </LexicalExtensionComposer>
</template>
```

The slot wins over the config value, so an extension supplies a default and the app keeps the last word.

## Requiring a Vue host

`VueExtension` declares a peer dependency on `VueProviderExtension`, which `LexicalExtensionComposer` always includes. Building an editor that wants Vue UI without a Vue host to render it fails immediately with a message naming the extension that asked for it, rather than silently rendering nothing.
