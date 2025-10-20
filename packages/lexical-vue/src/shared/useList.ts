import type { LexicalEditor } from 'lexical'

import { registerList } from '@lexical/list'
import { onMounted, onUnmounted } from 'vue'

export function useList(editor: LexicalEditor) {
  onMounted(() => {
    const unregister = registerList(editor)

    onUnmounted(() => {
      unregister()
    })
  })
}
