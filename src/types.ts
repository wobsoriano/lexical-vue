import type { EditorState, LexicalEditor } from 'lexical'

export type InitialEditorStateType =
  | null
  | string
  | EditorState
  | ((editor: LexicalEditor) => void)
