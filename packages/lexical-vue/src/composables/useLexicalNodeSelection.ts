import type { LexicalEditor, NodeKey } from 'lexical'

import {
  $createNodeSelection,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
} from 'lexical'
import { type MaybeRefOrGetter, readonly, ref, toValue, watchEffect } from 'vue'
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
  key: MaybeRefOrGetter<NodeKey>,
) {
  const editor = useLexicalComposer()
  const isSelected = ref(isNodeSelected(editor, toValue(key)))

  watchEffect((onInvalidate) => {
    const unregisterListener = editor.registerUpdateListener(() => {
      isSelected.value = isNodeSelected(editor, toValue(key))
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

  return {
    isSelected: readonly(isSelected),
    setSelected,
    clearSelection,
  }
}
