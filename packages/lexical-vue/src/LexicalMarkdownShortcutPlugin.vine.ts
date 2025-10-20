import type { ElementTransformer, Transformer } from '@lexical/markdown'
import type { LexicalNode } from 'lexical'
import { registerMarkdownShortcuts, TRANSFORMERS } from '@lexical/markdown'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { $createHorizontalRuleNode, $isHorizontalRuleNode, HorizontalRuleNode } from './LexicalHorizontalRuleNode'

export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    return $isHorizontalRuleNode(node) ? '***' : null
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode()

    // TODO: Get rid of isImport flag
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line)
    }
    else {
      parentNode.insertBefore(line)
    }

    line.selectNext()
  },
  type: 'element',
}

export const DEFAULT_TRANSFORMERS = [HR, ...TRANSFORMERS]

export function LexicalMarkdownShortcutPlugin({
  transformers = DEFAULT_TRANSFORMERS,
}: {
  transformers: Transformer[]
}) {
  const editor = useLexicalComposer()

  watchEffect((onInvalidate) => {
    const unregister = registerMarkdownShortcuts(editor, transformers)

    onInvalidate(unregister)
  })

  return vine``
}
