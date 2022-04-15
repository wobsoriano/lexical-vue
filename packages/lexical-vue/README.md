TODO

```vue
<template>
  <div class="App">
    <div className="editor-container">
      <LexicalComposer :initial-config="config">
        <PlainTextPlugin>
          <template #contentEditable>
            <ContentEditable />
          </template>
          <template #placeholder>
            <div className="editor-placeholder">
              Enter some plain text...
            </div>
          </template>
        </PlainTextPlugin>
        <OnChangePlugin @change="change" />
      </LexicalComposer>
    </div>
  </div>
</template>
```
