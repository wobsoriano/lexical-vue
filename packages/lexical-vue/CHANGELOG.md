# lexical-vue

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
  import { LexicalComposer } from "lexical-vue/LexicalComposer";
  import { ContentEditable } from "lexical-vue/LexicalContentEditable";
  import { HistoryPlugin } from "lexical-vue/LexicalHistoryPlugin";
  import { PlainTextPlugin } from "lexical-vue/LexicalPlainTextPlugin";

  const config = {
    // config
  };
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
