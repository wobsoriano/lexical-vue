<script setup lang="ts">
import {
  LexicalCollaborationPlugin,
  LexicalComposer,
  LexicalContentEditable,
  LexicalPlainTextPlugin,
} from 'lexical-vue'
import { Doc } from 'yjs'
import { WebsocketProvider } from 'y-websocket'

import exampleTheme from '../themes/example'

// TODO IVAN: important that config.editorState is null and that LexicalCollaborationPlugin should-bootstrap
// TODO IVAN: clean up this example
const config = {
  editorState: null,
  editable: true,
  namespace: 'Demo',
  theme: exampleTheme,
}

function onError(error: Error) {
  throw error
}

function providerFactory(id: string, yjsDocMap: Map<string, Doc>) {
  let doc = yjsDocMap.get(id)

  if (doc === undefined) {
    doc = new Doc()
    yjsDocMap.set(id, doc)
  }
  else {
    doc.load()
  }

  return new WebsocketProvider(
    'ws://localhost:1234',
    `playground/0/${id}`,
    doc,
  )
}
</script>

<template>
  <LexicalComposer :initial-config="config" @error="onError">
    <div class="editor-container">
      <div className="editor-inner">
        <LexicalPlainTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input" />
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Placeholder
            </div>
          </template>
        </LexicalPlainTextPlugin>
        <LexicalCollaborationPlugin
          id="main"
          :provider-factory="providerFactory"
          should-bootstrap
        />
      </div>
    </div>
  </LexicalComposer>
</template>
