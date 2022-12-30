<script lang="ts" setup>
import { TRANSFORMERS, registerMarkdownShortcuts } from '@lexical/markdown'
import type { Transformer } from '@lexical/markdown'
import { defineProps, onMounted, onUnmounted } from 'vue'
import { useEditor } from '../composables/useEditor'

const props = withDefaults(defineProps<{
  transformers?: Transformer[]
}>(), {
  transformers: () => [...TRANSFORMERS],
})
const editor = useEditor()

let unregisterListener: () => void

onMounted(() => {
  unregisterListener = registerMarkdownShortcuts(editor, props.transformers)
})

onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template />
