<script setup lang="ts">
import {
  LexicalAutoFocusPlugin,
  LexicalComposer,
  LexicalContentEditable,
  LexicalHashtagPlugin,
  LexicalHistoryPlugin,
  LexicalLinkPlugin,
  LexicalListPlugin,
  LexicalRichTextPlugin,
} from 'lexical-vue'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { HashtagNode } from '@lexical/hashtag'

import exampleTheme from '../themes/example'
import ToolbarPlugin from './ToolbarPlugin.vue'
import CodeHighlightPlugin from './CodeHighlightPlugin.vue'
import ListMaxIndentLevelPlugin from './ListMaxIndentLevelPlugin.vue'
import AutoLinkPlugin from './AutoLinkPlugin.vue'
import TreeViewPlugin from './TreeViewPlugin.vue'
import MarkdownShortcutPlugin from './MarkdownShortcutPlugin.vue'

const config = {
  theme: exampleTheme,
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    HashtagNode,
  ],
}

const onError = (error: Error) => {
  throw error
}
</script>

<template>
  <LexicalComposer :initial-config="config" @error="onError">
    <div class="editor-container">
      <ToolbarPlugin />
      <div className="editor-inner">
        <LexicalRichTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input" />
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Enter some text...
            </div>
          </template>
        </LexicalRichTextPlugin>
        <LexicalHistoryPlugin />
        <TreeViewPlugin />
        <LexicalAutoFocusPlugin />
        <CodeHighlightPlugin />
        <LexicalListPlugin />
        <LexicalLinkPlugin />
        <AutoLinkPlugin />
        <ListMaxIndentLevelPlugin :max-depth="7" />
        <LexicalHashtagPlugin />
        <MarkdownShortcutPlugin />
      </div>
    </div>
  </LexicalComposer>
</template>
