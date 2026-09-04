import type { EditorState, LexicalEditor } from 'lexical'
import { HISTORY_MERGE_TAG } from 'lexical'
import { defineComponent, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'

export const OnChangePlugin = defineComponent(
  (
    props: { ignoreSelectionChange?: boolean; ignoreHistoryMergeTagChange?: boolean },
    ctx: {
      emit: (
        event: 'change',
        editorState: EditorState,
        editor: LexicalEditor,
        tags: Set<string>,
      ) => void
    },
  ) => {
    const editor = useLexicalComposer()

    watchEffect((onInvalidate) => {
      const unregister = editor.registerUpdateListener(
        ({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
          if (
            (props.ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0) ||
            (props.ignoreHistoryMergeTagChange && tags.has(HISTORY_MERGE_TAG)) ||
            prevEditorState.isEmpty()
          ) {
            return
          }

          ctx.emit('change', editorState, editor, tags)
        },
      )

      onInvalidate(unregister)
    })

    return () => null
  },
  {
    name: 'OnChangePlugin',
    props: {
      ignoreSelectionChange: { type: Boolean, default: false },
      ignoreHistoryMergeTagChange: { type: Boolean, default: true },
    },
    emits: {
      change: (_editorState: EditorState, _editor: LexicalEditor, _tags: Set<string>) => true,
    },
  },
)
