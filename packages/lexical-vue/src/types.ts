import type { EditorState, LexicalEditor } from 'lexical'

export type InitialEditorStateType = null | string | EditorState | ((editor: LexicalEditor) => void)

/**
 * Vue only infers a component's generic parameter from a construct signature,
 * so a generic component is declared as
 * `new <T>(props: Attrs<T>) => GenericComponentInstance<Attrs<T>, Slots<T>>`.
 */
export interface GenericComponentInstance<Attrs, Slots> {
  $props: Attrs
  $slots: Slots
}
