import type { LexicalEditor, NodeKey, NodeSelection } from 'lexical'

import {
  $createNodeSelection,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
} from 'lexical'
import type { Ref } from 'vue'
import { onUnmounted, ref, watchEffect } from 'vue'
import { getRealValue } from '../utils'
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
  key: Ref<NodeKey> | NodeKey,
) {
  const editor = useEditor()
  const isSelected = ref(isNodeSelected(editor, getRealValue(key)))
  let unregisterListener: () => void

  watchEffect((onInvalidate) => {
    unregisterListener = editor.registerUpdateListener(() => {
      isSelected.value = isNodeSelected(editor, getRealValue(key))
    })

    onInvalidate(() => {
      unregisterListener()
    })
  })

  onUnmounted(() => {
    unregisterListener?.()
  })

  const setSelected = (selected: boolean) => {
    editor.update(() => {
      let selection = $getSelection()
      const realKeyVal = getRealValue(key)
      if (!$isNodeSelection(selection)) {
        selection = $createNodeSelection()
        $setSelection(selection)
      }
      if (selected)
        (selection as NodeSelection).add(realKeyVal)
      else
        (selection as NodeSelection).delete(realKeyVal)
    })
  }

  const clearSelected = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isNodeSelection(selection))
        (selection as NodeSelection).clear()
    })
  }

  return {
    isSelected,
    setSelected,
    clearSelected,
  }
}
