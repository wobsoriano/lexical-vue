import { registerDragonSupport } from '@lexical/dragon'
import { registerPlainText } from '@lexical/plain-text'
import { mergeRegister } from '@lexical/utils'
import type { EditorState, LexicalEditor } from 'lexical'
import { onUnmounted } from 'vue'

export function usePlainTextSetup(editor: LexicalEditor, initialEditorState?: null | string | EditorState | (() => void)) {
  const unsub = mergeRegister(
    registerPlainText(editor, initialEditorState),
    registerDragonSupport(editor),
  )

  onUnmounted(() => {
    unsub()
  })
}
