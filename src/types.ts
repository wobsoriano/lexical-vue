import type { Ref } from 'vue'
import type { EditorState, LexicalEditor } from 'lexical'

export type MaybeRef<T> = Ref<T> | T

export type InitialEditorStateType =
  | null
  | string
  | EditorState
  | ((editor: LexicalEditor) => void)
