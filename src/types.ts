import type {
  EditorState,
  EditorThemeClasses,
  HTMLConfig,
  Klass,
  LexicalEditor,
  LexicalNode,
  LexicalNodeReplacement,
} from 'lexical'

export type InitialEditorStateType =
  | null
  | string
  | EditorState
  | ((editor: LexicalEditor) => void)

export type InitialConfigType = Readonly<{
  namespace: string
  nodes?: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement>
  onError: (error: Error, editor: LexicalEditor) => void
  editable?: boolean
  theme?: EditorThemeClasses
  editorState?: InitialEditorStateType
  html?: HTMLConfig
}>
