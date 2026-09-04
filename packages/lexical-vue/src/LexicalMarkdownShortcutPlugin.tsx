import type { ElementTransformer, Transformer } from '@lexical/markdown'
import type { LexicalNode } from 'lexical'
import { registerMarkdownShortcuts, TRANSFORMERS } from '@lexical/markdown'
import { defineComponent, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from './LexicalHorizontalRuleNode'

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
    } else {
      parentNode.insertBefore(line)
    }

    line.selectNext()
  },
  triggerOnEnter: true,
  type: 'element',
}

export const DEFAULT_TRANSFORMERS = [HR, ...TRANSFORMERS]

export const MarkdownShortcutPlugin = defineComponent(
  (props: { transformers?: Transformer[] }) => {
    const editor = useLexicalComposer()

    watchEffect((onInvalidate) => {
      const unregister = registerMarkdownShortcuts(editor, props.transformers!)

      onInvalidate(unregister)
    })

    return () => null
  },
  {
    name: 'MarkdownShortcutPlugin',
    props: { transformers: { default: () => DEFAULT_TRANSFORMERS } },
  },
)
