---
'lexical-vue': patch
---

Stop rendering invalid attributes on `ContentEditable`, and let fall-through attributes reach the element.

The element's props type spread `Omit<HTMLAttributes, ...>`, which expanded into 146 runtime props. Every Boolean among them defaulted to `false` and was written onto the DOM, so the editor rendered 19 invalid camelCase attributes (`arialabel`, `ariaatomic`, `ariabusy` and the rest) plus `aria-invalid`, `aria-multiline`, `aria-required` and `draggable` set to `"false"` that no caller asked for. Those are gone.

`ContentEditable` also rendered two root nodes, so Vue could not auto-inherit attributes and silently dropped anything outside `HTMLAttributes`, including every `data-*` attribute. They now reach the element.

Components are authored as TSX render functions instead of Vue Vine. Public types are unchanged, generics included, and `vue-vine` is no longer a runtime dependency.
