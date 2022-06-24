# Available Plugins

Vue-based plugins are using Lexical editor instance from `<LexicalComposer>` component:

```html
<LexicalComposer :initial-config="config">
  <LexicalPlainTextPlugin>
    <template #contentEditable>
      <LexicalContentEditable />
    </template>
    <template #placeholder>
      <div>Enter some text...</div>
    </template>
  </LexicalPlainTextPlugin>
  <LexicalHistoryPlugin />
  <LexicalOnChangePlugin @change="onChange" />
</LexicalComposer>
```

## `LexicalPlainTextPlugin`

Vue wrapper for `@lexical/plain-text` that adds major features for plain text editing, including typing, deletion and copy/pasting.

```html
<LexicalPlainTextPlugin>
  <template #contentEditable>
    <LexicalContentEditable />
  </template>
  <template #placeholder>
    <div>Enter some text...</div>
  </template>
</LexicalPlainTextPlugin>
```

## `LexicalRichTextPlugin`

Vue wrapper for `@lexical/rich-text` that adds major features for rich text editing, including typing, deletion, copy/pasting, indent/outdent and bold/italic/underline/strikethrough text formatting.

```html
<LexicalRichTextPlugin>
  <template #contentEditable>
    <LexicalContentEditable />
  </template>
  <template #placeholder>
    <div>Enter some text...</div>
  </template>
</LexicalRichTextPlugin>
```

## `LexicalOnChangePlugin`

Plugin that emits `change` whenever Lexical state is updated. Using `ignoreInitialChange` (`true` by default) and `ignoreSelectionChange` (`false` by default) can give more granular control over changes that are causing the `change` event. It also supports two-way binding of the updated content.

```html
<LexicalOnChangePlugin v-model="content" @change="onChange" />
```

## `LexicalHistoryPlugin`

Vue wrapper for `@lexical/history` that adds support for history stack management and `undo` / `redo` commands.

```html
<LexicalHistoryPlugin />
```

## `LexicalLinkPlugin`

Vue wrapper for `@lexical/link` that adds support for links, including `toggleLink` command support that toggles link for selected text.

```html
<LexicalLinkPlugin />
```

## `LexicalListPlugin`

Vue wrapper for `@lexical/list` that adds support for lists (ordered and unordered).

```html
<LexicalLinkPlugin />
```

## `LexicalTablePlugin`

Vue wrapper for `@lexical/table` that adds support for tables.

```html
<LexicalTablePlugin />
```

## `LexicalAutoLinkPlugin`

Plugin will convert text into links based on passed matchers list. In example below whenever user types url-like string it will automaticaly convert it into a link node.

```html
<script setup>
const URL_MATCHER
  = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

const MATCHERS = [
  (text) => {
    const match = URL_MATCHER.exec(text)
    return (
      match && {
        index: match.index,
        length: match[0].length,
        text: match[0],
        url: match[0],
      }
    )
  },
]
</script>

<template>
  <LexicalAutoLinkPlugin :matchers="MATCHERS" />
</template>
```

## `LexicalAutoScrollPlugin`

Lexical auto-scrolls its contenteditable container while typing. This plugin can be used for cases when other element up in a DOM tree needs to be scrolled (e.g. when editor is rendered within dialog with limited height):

```html
<div ref="containerWithScrollRef">
  <LexicalComposer>
    ...
    <LexicalAutoScrollPlugin :scrollRef="containerWithScrollRef" />
  </LexicalComposer>
</div>
```

## `LexicalClearEditorPlugin`

Adds `clearEditor` command support to clear editor's content.

More plugins soon...
