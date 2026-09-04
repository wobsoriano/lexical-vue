import type { LexicalEditor } from 'lexical'
import { $canShowPlaceholderCurry } from '@lexical/text'
import { mergeRegister } from '@lexical/utils'
import { onMounted, onUnmounted, readonly, ref } from 'vue'

function canShowPlaceholderFromCurrentEditorState(editor: LexicalEditor): boolean {
  const currentCanShowPlaceholder = editor.read(
    'latest',
    $canShowPlaceholderCurry(editor.isComposing()),
  )

  return currentCanShowPlaceholder
}

export function useCanShowPlaceholder(editor: LexicalEditor) {
  const initialState = editor.read('latest', $canShowPlaceholderCurry(editor.isComposing()))

  const canShowPlaceholder = ref(initialState)

  function resetCanShowPlaceholder() {
    const currentCanShowPlaceholder = canShowPlaceholderFromCurrentEditorState(editor)
    canShowPlaceholder.value = currentCanShowPlaceholder
  }

  onMounted(() => {
    const unregister = mergeRegister(
      editor.registerUpdateListener(() => {
        resetCanShowPlaceholder()
      }),
      editor.registerEditableListener(() => {
        resetCanShowPlaceholder()
      }),
    )

    onUnmounted(() => {
      unregister()
    })
  })

  return readonly(canShowPlaceholder)
}
