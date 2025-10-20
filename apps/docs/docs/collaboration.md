# Collaboration

Below is an example of a basic plain text editor using `lexical`, `lexical-vue`, and `yjs`

Tip: you can easily run a local y-websocket server by running:
```bash
HOST=localhost PORT=1234 npx y-websocket
```

Note: You shouldn't use LexicalHistoryPlugin with LexicalCollaborationPlugin because LexicalCollaborationPlugin already has history built in.

```vue
<script setup lang="ts">
import type { LexicalEditor } from 'lexical'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import {
  LexicalAutoFocusPlugin,
  LexicalCollaborationPlugin,
  LexicalComposer,
  LexicalContentEditable,
  LexicalRichTextPlugin,
} from 'lexical-vue'
import { ref } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

import exampleTheme from '../themes/example'

const cursorsContainerRef = ref<HTMLElement | null>(null)

// Optional initial editor state in case collaborative Y.Doc won't
// have any existing data on server. Then it'll user this value to populate editor.
// It accepts same type of values as LexicalComposer editorState
// prop (json string, state object, or a function)
function initialEditorState(editor: LexicalEditor): void {
  const root = $getRoot()
  const paragraph = $createParagraphNode()
  const text = $createTextNode('Welcome to collab!')
  paragraph.append(text)
  root.append(paragraph)
}

const config = {
  // NOTE: This is critical for collaboration plugin to set editor state to null. It
  // would indicate that the editor should not try to set any default state
  // (not even empty one), and let collaboration plugin do it instead
  editorState: null as any,
  namespace: 'Demo',
  nodes: [],
  editable: true,
  theme: exampleTheme,
}

function providerFactory(id: string, yjsDocMap: Map<string, Y.Doc>) {
  const doc = new Y.Doc()
  yjsDocMap.set(id, doc)

  const provider = new WebsocketProvider('ws://localhost:1234', id, doc)

  return provider as any
}

function onError(error: Error) {
  throw error
}
</script>

<template>
  <LexicalComposer :initial-config="config" @error="onError">
    <div ref="cursorsContainerRef" class="editor-container">
      <div className="editor-inner">
        <LexicalRichTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input" />
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Enter some collaboration text...
            </div>
          </template>
        </LexicalRichTextPlugin>
        <LexicalAutoFocusPlugin />
        <LexicalCollaborationPlugin
          id="yjs-plugin"
          :provider-factory="providerFactory"
          :initial-editor-state="initialEditorState"
          :should-bootstrap="true"
          :cursors-container-ref="cursorsContainerRef"
        />
      </div>
    </div>
  </LexicalComposer>
</template>
```
