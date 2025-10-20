import type { EntityMatch } from '@lexical/text'
import type { Klass, TextNode } from 'lexical'

import { registerLexicalTextEntity } from '@lexical/text'
import { mergeRegister } from '@lexical/utils'
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export function useLexicalTextEntity<T extends TextNode>(
  getMatch: (text: string) => null | EntityMatch,
  targetNode: Klass<T>,
  createNode: (textNode: TextNode) => T,
): void {
  const editor = useLexicalComposer()

  onMounted(() => {
    const unregister = mergeRegister(
      ...registerLexicalTextEntity(editor, getMatch, targetNode, createNode),
    )

    onUnmounted(() => {
      unregister()
    })
  })
}
