import { onUnmounted, readonly, ref } from 'vue'
import { $canShowPlaceholderCurry } from '@lexical/text'
import { useEditor } from './useEditor'

export function useCanShowPlaceholder() {
  const editor = useEditor()
  const initialState = editor
    .getEditorState()
    .read($canShowPlaceholderCurry(editor.isComposing()))

  const canShowPlaceholder = ref(initialState)

  const unsub = editor.registerUpdateListener(({ editorState }) => {
    const isComposing = editor.isComposing()
    canShowPlaceholder.value = editorState.read(
      $canShowPlaceholderCurry(isComposing),
    )
  })

  onUnmounted(() => {
    unsub()
  })

  return readonly(canShowPlaceholder)
}
