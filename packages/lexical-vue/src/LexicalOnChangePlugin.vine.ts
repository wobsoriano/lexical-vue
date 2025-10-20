import type { EditorState, LexicalEditor } from 'lexical'
import { HISTORY_MERGE_TAG } from 'lexical'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './composables'

export function LexicalOnChangePlugin({
  ignoreSelectionChange = false,
  ignoreHistoryMergeTagChange = true,
}: {
  ignoreSelectionChange?: boolean
  ignoreHistoryMergeTagChange?: boolean
}) {
  const editor = useLexicalComposer()

  const emit = vineEmits<{
    change: [editorState: EditorState, editor: LexicalEditor, tags: Set<string>]
  }>()

  watchEffect((onInvalidate) => {
    const unregister = editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
      if (
        (ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0)
        || (ignoreHistoryMergeTagChange && tags.has(HISTORY_MERGE_TAG))
        || prevEditorState.isEmpty()
      ) {
        return
      }

      emit('change', editorState, editor, tags)
    })

    onInvalidate(unregister)
  })

  return vine``
}
