<script setup lang="ts">
import {
  LexicalAutoFocusPlugin,
  LexicalComposer,
  LexicalContentEditable,
  LexicalHistoryPlugin,
  LexicalOnChangePlugin,
  LexicalPlainTextPlugin,
  LexicalTreeViewPlugin,
} from 'lexical-vue'
import { ref, watch } from 'vue'
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

const model = ref('')

watch(model, (val) => {
  console.log('Editor value:', val)
})
</script>

<template>
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
    </div>
    <!-- <Test /> -->
  </LexicalComposer>
</template>
