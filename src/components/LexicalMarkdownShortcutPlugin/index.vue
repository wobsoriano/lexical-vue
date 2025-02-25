<script lang="ts" setup>
import { TRANSFORMERS, registerMarkdownShortcuts } from '@lexical/markdown'
import type { Transformer } from '@lexical/markdown'
import { useLexicalComposer } from '../../composables'
import { useMounted } from '../../composables/useMounted'
import { HR } from './shared'

const props = withDefaults(defineProps<{
  transformers?: Transformer[]
}>(), {
  transformers: () => [HR, ...TRANSFORMERS],
})
const editor = useLexicalComposer()

useMounted(() => {
  return registerMarkdownShortcuts(editor, props.transformers)
})
</script>

<template />
