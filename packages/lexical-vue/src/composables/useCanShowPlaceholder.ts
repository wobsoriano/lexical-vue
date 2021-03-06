import { onUnmounted, readonly, ref } from 'vue'
import { $canShowPlaceholderCurry } from '@lexical/text'
import type { LexicalEditor } from 'lexical'

export function useCanShowPlaceholder(editor: LexicalEditor) {
  const initialState = editor
    .getEditorState()
    .read($canShowPlaceholderCurry(editor.isComposing()))

  const canShowPlaceholder = ref(initialState)

  const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
    const isComposing = editor.isComposing()
    canShowPlaceholder.value = editorState.read(
      $canShowPlaceholderCurry(isComposing),
    )
  })

  onUnmounted(() => {
    unregisterListener()
  })

  return readonly(canShowPlaceholder)
}
