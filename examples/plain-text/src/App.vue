<script setup lang="ts">
import {
  LexicalComposer,
  LexicalContentEditable,
  LexicalHistoryPlugin,
  LexicalOnChangePlugin,
  LexicalPlainTextPlugin,
  LexicalTreeViewPlugin,
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
      <div class="editor-container">
        <LexicalPlainTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input" />
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Enter some plain text...
            </div>
          </template>
        </LexicalPlainTextPlugin>
        <LexicalOnChangePlugin />
        <LexicalHistoryPlugin />
        <LexicalTreeViewPlugin
          view-class-name="tree-view-output"
          time-travel-panel-class-name="debug-timetravel-panel"
          time-travel-button-class-name="debug-timetravel-button"
          time-travel-panel-slider-class-name="debug-timetravel-panel-slider"
          time-travel-panel-button-class-name="debug-timetravel-panel-button"
        />
      </div>
      <!-- <Test /> -->
    </LexicalComposer>
  </div>
</template>
