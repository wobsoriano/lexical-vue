# lexical-vue

## 0.16.0

### Minor Changes

- 7f33ce7: Upgrade to lexical 0.50.0 and port the upstream bug fixes to the hooks lexical-vue keeps its own copy of.

## 0.15.1

### Patch Changes

- 9083324: Declare `yjs` as an optional peer dependency. The collaboration plugin imports it, but it was only listed under `devDependencies`, which left bundlers no signal to keep it external.
- c653763: Stop rendering invalid attributes on `ContentEditable`, and let fall-through attributes reach the element.

  The element's props type spread `Omit<HTMLAttributes, ...>`, which expanded into 146 runtime props. Every Boolean among them defaulted to `false` and was written onto the DOM, so the editor rendered 19 invalid camelCase attributes (`arialabel`, `ariaatomic`, `ariabusy` and the rest) plus `aria-invalid`, `aria-multiline`, `aria-required` and `draggable` set to `"false"` that no caller asked for. Those are gone.

  `ContentEditable` also rendered two root nodes, so Vue could not auto-inherit attributes and silently dropped anything outside `HTMLAttributes`, including every `data-*` attribute. They now reach the element.

  Components are authored as TSX render functions instead of Vue Vine. Public types are unchanged, generics included, and `vue-vine` is no longer a runtime dependency.

## 0.15.0

### Minor Changes

- 78409cd: Bump Lexical dependencies to 0.49.0

  - Fix collaboration setup and cleanup so the Yjs provider and binding are not recreated while the editor is open
  - Fix ContentEditable props, including support for `spellcheck="false"`
  - Fix HashtagPlugin registering editor history instead of hashtag support
  - Fix HorizontalRulePlugin inserting the base node instead of the lexical-vue node
  - Fix menu closing, keyboard controls, item preselection, and active item attributes
  - Fix selected styles not updating for alignable blocks

## 0.14.1

### Patch Changes

- ac4bf81: Switch to OIDC for npm publishing

## 0.14.0

### Minor Changes

- 4b53351: Bump Lexical dependencies to 0.38.1

## 0.13.1

### Patch Changes

- 6c74d23: Make open and close events in TypeaheadMenuPlugin optional"

## 0.13.0

### Minor Changes

- a8ea8f0: # Breaking Changes

  - Updated to Lexical 0.37.0
  - Plugin names now match React equivalents for consistency:
    - `LexicalRichTextEditor` → `RichTextEditor`
    - Other plugins follow similar naming conventions

  # New Features
  - Individual plugin imports now available to reduce bundle size:

  ```vue
  <script setup lang="ts">
  import { LexicalComposer } from 'lexical-vue/LexicalComposer'
  import { ContentEditable } from 'lexical-vue/LexicalContentEditable'
  import { HistoryPlugin } from 'lexical-vue/LexicalHistoryPlugin'
  import { PlainTextPlugin } from 'lexical-vue/LexicalPlainTextPlugin'

  const config = {
    // config
  }
  </script>

  <template>
    <LexicalComposer :initial-config="config">
      <PlainTextPlugin>
        <template #contentEditable>
          <ContentEditable>
            <template #placeholder>
              <div>Enter some text...</div>
            </template>
          </ContentEditable>
        </template>
      </PlainTextPlugin>
      <HistoryPlugin />
    </LexicalComposer>
  </template>
  ```

  - Added `<SelectionAlwaysOnDisplay />` and `<TableOfContentsPlugin />` plugins
