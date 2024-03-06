<script setup lang="ts">
import {
  LexicalAutoFocusPlugin,
  LexicalClickableLinkPlugin,
  LexicalHashtagPlugin,
  LexicalHistoryPlugin,
  LexicalLinkPlugin,
  LexicalListPlugin,
  LexicalRichTextPlugin,
  LexicalCheckListPlugin,
} from 'lexical-vue'

import EmojisPlugin from './plugins/EmojisPlugin.vue'
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin.vue'
import TreeViewPlugin from './plugins/TreeViewPlugin.vue'
import ToolbarPlugin from './plugins/ToolbarPlugin/index.vue'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin.vue'
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin.vue'
import AutoLinkPlugin from './plugins/AutoLinkPlugin.vue'
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin.vue'
import ContentEditable from './plugins/ContentEditable.vue'
import MentionsPlugin from './plugins/MentionsPlugin.vue'
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin/index.vue'
import YouTubePlugin from './plugins/YouTubePlugin/index.vue'
import TwitterPlugin from './plugins/TwitterPlugin/index.vue'
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
      <AutoEmbedPlugin />
      <TreeViewPlugin />
      <LexicalAutoFocusPlugin />
      <CodeHighlightPlugin />
      <LexicalListPlugin />
      <LexicalCheckListPlugin />
      <LexicalLinkPlugin />
      <AutoLinkPlugin />
      <ListMaxIndentLevelPlugin :max-depth="7" />
      <LexicalHashtagPlugin />
      <MarkdownShortcutPlugin />
      <EmojiPickerPlugin />
      <EmojisPlugin />
      <MentionsPlugin />
      <LexicalClickableLinkPlugin />
      <YouTubePlugin />
      <TwitterPlugin />
    </div>
  </div>
</template>
