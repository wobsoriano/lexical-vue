<script lang="ts" setup>
import { TRANSFORMERS, registerMarkdownShortcuts } from '@lexical/markdown'
import type { Transformer } from '@lexical/markdown'
import { useLexicalComposer } from '../composables'
import { useMounted } from '../composables/useMounted'

const props = withDefaults(defineProps<{
  transformers?: Transformer[]
}>(), {
  transformers: () => [...TRANSFORMERS],
})
const editor = useLexicalComposer()

useMounted(() => {
  return registerMarkdownShortcuts(editor, props.transformers)
})
</script>

<template />
