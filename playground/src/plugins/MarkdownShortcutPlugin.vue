<script lang="ts" setup>
import { LexicalMarkdownShortcutPlugin } from 'lexical-vue'
import type {
  Transformer,
} from '@lexical/markdown'
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from '@lexical/markdown'

const PLAYGROUND_TRANSFORMERS: Transformer[] = [
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
]
</script>

<template>
  <LexicalMarkdownShortcutPlugin :transformers="PLAYGROUND_TRANSFORMERS" />
</template>
