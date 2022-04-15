<script setup lang="ts">
import {
  LexicalComposer,
  LexicalContentEditable,
  LexicalOnChangePlugin,
  LexicalPlainTextPlugin,
} from 'lexical-vue'

const config = {
  theme: {
    ltr: 'ltr',
    rtl: 'rtl',
    placeholder: 'editor-placeholder',
    paragraph: 'editor-paragraph',
  },
  onError() {

  },
  readOnly: false,
}
</script>

<template>
  <div class="App">
    <h1>Plain Text Example</h1>
    <p>Note: this is an experimental build of Lexical</p>
    <div className="editor-container">
      <LexicalComposer :initial-config="config">
        <LexicalPlainTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input" />
          </template>
          <template #placeholder>
            <div className="editor-placeholder">
              Enter some plain text...
            </div>
          </template>
        </LexicalPlainTextPlugin>
        <LexicalOnChangePlugin />
      </LexicalComposer>
    </div>
  </div>
</template>
