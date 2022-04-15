<script setup lang="ts">
import type { EditorState } from 'lexical'
import { $getRoot, $getSelection } from 'lexical'
import {
  LexicalAutoFocusPlugin,
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

const onChange = (editorState: EditorState) => {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot()
    const selection = $getSelection()

    console.log(root, selection)
  })
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
        <LexicalOnChangePlugin @change="onChange" />
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
    <div className="other">
      <h2>View source</h2>
      <ul>
        <li>
          <a
            href="https://github.com/wobsoriano/lexical-vue/tree/master/examples/plain-text"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
