<script setup lang="ts">
import {
  LexicalAutoFocusPlugin,
  LexicalHashtagPlugin,
  LexicalHistoryPlugin,
  LexicalLinkPlugin,
  LexicalListPlugin,
  LexicalRichTextPlugin,
} from 'lexical-vue'

import ToolbarPlugin from './ToolbarPlugin.vue'
import CodeHighlightPlugin from './CodeHighlightPlugin.vue'
import ListMaxIndentLevelPlugin from './ListMaxIndentLevelPlugin.vue'
import AutoLinkPlugin from './AutoLinkPlugin.vue'
import TreeViewPlugin from './TreeViewPlugin.vue'
import MarkdownShortcutPlugin from './MarkdownShortcutPlugin.vue'
import EmojisPlugin from './EmojisPlugin.vue'
import ContentEditable from './ContentEditable.vue'
</script>

<template>
  <ToolbarPlugin />
  <div class="editor-container">
    <div className="editor-inner">
      <LexicalRichTextPlugin>
        <template #contentEditable>
          <div class="editor-scroller">
            <div class="editor">
              <ContentEditable />
            </div>
          </div>
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
      <EmojisPlugin />
    </div>
  </div>
</template>
