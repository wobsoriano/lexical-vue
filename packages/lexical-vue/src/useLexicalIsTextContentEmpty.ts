import type { LexicalEditor } from 'lexical'
import type { MaybeRefOrGetter } from 'vue'
import { $isRootTextContentEmptyCurry } from '@lexical/text'
import { readonly, shallowRef, toValue, watchEffect } from 'vue'

export function useLexicalIsTextContentEmpty(
  editor: LexicalEditor,
  trim?: MaybeRefOrGetter<boolean>,
) {
  const isEmpty = shallowRef(
    editor.read('latest', $isRootTextContentEmptyCurry(editor.isComposing(), toValue(trim))),
  )

  watchEffect((onInvalidate) => {
    // Reading trim here is what tracks it, and re-deriving is what keeps the
    // answer current: registerUpdateListener does not fire on registration, so
    // a new trim would otherwise report the previous answer until the next edit.
    const trimmed = toValue(trim)
    isEmpty.value = editor.read(
      'latest',
      $isRootTextContentEmptyCurry(editor.isComposing(), trimmed),
    )

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      const isComposing = editor.isComposing()
      isEmpty.value = editorState.read($isRootTextContentEmptyCurry(isComposing, trimmed))
    })

    onInvalidate(unregister)
  })

  return readonly(isEmpty)
}
