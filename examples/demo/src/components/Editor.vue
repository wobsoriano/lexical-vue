<script setup lang="ts">
import {
  LexicalAutoFocusPlugin,
  LexicalCodeHighlightPlugin,
  LexicalComposer,
  LexicalContentEditable,
  LexicalHistoryPlugin,
  LexicalListPlugin,
  LexicalOnChangePlugin,
  LexicalRichTextPlugin,
  LexicalTreeViewPlugin,
} from 'lexical-vue'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
// @ts-expect-error: TODO: Types
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ref, watch } from 'vue'
import exampleTheme from '../themes/example'
import Test from './components/Test.vue'
import ToolbarPlugin from './ToolbarPlugin.vue'

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

const model = ref('')

watch(model, (val) => {
  console.log('Editor value:', val)
})
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
        <LexicalOnChangePlugin v-model="model" />
        <LexicalHistoryPlugin />
        <LexicalTreeViewPlugin
          view-class-name="tree-view-output"
          time-travel-panel-class-name="debug-timetravel-panel"
          time-travel-button-class-name="debug-timetravel-button"
          time-travel-panel-slider-class-name="debug-timetravel-panel-slider"
          time-travel-panel-button-class-name="debug-timetravel-panel-button"
        />
        <LexicalAutoFocusPlugin />
        <LexicalCodeHighlightPlugin />
        <LexicalListPlugin />
      </div>
    </div>
    <!-- <Test /> -->
  </LexicalComposer>
</template>
