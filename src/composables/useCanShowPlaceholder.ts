import { onMounted, onUnmounted, readonly, ref } from 'vue'
import { $canShowPlaceholderCurry } from '@lexical/text'
import type { LexicalEditor } from 'lexical'
import { mergeRegister } from '@lexical/utils'

function canShowPlaceholderFromCurrentEditorState(
  editor: LexicalEditor,
): boolean {
  const currentCanShowPlaceholder = editor
    .getEditorState()
    .read($canShowPlaceholderCurry(editor.isComposing()))

  return currentCanShowPlaceholder
}

export function useCanShowPlaceholder(editor: LexicalEditor) {
  const initialState = editor
    .getEditorState()
    .read($canShowPlaceholderCurry(editor.isComposing()))

  const canShowPlaceholder = ref(initialState)

  function resetCanShowPlaceholder() {
    const currentCanShowPlaceholder
    = canShowPlaceholderFromCurrentEditorState(editor)
    canShowPlaceholder.value = currentCanShowPlaceholder
  }

  let unregisterListener: () => void

  onMounted(() => {
    unregisterListener = mergeRegister(
      editor.registerUpdateListener(() => {
        resetCanShowPlaceholder()
      }),
      editor.registerEditableListener(() => {
        resetCanShowPlaceholder()
      }),
    )
  })

  onUnmounted(() => {
    unregisterListener()
  })

  return readonly(canShowPlaceholder)
}
