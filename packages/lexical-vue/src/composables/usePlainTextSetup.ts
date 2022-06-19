import { registerDragonSupport } from '@lexical/dragon'
import type { InitialEditorStateType } from '@lexical/plain-text'
import { registerPlainText } from '@lexical/plain-text'
import { mergeRegister } from '@lexical/utils'
import type { LexicalEditor } from 'lexical'
import { onUnmounted } from 'vue'

export function usePlainTextSetup(editor: LexicalEditor, initialEditorState?: InitialEditorStateType) {
  const unsub = mergeRegister(
    registerPlainText(editor, initialEditorState),
    registerDragonSupport(editor),
  )

  onUnmounted(() => {
    unsub()
  })
}
