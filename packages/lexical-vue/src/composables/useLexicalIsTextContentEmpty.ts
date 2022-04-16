import { onUnmounted, readonly, ref } from 'vue'
import { $isRootTextContentEmptyCurry } from '@lexical/text'
import type { LexicalEditor } from 'lexical'

export function useLexicalIsTextContentEmpty(editor: LexicalEditor, trim?: boolean) {
  const isEmpty = ref(
    editor
      .getEditorState()
      .read($isRootTextContentEmptyCurry(editor.isComposing(), trim)),
  )

  const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
    const isComposing = editor.isComposing()
    isEmpty.value = editorState.read(
      $isRootTextContentEmptyCurry(isComposing, trim),
    )
  })

  onUnmounted(() => {
    unregisterListener()
  })

  return readonly(isEmpty)
}
