import type { LexicalEditor } from 'lexical'
import { registerDragonSupport } from '@lexical/dragon'
import { registerPlainText } from '@lexical/plain-text'
import { mergeRegister } from '@lexical/utils'
import { onMounted, onUnmounted } from 'vue'

export function usePlainTextSetup(editor: LexicalEditor) {
  onMounted(() => {
    const unregister = mergeRegister(
      registerPlainText(editor),
      registerDragonSupport(editor),
    )

    onUnmounted(unregister)
  })
}
