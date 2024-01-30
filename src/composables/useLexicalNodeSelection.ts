import type { LexicalEditor, NodeKey } from 'lexical'

import {
  $createNodeSelection,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
} from 'lexical'
import { type MaybeRef, readonly, ref, unref, watchEffect } from 'vue'
import { useLexicalComposer } from './useLexicalComposer'

function isNodeSelected(editor: LexicalEditor, key: NodeKey): boolean {
  return editor.getEditorState().read(() => {
    const node = $getNodeByKey(key)
    if (node === null)
      return false

    return node.isSelected()
  })
}

export function useLexicalNodeSelection(
  key: MaybeRef<NodeKey>,
) {
  const editor = useLexicalComposer()
  const isSelected = ref(isNodeSelected(editor, unref(key)))

  watchEffect((onInvalidate) => {
    const unregisterListener = editor.registerUpdateListener(() => {
      isSelected.value = isNodeSelected(editor, unref(key))
    })

    onInvalidate(() => {
      unregisterListener()
    })
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
          selection.add(unref(key))
        else
          selection.delete(unref(key))
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

  return {
    isSelected: readonly(isSelected),
    setSelected,
    clearSelection,
  }
}
