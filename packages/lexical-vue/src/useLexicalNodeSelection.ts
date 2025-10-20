import type { LexicalEditor, NodeKey } from 'lexical'

import type { MaybeRefOrGetter } from 'vue'
import {
  $createNodeSelection,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
} from 'lexical'
import { readonly, ref, toValue, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

function isNodeSelected(editor: LexicalEditor, key: NodeKey): boolean {
  return editor.getEditorState().read(() => {
    const node = $getNodeByKey(key)
    if (node === null)
      return false

    return node.isSelected()
  })
}

export function useLexicalNodeSelection(
  key: MaybeRefOrGetter<NodeKey>,
) {
  const editor = useLexicalComposer()
  const isSelected = ref(isNodeSelected(editor, toValue(key)))

  watchEffect((onInvalidate) => {
    const unregister = editor.registerUpdateListener(() => {
      isSelected.value = isNodeSelected(editor, toValue(key))
    })

    onInvalidate(unregister)
  })

  const setSelected = (selected: boolean) => {
    editor.update(() => {
      let selection = $getSelection()

      if (!$isNodeSelection(selection)) {
        selection = $createNodeSelection()
        $setSelection(selection)
      }
      if ($isNodeSelection(selection)) {
        if (selected)
          selection.add(toValue(key))
        else
          selection.delete(toValue(key))
      }
    })
  }

  const clearSelection = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isNodeSelection(selection))
        (selection).clear()
    })
  }

  return [
    readonly(isSelected),
    setSelected,
    clearSelection,
  ]
}
