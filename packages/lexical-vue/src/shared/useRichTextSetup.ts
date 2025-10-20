import type { LexicalEditor } from 'lexical'
import { registerDragonSupport } from '@lexical/dragon'
import { registerRichText } from '@lexical/rich-text'
import { mergeRegister } from '@lexical/utils'
import { onMounted, onUnmounted } from 'vue'

export function useRichTextSetup(editor: LexicalEditor) {
  onMounted(() => {
    const unregister = mergeRegister(
      registerRichText(editor),
      registerDragonSupport(editor),
    )

    onUnmounted(unregister)
  })
}
