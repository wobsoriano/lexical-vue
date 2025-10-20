import type { LexicalEditor } from 'lexical'
import type { MaybeRefOrGetter } from 'vue'
import { $isRootTextContentEmptyCurry } from '@lexical/text'
import { readonly, shallowRef, toValue, watchEffect } from 'vue'

export function useLexicalIsTextContentEmpty(editor: LexicalEditor, trim?: MaybeRefOrGetter<boolean>) {
  const isEmpty = shallowRef(
    editor
      .getEditorState()
      .read($isRootTextContentEmptyCurry(editor.isComposing(), toValue(trim))),
  )

  watchEffect((onInvalidate) => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      const isComposing = editor.isComposing()
      isEmpty.value = editorState.read(
        $isRootTextContentEmptyCurry(isComposing, toValue(trim)),
      )
    })

    onInvalidate(unregister)
  })

  return readonly(isEmpty)
}
