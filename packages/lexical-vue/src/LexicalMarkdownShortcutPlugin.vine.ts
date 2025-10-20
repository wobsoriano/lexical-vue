import type { ElementTransformer, Transformer } from '@lexical/markdown'
import type { LexicalNode } from 'lexical'
import { registerMarkdownShortcuts, TRANSFORMERS } from '@lexical/markdown'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './composables'
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

export function LexicalMarkdownShortcutPlugin() {
  const editor = useLexicalComposer()

  const transformers = vineProp.withDefault<Transformer[]>(DEFAULT_TRANSFORMERS)

  watchEffect((onInvalidate) => {
    const unregister = registerMarkdownShortcuts(editor, transformers.value)

    onInvalidate(unregister)
  })

  return vine``
}
