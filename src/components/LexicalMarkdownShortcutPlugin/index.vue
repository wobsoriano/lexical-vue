<script lang="ts" setup>
import { registerMarkdownShortcuts } from '@lexical/markdown'
import type { Transformer } from '@lexical/markdown'
import { watchEffect } from 'vue'
import { useLexicalComposer } from '../../composables'
import { DEFAULT_TRANSFORMERS } from './shared'

const props = withDefaults(defineProps<{
  transformers?: Transformer[]
}>(), {
  transformers: () => DEFAULT_TRANSFORMERS,
})
const editor = useLexicalComposer()

watchEffect((onInvalidate) => {
  const unregister = registerMarkdownShortcuts(editor, props.transformers)

  onInvalidate(unregister)
})
</script>

<template />
