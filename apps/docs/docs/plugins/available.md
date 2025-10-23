# Available Plugins

Vue-based plugins are using Lexical editor instance from `<LexicalComposer>` component:

```vue
<script setup>
import { LexicalComposer } from 'lexical-vue/LexicalComposer'
import { ContentEditable } from 'lexical-vue/LexicalContentEditable'
import { HistoryPlugin } from 'lexical-vue/LexicalHistoryPlugin'
import { OnChangePlugin } from 'lexical-vue/LexicalOnChangePlugin'
import { PlainTextPlugin } from 'lexical-vue/LexicalPlainTextPlugin'

const initialConfig = {
  namespace: 'MyEditor',
  theme,
  onError,
}
</script>

<template>
  <LexicalComposer :initial-config="initialConfig">
    <PlainTextPlugin>
      <template #contentEditable>
        <ContentEditable>
          <template #placeholder>
            <div>Enter some text...</div>
          </template>
        </ContentEditable>
      </template>
    </PlainTextPlugin>
    <HistoryPlugin />
    <OnChangePlugin @change="onChange" />
  </LexicalComposer>
</template>
```

> [!NOTE]
> Note: Many plugins might require you to register the one or many Lexical nodes in order for the plugin to work. You can do this by passing a reference to the node to the `nodes` array in your initial editor configuration.

## `LexicalPlainTextPlugin`

Wrapper for `@lexical/plain-text` that adds major features for plain text editing, including typing, deletion and copy/pasting.

```html
<PlainTextPlugin>
  <template #contentEditable>
    <LexicalContentEditable>
      <template #placeholder>
        <div>Enter some text...</div>
      </template>
    </LexicalContentEditable>
  </template>
</PlainTextPlugin>
```

## `RichTextPlugin`

Wrapper for `@lexical/rich-text` that adds major features for rich text editing, including typing, deletion, copy/pasting, indent/outdent and bold/italic/underline/strikethrough text formatting.

```html
<RichTextPlugin>
  <template #contentEditable>
    <LexicalContentEditable>
      <template #placeholder>
        <div>Enter some text...</div>
      </template>
    </LexicalContentEditable>
  </template>
</RichTextPlugin>
```

## `LexicalOnChangePlugin`

Plugin that emits `change` whenever Lexical state is updated. Using `ignoreInitialChange` (`true` by default) and `ignoreSelectionChange` (`false` by default) can give more granular control over changes that are causing the `change` event.

```html
<OnChangePlugin @change="onChange" />
```

## `LexicalHistoryPlugin`

Wrapper for `@lexical/history` that adds support for history stack management and `undo` / `redo` commands.

```html
<HistoryPlugin />
```

## `LexicalLinkPlugin`

Wrapper for `@lexical/link` that adds support for links, including `toggleLink` command support that toggles link for selected text.

```html
<LinkPlugin />
```

## `LexicalListPlugin`

Wrapper for `@lexical/list` that adds support for lists (ordered and unordered).

```html
<ListPlugin />
```

## `LexicalCheckListPlugin`

Wrapper for `@lexical/list` that adds support for check lists. Note that it requires some css to render check/uncheck marks. See PlaygroundEditorTheme.css for details.

```html
<CheckListPlugin />
```

## `LexicalTablePlugin`

Wrapper for `@lexical/table` that adds support for tables.

```html
<TablePlugin />
```

## `LexicalTabIndentationPlugin`

Plugin that allows tab indentation in combination with `@lexical/rich-text`.

```html
<TabIndentationPlugin />
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
  <AutoLinkPlugin :matchers="MATCHERS" />
</template>
```

## `LexicalClearEditorPlugin`

Adds `clearEditor` command support to clear editor's content.

```html
<ClearEditorPlugin />
```

## `LexicalMarkdownShortcutPlugin`

Adds markdown shortcut support: headings, lists, code blocks, quotes, links and inline styles (bold, italic, strikethrough).

```html
<MarkdownShortcutPlugin />
```
