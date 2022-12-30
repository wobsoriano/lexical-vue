import type { LexicalEditor, NodeKey } from 'lexical'

import {
  $createNodeSelection,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
} from 'lexical'
import { readonly, ref, unref, watchPostEffect } from 'vue'
import type { MaybeRef } from '../types'
import { useEditor } from './useEditor'

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
  const editor = useEditor()
  const isSelected = ref(isNodeSelected(editor, unref(key)))

  watchPostEffect((onInvalidate) => {
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
      const realKeyVal = unref(key)
      if (!$isNodeSelection(selection)) {
        selection = $createNodeSelection()
        $setSelection(selection)
      }
      if (selected)
        (selection).add(realKeyVal)
      else
        (selection).delete(realKeyVal)
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
