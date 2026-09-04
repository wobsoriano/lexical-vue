---
'lexical-vue': minor
---

Add `LexicalExtensionComposer`, which builds the editor from a Lexical extension instead of an `initialConfig`. Lexical extensions only work with editors created through the extension API, so before this none of them worked with lexical-vue. Existing components work unchanged inside it, and `LexicalComposer` is untouched.
