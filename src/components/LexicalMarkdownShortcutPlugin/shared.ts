import type { ElementTransformer } from '@lexical/markdown'
import type { LexicalNode } from 'lexical'
import { $createHorizontalRuleNode, $isHorizontalRuleNode, HorizontalRuleNode } from '../LexicalHorizontalRuleNode'

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
