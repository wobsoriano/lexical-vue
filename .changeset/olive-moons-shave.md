---
'lexical-vue': minor
---

Add `VueExtension`, the channel through which a Lexical extension contributes Vue UI, and fix `LexicalExtensionComposer` rendering no decorator nodes. Images, embeds and other `DecoratorNode` content rendered nothing under the extension composer, because the only decorator host in the package lived inside `RichTextPlugin`, which an extension-built editor does not need.
