<script setup lang="ts">
import {
  LexicalAutoFocusPlugin,
  LexicalCheckListPlugin,
  LexicalClickableLinkPlugin,
  LexicalHashtagPlugin,
  LexicalHistoryPlugin,
  LexicalLinkPlugin,
  LexicalListPlugin,
} from 'lexical-vue'
import { LexicalRichTextPlugin } from 'lexical-vue/LexicalRichTextPlugin'
import { ref } from 'vue'

import AutoEmbedPlugin from './plugins/AutoEmbedPlugin/index.vue'
import AutoLinkPlugin from './plugins/AutoLinkPlugin.vue'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin.vue'
import ContentEditable from './plugins/ContentEditable.vue'
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin.vue'
import EmojisPlugin from './plugins/EmojisPlugin.vue'
import FloatingLinkEditor from './plugins/FloatingLinkEditor.vue'
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin.vue'
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin.vue'
import MentionsPlugin from './plugins/MentionsPlugin.vue'
import ToolbarPlugin from './plugins/ToolbarPlugin/index.vue'
import TreeViewPlugin from './plugins/TreeViewPlugin.vue'
import TwitterPlugin from './plugins/TwitterPlugin/index.vue'
import YouTubePlugin from './plugins/YouTubePlugin/index.vue'

const floatingAnchorRef = ref<HTMLDivElement | null>(null)
</script>

<template>
  <ToolbarPlugin />
  <div class="editor-container">
    <div className="editor-inner">
      <LexicalRichTextPlugin>
        <template #contentEditable>
          <div class="editor-scroller">
            <div ref="floatingAnchorRef" class="editor">
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
      <!-- <TreeViewPlugin /> -->
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
      <FloatingLinkEditor v-if="floatingAnchorRef" :anchor-elem="floatingAnchorRef" :priority="1" />
    </div>
  </div>
</template>
