<script lang="ts" setup>
import { LexicalMarkdownShortcutPlugin } from 'lexical-vue'
import type {
  ElementTransformer,
  TextMatchTransformer,
  Transformer,
} from '@lexical/markdown'
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from '@lexical/markdown'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { useEditor } from 'lexical-vue'
const PLAYGROUND_TRANSFORMERS: Transformer[] = [
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
]
console.log('ELEMENT_TRANSFORMERS', ELEMENT_TRANSFORMERS)

const editor = useEditor()
console.log('editor._nodes', editor._nodes)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window.nodes = editor._nodes
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window.HeadingNode = HeadingNode
</script>

<template>
  <LexicalMarkdownShortcutPlugin :transformers="PLAYGROUND_TRANSFORMERS"/>
</template>

<style scoped>

</style>
