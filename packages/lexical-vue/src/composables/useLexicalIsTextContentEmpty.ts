import { readonly, ref } from 'vue'
import { $isRootTextContentEmptyCurry } from '@lexical/text'
import type { LexicalEditor } from 'lexical'
import { useMounted } from './useMounted'

export function useLexicalIsTextContentEmpty(editor: LexicalEditor, trim?: boolean) {
  const isEmpty = ref(
    editor
      .getEditorState()
      .read($isRootTextContentEmptyCurry(editor.isComposing(), trim)),
  )

  useMounted(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const isComposing = editor.isComposing()
      isEmpty.value = editorState.read(
        $isRootTextContentEmptyCurry(isComposing, trim),
      )
    })
  })

  return readonly(isEmpty)
}
