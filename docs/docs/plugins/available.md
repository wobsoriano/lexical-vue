# Available Plugins

Vue-based plugins are using Lexical editor instance from `<LexicalComposer>` component:

```vue
<script setup>
import {
  LexicalComposer,
  LexicalContentEditable,
  LexicalHistoryPlugin,
  LexicalOnChangePlugin,
  LexicalPlainTextPlugin
} from 'lexical-vue'

const initialConfig = {
  namespace: 'MyEditor',
  theme,
  onError,
}
</script>

<template>
  <LexicalComposer :initial-config="initialConfig">
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
</template>
```

> [!NOTE]
> Note: Many plugins might require you to register the one or many Lexical nodes in order for the plugin to work. You can do this by passing a reference to the node to the `nodes` array in your initial editor configuration.

## `LexicalPlainTextPlugin`

Wrapper for `@lexical/plain-text` that adds major features for plain text editing, including typing, deletion and copy/pasting.

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

Wrapper for `@lexical/rich-text` that adds major features for rich text editing, including typing, deletion, copy/pasting, indent/outdent and bold/italic/underline/strikethrough text formatting.

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

Plugin that emits `change` whenever Lexical state is updated. Using `ignoreInitialChange` (`true` by default) and `ignoreSelectionChange` (`false` by default) can give more granular control over changes that are causing the `change` event.

```html
<LexicalOnChangePlugin @change="onChange" />
```

## `LexicalHistoryPlugin`

Wrapper for `@lexical/history` that adds support for history stack management and `undo` / `redo` commands.

```html
<LexicalHistoryPlugin />
```

## `LexicalLinkPlugin`

Wrapper for `@lexical/link` that adds support for links, including `toggleLink` command support that toggles link for selected text.

```html
<LexicalLinkPlugin />
```

## `LexicalListPlugin`

Wrapper for `@lexical/list` that adds support for lists (ordered and unordered).

```html
<LexicalLinkPlugin />
```

## `LexicalCheckListPlugin`

Wrapper for `@lexical/list` that adds support for check lists. Note that it requires some css to render check/uncheck marks. See PlaygroundEditorTheme.css for details.

```html
<LexicalCheckListPlugin />
```

## `LexicalTablePlugin`

Wrapper for `@lexical/table` that adds support for tables.

```html
<LexicalTablePlugin />
```

## `LexicalTabIndentationPlugin`

Plugin that allows tab indentation in combination with `@lexical/rich-text`.

```html
<LexicalTabIndentationPlugin />
```

## `LexicalAutoLinkPlugin`

Plugin will convert text into links based on passed matchers list. In example below whenever user types url-like string it will automaticaly convert it into a link node.

```html
<script setup>
const URL_MATCHER
  = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

const MATCHERS = [
  (text) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
      // attributes: { rel: 'noreferrer', target: '_blank' }, // Optional link attributes
    };
  },
];
</script>

<template>
  <LexicalAutoLinkPlugin :matchers="MATCHERS" />
</template>
```

## `LexicalClearEditorPlugin`

Adds `clearEditor` command support to clear editor's content.

## `LexicalMarkdownShortcutPlugin`

Adds markdown shortcut support: headings, lists, code blocks, quotes, links and inline styles (bold, italic, strikethrough).

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

More plugins soon...
