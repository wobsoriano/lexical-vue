import { registerDragonSupport } from '@lexical/dragon'
import { registerPlainText } from '@lexical/plain-text'
import { mergeRegister } from '@lexical/utils'
import type { LexicalEditor } from 'lexical'
import { onUnmounted } from 'vue'

export function usePlainTextSetup(editor: LexicalEditor) {
  const unsub = mergeRegister(
    registerPlainText(editor),
    registerDragonSupport(editor),
  )

  onUnmounted(() => {
    unsub()
  })
}
