import { registerDragonSupport } from '@lexical/dragon'
import { registerRichText } from '@lexical/rich-text'
import { mergeRegister } from '@lexical/utils'
import type { LexicalEditor } from 'lexical'
import { onUnmounted } from 'vue'

export function useRichTextSetup(editor: LexicalEditor) {
  const unsub = mergeRegister(
    registerRichText(editor),
    registerDragonSupport(editor),
  )

  onUnmounted(() => {
    unsub()
  })
}
