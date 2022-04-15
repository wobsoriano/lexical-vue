<script setup lang="ts">
import {
  LexicalComposer,
  LexicalContentEditable,
  LexicalHistoryPlugin,
  LexicalOnChangePlugin,
  LexicalPlainTextPlugin,
} from 'lexical-vue'
import Test from './components/Test.vue'

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
    <LexicalComposer :initial-config="config">
      <div className="editor-container">
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
        <LexicalHistoryPlugin />
      </div>
      <Test />
    </LexicalComposer>
  </div>
</template>
