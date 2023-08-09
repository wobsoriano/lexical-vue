<script setup lang="ts">
import type { CreateEditorArgs, LexicalEditor } from 'lexical'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import {
  LexicalAutoFocusPlugin,
  LexicalCollaborationPlugin,
  LexicalComposer,
  LexicalContentEditable,
  LexicalHashtagPlugin,
  LexicalHistoryPlugin,
  LexicalLinkPlugin,
  LexicalListPlugin,
  LexicalRichTextPlugin,
} from 'lexical-vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
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
import EmojisPlugin from './EmojisPlugin.vue'
import { EmojiNode } from './EmojiNode'

function initialEditorState(editor: LexicalEditor): void {
  const root = $getRoot()
  const paragraph = $createParagraphNode()
  const text = $createTextNode('Welcome to collab!')
  paragraph.append(text)
  root.append(paragraph)
}

const config: CreateEditorArgs = {
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
    EmojiNode,
  ],
  namespace: 'Demo',
  editable: true,
  editorState: initialEditorState as any,
}

function onError(error: Error) {
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
        <EmojisPlugin />
        <LexicalCollaborationPlugin
          id="document-id"
          :provider-factory="(id: string, yjsDocMap: any) => {
            const doc = new Y.Doc({ autoLoad: true });
            yjsDocMap.set(id, doc);
            console.log(id, doc.getText())
            const provider = new WebsocketProvider(
              'ws://localhost:1234',
              id,
              doc,
            );

            return provider;
          }"
          :initial-editor-state="initialEditorState"
          :should-bootstrap="false"
        />
      </div>
    </div>
  </LexicalComposer>
</template>
