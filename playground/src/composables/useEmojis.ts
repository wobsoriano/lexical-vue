/*!
 * Original code by Meta Platforms
 * MIT Licensed, Copyright (c) Meta Platforms, Inc. and affiliates, see https://github.com/facebook/lexical/blob/main/LICENSE for details
 *
 */

import type { LexicalEditor } from 'lexical'

import { TextNode } from 'lexical'

import { useEffect } from 'lexical-vue'
import { $createEmojiNode, EmojiNode } from '../components/EmojiNode'

const emojis: Map<string, [string, string]> = new Map([
  [':)', ['emoji happysmile', '🙂']],
  ['<3', ['emoji heart', '❤']],
])

function findAndTransformEmoji(node: TextNode): null | TextNode {
  const text = node.getTextContent()

  for (let i = 0; i < text.length; i++) {
    const emojiData = emojis.get(text[i]) || emojis.get(text.slice(i, i + 2))

    if (emojiData !== undefined) {
      const [emojiStyle, emojiText] = emojiData
      let targetNode

      if (i === 0)
        [targetNode] = node.splitText(i + 2)

      else
        [, targetNode] = node.splitText(i, i + 2)

      const emojiNode = $createEmojiNode(emojiStyle, emojiText)
      targetNode.replace(emojiNode)
      return emojiNode
    }
  }

  return null
}

function textNodeTransform(node: TextNode): void {
  let targetNode: TextNode | null = node

  while (targetNode !== null) {
    if (!targetNode.isSimpleText())
      return

    targetNode = findAndTransformEmoji(targetNode)
  }
}

export default function useEmojis(editor: LexicalEditor): void {
  useEffect(() => {
    if (!editor.hasNodes([EmojiNode]))
      throw new Error('EmojisPlugin: EmojiNode not registered on editor')

    return editor.registerNodeTransform(TextNode, textNodeTransform)
  })
}
