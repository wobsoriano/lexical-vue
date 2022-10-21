<script lang="ts" setup>
import { LexicalMarkdownShortcutPlugin, useEditor } from 'lexical-vue'
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
const PLAYGROUND_TRANSFORMERS: Transformer[] = [
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
]

const editor = useEditor()
</script>

<template>
  <LexicalMarkdownShortcutPlugin :transformers="PLAYGROUND_TRANSFORMERS" />
</template>

<style scoped>

</style>
