<script lang="ts" setup>
import { TRANSFORMERS, registerMarkdownShortcuts } from '@lexical/markdown'
import type { ElementTransformer, Transformer } from '@lexical/markdown'
import type { LexicalNode } from 'lexical'
import { useLexicalComposer } from '../composables'
import { useMounted } from '../composables/useMounted'
import { $createHorizontalRuleNode, $isHorizontalRuleNode, HorizontalRuleNode } from './LexicalHorizontalRuleNode'

const props = withDefaults(defineProps<{
  transformers?: Transformer[]
}>(), {
  // eslint-disable-next-line ts/no-use-before-define
  transformers: () => [HR, ...TRANSFORMERS],
})
const editor = useLexicalComposer()

const HR: ElementTransformer = {
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

useMounted(() => {
  return registerMarkdownShortcuts(editor, props.transformers)
})
</script>

<template />
