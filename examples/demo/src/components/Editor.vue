<script setup lang="ts">
import {
  LexicalAutoFocusPlugin,
  LexicalComposer,
  LexicalContentEditable,
  LexicalHistoryPlugin,
  LexicalLinkPlugin,
  LexicalListPlugin,
  LexicalOnChangePlugin,
  LexicalRichTextPlugin,
} from 'lexical-vue'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
// @ts-expect-error: TODO: Missing types
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'

import exampleTheme from '../themes/example'
import ToolbarPlugin from './ToolbarPlugin.vue'
import CodeHighlightPlugin from './CodeHighlightPlugin.vue'
import ListMaxIndentLevelPlugin from './ListMaxIndentLevelPlugin.vue'
import AutoLinkPlugin from './AutoLinkPlugin.vue'
import TreeViewPlugin from './TreeViewPlugin.vue'

const config = {
  theme: exampleTheme,
  onError() {},
  // Any custom nodes go here
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
  ],
}
</script>

<template>
  <LexicalComposer :initial-config="config">
    <div class="editor-container">
      <ToolbarPlugin />
      <div className="editor-inner">
        <LexicalRichTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input" />
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Enter some plain text...
            </div>
          </template>
        </LexicalRichTextPlugin>
        <LexicalOnChangePlugin />
        <LexicalHistoryPlugin />
        <TreeViewPlugin />
        <LexicalAutoFocusPlugin />
        <CodeHighlightPlugin />
        <LexicalListPlugin />
        <LexicalLinkPlugin />
        <AutoLinkPlugin />
        <ListMaxIndentLevelPlugin :max-depth="7" />
      </div>
    </div>
  </LexicalComposer>
</template>
