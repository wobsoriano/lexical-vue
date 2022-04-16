import type { EntityMatch } from '@lexical/text'
import type { TextNode } from 'lexical'

import { registerLexicalTextEntity } from '@lexical/text'
import { mergeRegister } from '@lexical/utils'
import { onMounted, onUnmounted } from 'vue'
import { useEditor } from './useEditor'

export function useLexicalTextEntity<N extends TextNode>(
  getMatch: (text: string) => null | EntityMatch,
  targetNode: N,
  createNode: (textNode: TextNode) => N,
): void {
  const editor = useEditor()
  let unregisterListener: () => void

  onMounted(() => {
    unregisterListener = mergeRegister(
      ...registerLexicalTextEntity(editor, getMatch, targetNode, createNode),
    )
  })

  onUnmounted(() => {
    unregisterListener?.()
  })
}
