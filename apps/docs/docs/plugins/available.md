# Available Plugins

Every plugin below reads the Lexical editor instance provided by `<LexicalComposer>`, so each one has to be rendered inside a composer. See [Usage](../getting-started/usage) for a complete editor.

> [!NOTE]
> Note: Many plugins might require you to register the one or many Lexical nodes in order for the plugin to work. You can do this by passing a reference to the node to the `nodes` array in your initial editor configuration.

## `LexicalPlainTextPlugin`

Wrapper for `@lexical/plain-text` that adds major features for plain text editing, including typing, deletion and copy/pasting.

```html
<PlainTextPlugin>
  <template #contentEditable>
    <ContentEditable>
      <template #placeholder>
        <div>Enter some text...</div>
      </template>
    </ContentEditable>
  </template>
</PlainTextPlugin>
```

## `RichTextPlugin`

Wrapper for `@lexical/rich-text` that adds major features for rich text editing, including typing, deletion, copy/pasting, indent/outdent and bold/italic/underline/strikethrough text formatting.

```html
<RichTextPlugin>
  <template #contentEditable>
    <ContentEditable>
      <template #placeholder>
        <div>Enter some text...</div>
      </template>
    </ContentEditable>
  </template>
</RichTextPlugin>
```

## `LexicalOnChangePlugin`

Plugin that emits `change` whenever Lexical state is updated. The handler receives the new `editorState`, the `editor` instance, and the `tags` set for the update.

Two props narrow down which updates emit the event. `ignoreSelectionChange` (`false` by default) skips updates that only move the selection, and `ignoreHistoryMergeTagChange` (`true` by default) skips updates tagged as a history merge.

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

Plugin will convert text into links based on passed matchers list. In example below whenever user types url-like string it will automatically convert it into a link node.

```html
<script setup>
  const URL_MATCHER =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

  const MATCHERS = [
    (text) => {
      const match = URL_MATCHER.exec(text)
      if (match === null) {
        return null
      }
      const fullMatch = match[0]
      return {
        index: match.index,
        length: fullMatch.length,
        text: fullMatch,
        url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
        // attributes: { rel: 'noreferrer', target: '_blank' }, // Optional link attributes
      }
    },
  ]
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

## `LexicalTableOfContentsPlugin`

This plugin allows you to render a table of contents for a page from the headings from the editor. It listens to any deletions or modifications to those headings and updates the table of contents. Additionally, it's able to track any newly added headings and inserts them in the table of contents once they are created. This plugin also supports lazy loading - so you can defer adding the plugin until when the user needs it.

In order to use `TableOfContentsPlugin`, you need to provide a default slot. This slot gives you access to the up-to-date data of the table of contents through slot props. You can access this data through the `tableOfContents` slot prop, which comes in the form of an array of arrays `[[headingKey, headingTextContent, headingTag], [], [], ...]` and the `editor` prop for the Lexical editor instance.

`headingKey`: Unique key that identifies the heading. headingTextContent: A string of the exact text of the heading. headingTag: A string that reads either 'h1', 'h2', or 'h3'.

```vue
<template>
  <TableOfContentsPlugin v-slot="{ tableOfContents }">
    <MyCustomTableOfContentsPlugin :tableOfContents="tableOfContents" />
  </TableOfContentsPlugin>
</template>
```

## `LexicalSelectionAlwaysOnDisplay`

By default, browser text selection becomes invisible when clicking away from the editor. This plugin ensures the selection remains visible.

```html
<SelectionAlwaysOnDisplay />
```
