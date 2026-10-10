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
import { LexicalComposer } from 'lexical-vue/LexicalComposer'
import { ContentEditable } from 'lexical-vue/LexicalContentEditable'
import { RichTextPlugin } from 'lexical-vue/LexicalRichTextPlugin'
import { AutoFocusPlugin } from 'lexical-vue/LexicalAutoFocusPlugin'
import { CollaborationPlugin } from 'lexical-vue/LexicalCollaborationPlugin'
import { ref } from 'vue'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

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
  theme: {},
  onError,
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
  <LexicalComposer :initial-config="config">
    <div ref="cursorsContainerRef" class="editor-container">
      <div class="editor-inner">
        <RichTextPlugin>
          <template #contentEditable>
            <ContentEditable class="editor-input" />
          </template>
          <template #placeholder>
            <div class="editor-placeholder">Enter some collaboration text...</div>
          </template>
        </RichTextPlugin>
        <AutoFocusPlugin />
        <CollaborationPlugin
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

## Experimental V2 collaboration

`CollaborationPluginV2__EXPERIMENTAL` uses Lexical's experimental V2 Yjs binding.
It accepts an existing `doc` and `provider` instead of a `providerFactory`:

```vue
<script setup lang="ts">
import { CollaborationPluginV2__EXPERIMENTAL } from 'lexical-vue/LexicalCollaborationPlugin'
</script>

<!-- Inside your editor composer, alongside ContentEditable/RichTextPlugin. -->
<template>
  <CollaborationPluginV2__EXPERIMENTAL
    :id="documentId"
    :doc="doc"
    :provider="provider"
    :username="username"
  />
</template>
```

The example assumes your application supplies those values. The provider must use
the same Yjs document. The plugin connects/disconnects the provider; the caller is
responsible for destroying its provider and document when no longer needed.

- Disable automatic editor initialization: use `editorState: null` with
  `LexicalComposer`, or `$initialEditorState: null` with `LexicalExtensionComposer`.
  Do not also mount `HistoryPlugin`; collaboration provides undo/redo.
- Initialize shared content once, preferably on the server. An empty root is not
  seeded on mount. `:__should-bootstrap-unsafe="true"` explicitly allows seeding
  after the provider reports sync, but **at most one client** may opt in per
  document. Concurrent clients inserting initial paragraphs retain both inserts.
- `rootName` defaults to `'root-v2'`. `getXmlElement(doc)` overrides it for a nested
  root. Return an integrated element created with `new Y.XmlElement()` without a
  node name. It must already exist locally: the resolver runs before the provider
  connects. Resolve the same root each time; do not bind the same root object to
  multiple live editors. Each collaborating client uses its own Yjs document.
- To switch documents, providers, or roots, **remount the entire editor** using a
  Vue `:key` on its owning component. Remounting only the collaboration plugin
  retains the old editor content and can copy it into the new root.
- Pre-populated local roots are hydrated on mount. Empty roots remain untouched
  unless explicitly bootstrapped. V2 uses a different shared structure from V1;
  switching plugins is not a migration of existing V1 Yjs data.

The V2 API is experimental and may change in a future release.
