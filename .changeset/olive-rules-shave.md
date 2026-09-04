---
'lexical-vue': patch
---

Upgrade to lexical 0.50.0 and port the upstream fixes to the hooks lexical-vue maintains its own copies of.

- `useLexicalNodeSelection`: `setSelected(false)` on a node the selection does not cover no longer discards the user's caret. This is reachable from `HorizontalRuleNode` and `BlockWithAlignableContents`, which both use the `clearSelection()` then `setSelected(!isSelected)` toggle.
- `CharacterLimitPlugin`: the remaining count and the `OverflowNode` wrapping are now derived from content already in the editor, instead of staying at their initial values until the next keystroke.
- `useLexicalIsTextContentEmpty`: changing `trim` re-derives the answer instead of reporting the previous one until the next edit.
- `useMenuAnchorRef`: the typeahead and node menus position correctly when an ancestor establishes a containing block, which happens whenever a `parent` is passed and for any ancestor with a transform, filter, containment or `will-change`. Previously the menu was placed at that ancestor's offset rather than at the caret.
- `CollaborationPlugin`: the bootstrap write is marked on the binding, keeping the first edit after a failed bootstrap in the undo stack.

No public API changed and nothing we import from lexical was removed in 0.50.0.
